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

from flask_socketio import SocketIO

from login import login, verify, display_squard
from main import log, Squard, stop, pubsub_msgs
from API.R import R

from flask_cors import CORS
from flask import Flask, request, jsonify

from utils.redis_connect import check_redis_service, redis_cli
from utils.utils import generate_bezier_points, calculate_nonuniform_x_coords, get_settings
from websocket_.server import web_server

# 获取本机计算机名称
hostname = socket.gethostname()
# 获取本机ip
ip = socket.gethostbyname(hostname)
app = Flask(__name__)
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


def listen_fire():
    log("启动成功")
    squard = Squard()
    while True:
        try:
            if redis_cli.exists('squad:fire_data:standard'):
                list_items = list(redis_cli.hvals('squad:fire_data:standard'))
            else:
                list_items = []
            # item = json.loads(list_items[0])

            if stop():
                time.sleep(0.5)
                continue

            for item in list_items:
                if stop():
                    break
                item = json.loads(item)
                log(f"目标方位：{round(item['dir'], 1)}，密位{item['angle']}")

                mortarRounds = int(redis_cli.get("squad:fire_data:control:mortarRounds"))

                squard.fire(mortarRounds, round(item['dir'], 1), item['angle'])
                time.sleep(random.uniform(get_settings()['afterFire'][0], get_settings()['afterFire'][0]))
            log("停火")
            redis_cli.set("squad:fire_data:control:state", 0)
        except Exception as e:
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


@app.route('/save', methods=['POST'])
# @check
def save():
    if request.is_json:
        data = request.get_json()
        # 将数据转换为JSON字符串并追加到Redis列表中
        redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(data))
    return R(0)


@app.route('/update', methods=['POST'])
# @check
def update():
    if request.is_json:
        data = request.get_json()
        redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(data))

    return R(0)


@app.route('/remove', methods=['POST'])
# @check
def remove():
    data = request.get_json()
    redis_cli.hdel('squad:fire_data:standard', data['entityId'])

    return R(0)


@app.route("/remove_all")
# @check
def remove_all():
    redis_cli.delete('squad:fire_data:standard')

    return R(0)


@app.route("/setState", methods=["GET"])
# @check
def set_state():
    state = request.args.get('state')
    state = int(state)
    # state = 1 - state

    # 将状态保存到Redis
    redis_cli.set('squad:fire_data:control:state', state)

    # 使用SocketIO广播状态更新
    socketio.emit('state', {'data': state})

    return R(200, data=state)


@app.route("/getState", methods=["GET"])
def get_state():
    # 从Redis获取状态信息
    state = redis_cli.get('squad:fire_data:control:state')

    # 确保从Redis获取的状态是字符串，如果需要，转换成整数
    if state is not None:
        state = int(state)
    else:
        # 如果Redis中没有找到状态信息，可能需要设置一个默认值
        state = 0  # 或任何适当的默认值

    return R(200, data=state)


@app.route("/listFires", methods=["GET"])
def list_fires():
    if redis_cli.exists('squad:fire_data:standard'):
        list_items = list(redis_cli.hvals('squad:fire_data:standard'))

        # Deserialize JSON strings to Python objects
        data = [json.loads(item) for item in list_items]
        return R(200, data=data)
    return R(200, data=[])


@app.route('/setMortarRounds', methods=["GET"])
# @check
def set_mortarRounds():
    mortarRounds = request.args.get('mortarRounds')
    # 将mortarRounds的值保存到Redis
    redis_cli.set('squad:fire_data:control:mortarRounds', mortarRounds)
    return R(0)


@app.route("/get_bezier_points", methods=['POST'])
def get_bezier_points_api():
    data = request.get_json()
    t = request.args.get("type")
    points = generate_bezier_points(0, data['height'] / 2,
                                    list(map(lambda f: f * data['height'] * 0.5, data['points'])),
                                    num_points=data['num_points']).tolist()
    x_coords = calculate_nonuniform_x_coords(points)
    x_coords = list(map(lambda f: f * data['width'], x_coords))

    # 从 Redis 获取 custom_trajectory
    custom_trajectory_json = redis_cli.get('squad:trajectory:custom')
    if custom_trajectory_json:
        trajectories = json.loads(custom_trajectory_json)
        trajectory = list(filter(lambda e: e['name'] == data['name'], trajectories[t]))
        if trajectory:
            trajectory = trajectory[0]
            trajectory['points'] = data['points']
            trajectory['num_points'] = data['num_points']
            # 将更新后的数据写回 Redis
            redis_cli.set('squad:trajectory:custom', json.dumps(trajectories))
        else:
            return R(404, message='Mail trajectory not found.')
    else:
        return R(500, message='Custom trajectory data not found in Redis.')

    return R(200, data=list(zip(x_coords, points)))


@app.route("/list_trajectories", methods=["GET"])
def list_trajectories():
    # 尝试从 Redis 获取 custom_trajectory
    t = request.args.get("type")

    custom_trajectory_json = redis_cli.get('squad:trajectory:custom')

    if custom_trajectory_json:
        data = json.loads(custom_trajectory_json)
    else:
        # 如果没有找到 custom_trajectory，尝试从 Redis 获取 default_trajectory
        default_trajectory_json = redis_cli.get('squad:trajectory:default')
        if default_trajectory_json:
            data = json.loads(default_trajectory_json)
        else:
            return R(500, message='Trajectory data not found in Redis.')

    return R(200, data=data[t])


@app.route("/reset_trajectory", methods=["POST"])
def reset_trajectory():
    data = request.get_json()
    name = data['name']
    t = request.args.get("type")
    # 从 Redis 获取 custom_trajectory 和 default_trajectory
    custom_trajectory_json = redis_cli.get('squad:trajectory:custom')
    default_trajectory_json = redis_cli.get('squad:trajectory:default')

    custom_trajectory = json.loads(custom_trajectory_json) if custom_trajectory_json else None
    default_trajectory = json.loads(default_trajectory_json) if default_trajectory_json else None

    if not custom_trajectory or not default_trajectory:
        return R(500, message='Trajectory data not found in Redis.')

    c_t = list(filter(lambda f: f["name"] == name, custom_trajectory[t]))[0]
    d_t = list(filter(lambda f: f["name"] == name, default_trajectory[t]))[0]

    if not d_t:
        # 如果找不到默认轨迹，可能需要适当处理
        return R(500, message='Default trajectory not found.')
    else:
        c_t['points'] = d_t['points']
        c_t['num_points'] = d_t['num_points']

    # 将更新后的 custom_trajectory 存回 Redis
    redis_cli.set('squad:trajectory:custom', json.dumps(custom_trajectory))

    return R(200, data=c_t)


@app.route("/update_settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    redis_cli.set('squad:settings', json.dumps(data))

    return R(200)


@app.route("/get_settings", methods=["GET"])
def get_settings_():
    settings = json.loads(redis_cli.get('squad:settings'))
    return R(200, settings)


def init_settings():
    '''
    初始化各种设置

    '''
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
    redis_cli.set("squad:fire_data:control:state", 0)


if __name__ == '__main__':
    # if not login():
    #     input()
    #     exit(0)
    display_squard()
    check_redis_service()
    init_settings()

    threading.Thread(target=listen_for_logs).start()
    threading.Thread(target=start_map).start()
    threading.Thread(target=start_control).start()
    threading.Thread(target=listen_fire).start()
    threading.Thread(target=start_socket_server).start()

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # 不需要真正发送数据，所以目的地址随便设置一个不存在的地址
    s.connect(("10.255.255.255", 1))
    IP = s.getsockname()[0]
    print(f'将手机和电脑保持同一局域网，关闭AP隔离保护，手机浏览器打开{IP}:5173')
    print("如果你设置了自定义轨迹或者别的设置，在更新前请将该目录下的Redis-x64-5.0.14.1/dump.rdb备份，并在更新后进行替换")
    # with DisableFlaskLogging():
    socketio.run(app, port=8080, host='0.0.0.0', debug=False, allow_unsafe_werkzeug=True)
