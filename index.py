# -*- coding : utf-8-*-SocketIO


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
from main import log, Squard, stop, STATE, pubsub_msgs
from API.R import R

from flask_cors import CORS
from flask import Flask, request, jsonify

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
    subprocess.run(f"{node_path}live-server --host={ip} --port=8000 ./templates/map", shell=True,
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                   text=True)


def start_control():
    subprocess.run(f"{node_path}live-server --host={ip} --port=5173 ./templates/control", shell=True,
                   stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                   text=True)


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
            list_items = STATE['standard']
            # item = json.loads(list_items[0])

            if stop():
                time.sleep(0.5)
                continue

            for item in list_items:
                if stop():
                    break
                item = json.loads(item)
                log(f"目标方位：{round(item['dir'], 1)}，密位{item['angle']}")

                mortarRounds = int(STATE['control']['mortarRounds'])

                squard.fire(mortarRounds, round(item['dir'], 1), item['angle'])
                time.sleep(random.uniform(0.5, 1))
            log("停火")
            STATE['control']['state'] = 0
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
        STATE['standard'].append(json.dumps(data))
    return R(0)


@app.route('/update', methods=['POST'])
# @check
def update():
    if request.is_json:
        data = request.get_json()
        list_items = STATE['standard']
        count = 0
        for item in list_items:
            # 解析 JSON 字符串
            json_obj = json.loads(item)
            if json_obj['entityId'] == data['entityId']:
                STATE['standard'][count] = json.dumps(data)
            count += 1

    return R(0)


@app.route('/remove', methods=['POST'])
# @check
def remove():
    data = request.get_json()
    # 获取列表所有元素
    list_items = STATE['standard']
    for item in list_items:
        # 解析 JSON 字符串
        json_obj = json.loads(item)
        # 检查是否符合删除条件
        if json_obj['entityId'] == data['entityId']:
            # 删除这个元素
            list_items.remove(item)
    return R(0)


@app.route("/remove_all")
# @check
def remove_all():
    STATE['standard'] = []

    return R(0)


@app.route("/setState", methods=["GET"])
# @check
def set_state():
    state = request.args.get('state')
    state = int(state)
    # state = 1 - state
    STATE['control']['state'] = state
    socketio.emit('state', {'data': state})
    return R(200, data=state)


@app.route("/getState", methods=["GET"])
def get_state():
    state = STATE['control']['state']
    return R(200, data=state)


@app.route("/listFires", methods=["GET"])
def list_fires():
    return R(200, data=STATE['standard'])


@app.route('/setMortarRounds', methods=["GET"])
# @check
def set_mortarRounds():
    mortarRounds = request.args.get('mortarRounds')
    STATE['control']['mortarRounds'] = mortarRounds
    return R(0)


if __name__ == '__main__':
    # if not login():
    #     input()
    #     exit(0)
    display_squard()
    threading.Thread(target=listen_for_logs).start()
    threading.Thread(target=start_map).start()
    threading.Thread(target=start_control).start()
    threading.Thread(target=listen_fire).start()

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # 不需要真正发送数据，所以目的地址随便设置一个不存在的地址
    s.connect(("10.255.255.255", 1))
    IP = s.getsockname()[0]
    print(f'将手机和电脑保持同一局域网，关闭AP隔离保护，手机浏览器打开{IP}:5173')
    with DisableFlaskLogging():
        socketio.run(app, port=8080, host='0.0.0.0', debug=False, allow_unsafe_werkzeug=True)
