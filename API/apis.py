import json
import re

import requests
from flask import request, Blueprint

from API.R import R
from utils.redis_connect import redis_cli
from utils.utils import generate_bezier_points, calculate_nonuniform_x_coords

# 创建一个名为'user'的蓝图
mortar_blueprint = Blueprint('mortar', __name__)


@mortar_blueprint.route('/save', methods=['POST'])
# @check
def save():
    if request.is_json:
        data = request.get_json()
        data['dir'] = round(data['dir'], 1)
        data['angle'] = int(data['angle'])
        # 将数据转换为JSON字符串并追加到Redis列表中
        redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(data))

        sessionId = redis_cli.get("squad:session:sessionId")
        if sessionId:
            sessionId = sessionId.decode()
            ip = redis_cli.get("squad:session:ip").decode()
            requests.get(f"http://{ip}:8081/add_fire?sessionId={sessionId}&targetId={data['entityId']}",proxies={})
    return R(0)


@mortar_blueprint.route('/update', methods=['POST'])
# @check
def update():
    if request.is_json:
        data = request.get_json()
        standard = json.loads(redis_cli.hget('squad:fire_data:standard', data['entityId']))
        if 'userIds' in data:
            standard['userIds'] = data['userIds']
        if 'dir' in data and 'angle' in data:
            data['dir'] = round(data['dir'], 1)
            data['angle'] = int(data['angle'])
        redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(standard))

    return R(0)


@mortar_blueprint.route("/set_session_userId", methods=["GET"])
def set_session_userId():
    userId = request.args.get("userId")
    redis_cli.set("squad:session:userId", userId)
    if userId == "0":
        redis_cli.delete("squad:session:sessionId")
    return R(0)


@mortar_blueprint.route("/set_sessionId", methods=["GET"])
def set_sessionId():
    sessionId = request.args.get("sessionId")
    redis_cli.set("squad:session:sessionId", sessionId)
    return R(0)


@mortar_blueprint.route("/set_server_ip", methods=["GET"])
def set_server_ip():
    address = request.args.get("address")
    # 正则表达式匹配IPV4地址
    ip_pattern = r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"

    # 搜索IP地址
    ip_match = re.search(ip_pattern, address)

    redis_cli.set("squad:session:ip", ip_match.group())
    return R(0)


@mortar_blueprint.route('/remove', methods=['POST'])
# @check
def remove():
    data = request.get_json()
    redis_cli.hdel('squad:fire_data:standard', data['entityId'])
    sessionId = redis_cli.get("squad:session:sessionId")
    if sessionId:
        sessionId = sessionId.decode()
        ip = redis_cli.get("squad:session:ip").decode()
        requests.get(f"http://{ip}:8081/remove_fire?sessionId={sessionId}&targetId={data['entityId']}",proxies={})
    return R(0)


@mortar_blueprint.route("/remove_all")
# @check
def remove_all():
    redis_cli.delete('squad:fire_data:standard')
    sessionId = redis_cli.get("squad:session:sessionId")
    if sessionId:
        sessionId = sessionId.decode()
        ip = redis_cli.get("squad:session:ip").decode()
        requests.get(f"http://{ip}:8081/remove_all?sessionId={sessionId}",proxies={})
    return R(0)


@mortar_blueprint.route("/setControl", methods=["POST"])
# @check
def set_control():
    params = request.get_json()
    for k, v in params.items():
        if k == "synergy" and redis_cli.get("squad:session:userId").decode() == "0":
            params['synergy'] = 0
            return R(500, data={"msg": "非联机模式不能协同开火"})
        redis_cli.set(f'squad:fire_data:control:{k}', v)

    return R(200, data=params)


@mortar_blueprint.route("/getControl", methods=["POST"])
def get_control():
    # 从Redis获取状态信息
    param = request.get_json()
    mortarRounds = redis_cli.get('squad:fire_data:control:mortarRounds').decode()
    state = redis_cli.get('squad:fire_data:control:state').decode()
    synergy = redis_cli.get('squad:fire_data:control:synergy').decode()
    auto_fire = redis_cli.get('squad:fire_data:control:auto_fire').decode()
    if "mortarRounds" == param['type']:
        return R(200, data=int(mortarRounds))
    elif "state" == param['type']:
        return R(200, data=int(state))
    elif "auto_fire" == param['type']:
        return R(200, data=int(auto_fire))

    else:
        return R(200, data=int(synergy))


@mortar_blueprint.route("/listFires", methods=["GET"])
def list_fires():
    userId = redis_cli.get("squad:session:userId").decode()
    if redis_cli.exists('squad:fire_data:standard'):
        list_items = list(redis_cli.hvals('squad:fire_data:standard'))
        list_items = list(map(lambda f: json.loads(f), list_items))
        show_only_self = request.args.get("flag")
        if show_only_self == "1":
            list_items = list(filter(lambda f: userId in f['userIds'], list_items))
        return R(0, data=list_items)
    return R(200, data=[])


@mortar_blueprint.route('/setMortarRounds', methods=["GET"])
# @check
def set_mortarRounds():
    mortarRounds = request.args.get('mortarRounds')
    # 将mortarRounds的值保存到Redis
    redis_cli.set('squad:fire_data:control:mortarRounds', mortarRounds)
    return R(0)


@mortar_blueprint.route("/get_bezier_points", methods=['POST'])
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


@mortar_blueprint.route("/list_trajectories", methods=["GET"])
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


@mortar_blueprint.route("/reset_trajectory", methods=["POST"])
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


@mortar_blueprint.route("/update_settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    redis_cli.set('squad:settings', json.dumps(data))

    return R(200)


@mortar_blueprint.route("/get_settings", methods=["GET"])
def get_settings_():
    settings = json.loads(redis_cli.get('squad:settings'))
    return R(200, settings)


@mortar_blueprint.route("/set_dir_data", methods=["POST"])
def set_dir_data():
    data = request.get_json()
    dir_data = json.loads(redis_cli.hget("squad:fire_data:standard", data['id']))
    dir_data['dir'] = data['dir']
    dir_data['angle'] = data['angle']
