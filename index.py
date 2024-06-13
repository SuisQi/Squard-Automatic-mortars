# -*- coding : utf-8-*-SocketIO
import asyncio
import json
import os
import random
import socket
import sys
import threading
import subprocess
import time
import logging
import traceback
from functools import wraps

import requests
import websockets
from flask_socketio import SocketIO
from websockets.exceptions import ConnectionClosedOK

from API.apis import mortar_blueprint
from login import verify, display_squard, display_rule
from main import log, Squard, is_auto_fire, is_stop

from flask_cors import CORS
from flask import Flask, jsonify

from show_info import root, topmost_mail, topmost_orientation
from utils.key_mouse_listener import KeyMouseListener
from utils.map_raning import MapRanging
from utils.redis_connect import check_redis_service, redis_cli
from utils.utils import get_settings, pubsub_msgs
from websocket_.dir_websocket import start_dir_server
from websocket_.server import web_server

# 获取本机计算机名称
hostname = socket.gethostname()
# 获取本机ip
ip = socket.gethostbyname(hostname)
app = Flask(__name__)
app.register_blueprint(mortar_blueprint)
socketio = SocketIO(app, cors_allowed_origins='*')
CORS(app)


class DisableFlaskLogging():
    def __enter__(self):
        # 重定向 stdout 和 stderr 到 /dev/null
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = open(os.devnull, 'w')
        sys.stderr = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_value, traceback):
        # 恢复原始的 stdout 和 stderr
        sys.stdout.close()
        sys.stderr.close()
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr


# 设置 Flask 的日志级别为 ERROR，这样只记录错误信息
app.logger.setLevel(logging.ERROR)
# 禁用 Werkzeug 的日志
log_ = logging.getLogger('werkzeug')
log_.setLevel(logging.ERROR)

node_path = ""
if os.path.exists("./v16.9.1"):
    node_path = "v16.9.1\\"


def start_map():
    subprocess.run(f"{node_path}live-server --host={ip} --port=8000 ./templates/map/public", shell=True,
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                   text=True)


def start_control():
    subprocess.run(f"{node_path}live-server --host={ip} --port=5173 ./templates/control/dist", shell=True,
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                   text=True)


def start_socket_server():
    # 运行websocket服务器
    asyncio.run(web_server())


def listen_for_logs():
    while True:
        if pubsub_msgs:
            socketio.emit('log_message', {'data': pubsub_msgs[0]})
            pubsub_msgs.pop(0)
        time.sleep(0.01)


def fire(target, squard):
    log(f"目标方位:{round(target['dir'], 1)}，密位{target['angle']}")
    topmost_mail['set_visibility'](True)
    topmost_orientation['set_visibility'](True)
    mortarRounds = int(redis_cli.get("squad:fire_data:control:mortarRounds"))
    d_t = squard.listen_verify_orientation(round(target['dir'], 1))
    m_t = squard.listen_verify_mail(target['angle'])
    if is_auto_fire():
        squard.fire(mortarRounds, round(target['dir'], 1), target['angle'])
    else:
        d_t.join()
        m_t.join()
        time.sleep(5)

    time.sleep(random.uniform(get_settings()['afterFire'][0], get_settings()['afterFire'][0]))


def get_fire_points(userId):
    if redis_cli.exists('squad:fire_data:standard'):
        list_items = list(redis_cli.hvals('squad:fire_data:standard'))
        list_items = list(map(lambda f: json.loads(f), list_items))

    else:
        list_items = []
    return list_items


async def fire_client(squard, userId, sessionId):
    ip = redis_cli.get("squad:session:ip").decode()
    uri = f"ws://{ip}:1234"  # 更改为你想连接的WebSocket服务器的URI
    try:
        async with websockets.connect(uri) as websocket:
            async def check_is_stop():
                while not is_stop():
                    await asyncio.sleep(0.1)  # 每0.1秒检查一次
                return 'stop'

            while True:
                if is_stop():
                    break
                await websocket.send(json.dumps({
                    "command": "CONTROL",
                    "payload": {
                        "type": "GET",
                        "user_id": userId,
                        "session_id": sessionId
                    }
                }))
                # 等待响应或停止条件
                done, pending = await asyncio.wait(
                    [websocket.recv(), check_is_stop()],
                    return_when=asyncio.FIRST_COMPLETED)
                # 处理完成的任务
                for task in done:
                    result = task.result()
                    if result == 'stop':
                        return  # 退出函数
                    else:
                        res = json.loads(result)
                        targetId = res['targetId']
                        if targetId:
                            standard = redis_cli.hget("squad:fire_data:standard", targetId)
                            if not standard:
                                log(f"ID:{targetId}没有密位")
                                break
                            standard=json.loads(standard.decode())
                            # 如果不在范围内
                            if standard['angle'] == 0:
                                websocket.send(json.dumps({
                                    "command": "CONTROL",
                                    "payload": {
                                        "type": "UNFIRE",
                                        "user_id": userId,
                                        "session_id": sessionId,
                                        "targetId": targetId
                                    }
                                }))
                                log(f"ID为{targetId}的火力点不在攻击范围")
                                break
                            #     开火
                            fire(standard, squard)
                # 取消尚未完成的任务
                for task in pending:
                    task.cancel()
    except ConnectionClosedOK:
        pass


def set_fire_state():
    state = redis_cli.get("squad:fire_data:control:state")
    state = int(state)
    if state == 0:
        redis_cli.set("squad:fire_data:control:state", 1)
    else:
        redis_cli.set("squad:fire_data:control:state", 0)


def listener_click():
    m = MapRanging()
    threading.Thread(target=start_map).start()
    threading.Thread(target=start_control).start()
    k = KeyMouseListener(ctrl_action=set_fire_state,alt_action=m.start)
    k.start()


def listen_fire():
    squard = Squard()
    while True:
        try:
            userId = redis_cli.get("squad:session:userId").decode()
            synergy = redis_cli.get("squad:fire_data:control:synergy").decode()
            synergy = synergy == "1"
            list_items = get_fire_points(userId)
            # item = json.loads(list_items[0])

            if is_stop():
                topmost_mail['set_visibility'](False)
                topmost_orientation['set_visibility'](False)
                time.sleep(0.5)
                continue

            # 协同开火
            if synergy:
                sessionId = redis_cli.get("squad:session:sessionId")
                if not sessionId:
                    redis_cli.set("squad:fire_data:control:synergy",0)
                    log('没加入房间')
                    continue
                sessionId = sessionId.decode()

                asyncio.run(fire_client(squard, userId, sessionId))
                log("停火")
                redis_cli.set("squad:fire_data:control:state", 0)
                continue

            list_items = list(filter(lambda f: userId in f['userIds'], list_items))
            for item in list_items:
                if is_stop():
                    break
                fire(item, squard)
            log("停火")
            redis_cli.set("squad:fire_data:control:state", 0)
        except Exception as e:
            log(traceback.format_exc())
            print(traceback.format_exc())


def check(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        data = verify(False)
        if data['code'] != 0:
            return jsonify({
                "success": data['code'],
                "message": data['msg']
            })
        else:
            return f(*args, **kwargs)

    return wrapper


def init_settings():
    '''
    初始化各种设置

    '''
    redis_cli.set("squad:session:userId", "0")
    if not redis_cli.exists("squad:settings"):
        redis_cli.set('squad:settings', json.dumps({
            "beforeFire": [0.5, 1],
            "afterFire": [0.5, 1],
            "mail_gap": 1,
            "orientation_gap": 0.1
        }))
    trajectory_default = {
        "mail": [
            {
                "name": "方案一",
                "points": [0.25, 1.2, 0.9, 1.09],
                "num_points": 8
            }
        ],
        "orientation": [
            {
                "name": "方案一",
                "points": [0.25, 1.2, 0.9, 1.09],
                "num_points": 8
            }
        ]
    }

    redis_cli.set("squad:trajectory:default", json.dumps(trajectory_default))
    if not redis_cli.exists("squad:trajectory:custom"):
        redis_cli.set("squad:trajectory:custom", json.dumps(trajectory_default))

    # 设置默认开火轮数
    redis_cli.set('squad:fire_data:control:mortarRounds', 3)
    # 设置默认开火状态
    redis_cli.set("squad:fire_data:control:state", 0)
    # 设置是否协同开火
    redis_cli.set("squad:fire_data:control:synergy", 0)
    # 设置是否自动开火
    redis_cli.set("squad:fire_data:control:auto_fire", 1)


def run_server():
    socketio.run(app, port=8080, host='0.0.0.0', debug=False, allow_unsafe_werkzeug=True)


if __name__ == '__main__':
    # if not login():
    #     input()
    #     exit(0)
    display_rule()
    display_squard()
    check_redis_service()
    subprocess.Popen("start ./lib/rpc.exe", shell=True)
    init_settings()

    threading.Thread(target=listen_for_logs).start()

    threading.Thread(target=listen_fire).start()
    # 一直从计算器网页端获取方位密位
    # start_dir_server()
    threading.Thread(target=listener_click).start()

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # 不需要真正发送数据，所以目的地址随便设置一个不存在的地址
    s.connect(("10.255.255.255", 1))
    IP = s.getsockname()[0]
    print("请保持只有一个计算器打开，如果打开了多个，就关闭其他的然后刷新")
    print(f'将手机和电脑保持同一局域网，关闭AP隔离保护，手机浏览器打开{IP}:5173')
    print("如果你设置了自定义轨迹或者别的设置，在更新前请将该目录下的Redis-x64-5.0.14.1/dump.rdb备份，并在更新后进行替换")
    # with DisableFlaskLogging():
    threading.Thread(target=run_server).start()
    root.mainloop()
