import json
import re
import threading

import cv2
import redis
import requests
from flask import request, Blueprint

from API.R import R
import utils.public as pub
from utils.map_raning import MapRanging
from utils.redis_connect import redis_cli
from utils.utils import generate_bezier_points, calculate_nonuniform_x_coords, log
from weapons.weapon import Weapon

# 创建一个名为'user'的蓝图
mortar_blueprint = Blueprint('mortar', __name__)

redis_remove = threading.Lock()
@mortar_blueprint.route('/save', methods=['POST'])
def save():
    """
    保存火力点数据

    将目标点标记为火力点，保存方位角和仰角数据到Redis。
    如果处于联机模式，还会同步到远程服务器。

    请求体:
        {
            "entityId": int,  # 目标点实体ID
            "dir": float,     # 方位角（度）
            "angle": float,   # 仰角（密位）
            "userIds": list   # 标记该火力点的用户ID列表
        }

    返回:
        R(0) 成功
    """
    if request.is_json:
        data = request.get_json()
        data['dir'] = round(data['dir'], 1)
        angle_precision = Weapon().get_angle_precision()
        if angle_precision == 0:

            data['angle'] = int(data['angle'])
        else:
            data['angle'] = round(data['angle'], angle_precision)
        # 将数据转换为JSON字符串并追加到Redis列表中
        redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(data))

        sessionId = redis_cli.get("squad:session:sessionId")
        if sessionId:
            sessionId = sessionId.decode()
            ip = redis_cli.get("squad:session:ip").decode()
            requests.get(f"http://{ip}:8081/add_fire?sessionId={sessionId}&targetId={data['entityId']}", proxies={})
    return R(0)


@mortar_blueprint.route('/update', methods=['POST'])
def update():
    """
    更新火力点数据

    更新已存在火力点的方位角、仰角或用户标记列表。
    使用线程锁确保并发安全。

    请求体:
        {
            "entityId": int,       # 目标点实体ID
            "dir": float,          # 可选，新的方位角（度）
            "angle": float,        # 可选，新的仰角（密位）
            "userIds": list        # 可选，更新后的用户ID列表
        }

    返回:
        R(0) 成功
    """
    with redis_remove:
        if request.is_json:
            data = request.get_json()
            standard = redis_cli.hget('squad:fire_data:standard', data['entityId'])
            if not standard:
                return R(0)
            standard = json.loads(standard)
            if 'userIds' in data:
                standard['userIds'] = data['userIds']
            if 'dir' in data and 'angle' in data:
                standard['dir'] = round(data['dir'], 1)
                angle_precision = Weapon().get_angle_precision()
                if angle_precision == 0:

                    standard['angle'] = int(data['angle'])
                else:
                    standard['angle'] = round(data['angle'], angle_precision)
            redis_cli.hset('squad:fire_data:standard', data['entityId'], json.dumps(standard))

    return R(0)


@mortar_blueprint.route("/set_session_userId", methods=["GET"])
def set_session_userId():
    """
    设置当前会话的用户ID

    用于联机模式下标识当前用户。当userId为"0"时，
    表示退出联机模式，会清除sessionId。

    查询参数:
        userId: str  # 用户ID，"0"表示单机模式

    返回:
        R(0) 成功
    """
    userId = request.args.get("userId")
    redis_cli.set("squad:session:userId", userId)
    if userId == "0":
        redis_cli.delete("squad:session:sessionId")
    return R(0)


@mortar_blueprint.route("/set_sessionId", methods=["GET"])
def set_sessionId():
    """
    设置联机会话ID

    用于加入联机房间，设置当前的会话ID。

    查询参数:
        sessionId: str  # 联机会话ID

    返回:
        R(0) 成功
    """
    sessionId = request.args.get("sessionId")
    redis_cli.set("squad:session:sessionId", sessionId)
    return R(0)


@mortar_blueprint.route("/set_server_ip", methods=["GET"])
def set_server_ip():
    """
    设置联机服务器IP地址

    从提供的地址字符串中提取IPv4地址并保存。
    用于联机模式下与远程服务器通信。

    查询参数:
        address: str  # 包含IP地址的字符串

    返回:
        R(0) 成功
    """
    address = request.args.get("address")
    # 正则表达式匹配IPV4地址
    ip_pattern = r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"

    # 搜索IP地址
    ip_match = re.search(ip_pattern, address)

    redis_cli.set("squad:session:ip", ip_match.group())
    return R(0)


@mortar_blueprint.route('/remove', methods=['POST'])
def remove():
    """
    删除单个火力点

    从Redis中删除指定的火力点数据。
    如果处于联机模式，会同步删除远程服务器上的数据。
    使用线程锁确保并发安全。

    请求体:
        {
            "entityId": int  # 要删除的目标点实体ID
        }

    返回:
        R(0) 成功
    """
    try:
        data = request.get_json()
        with redis_remove:
            redis_cli.hdel('squad:fire_data:standard', data['entityId'])
        sessionId = redis_cli.get("squad:session:sessionId")
        if sessionId:
            sessionId = sessionId.decode()
            ip = redis_cli.get("squad:session:ip").decode()
            requests.get(f"http://{ip}:8081/remove_fire?sessionId={sessionId}&targetId={data['entityId']}", proxies={})
        return R(0)
    except Exception as e:
        print(e)


@mortar_blueprint.route("/remove_all")
def remove_all():
    """
    清除所有火力点

    删除Redis中存储的所有火力点数据。
    如果处于联机模式，会同步清除远程服务器上的数据。

    返回:
        R(0) 成功
    """
    redis_cli.delete('squad:fire_data:standard')
    sessionId = redis_cli.get("squad:session:sessionId")
    if sessionId:
        sessionId = sessionId.decode()
        ip = redis_cli.get("squad:session:ip").decode()
        requests.get(f"http://{ip}:8081/remove_all?sessionId={sessionId}", proxies={})
    return R(0)


@mortar_blueprint.route("/setControl", methods=["POST"])
def set_control():
    """
    设置开火控制参数

    更新迫击炮的控制状态，包括开火状态、协同模式、自动开火等。
    非联机模式下不允许开启协同开火。

    请求体:
        {
            "state": int,      # 可选，开火状态 (0=停止, 1=开火)
            "synergy": int,    # 可选，协同开火 (0=关闭, 1=开启)
            "auto_fire": int,  # 可选，自动开火 (0=关闭, 1=开启)
            "mortarRounds": int  # 可选，迫击炮弹数
        }

    返回:
        R(200, data=params) 成功，返回设置的参数
        R(500, data={"msg": "非联机模式不能协同开火"}) 非联机模式下尝试开启协同
    """
    params = request.get_json()
    for k, v in params.items():
        if k == "synergy" and redis_cli.get("squad:session:userId").decode() == "0":
            params['synergy'] = 0
            return R(500, data={"msg": "非联机模式不能协同开火"})
        redis_cli.set(f'squad:fire_data:control:{k}', v)

    return R(200, data=params)


@mortar_blueprint.route("/getControl", methods=["POST"])
def get_control():
    """
    获取开火控制参数

    根据请求类型返回对应的控制参数值。

    请求体:
        {
            "type": str  # 参数类型: "mortarRounds" | "state" | "synergy" | "auto_fire"
        }

    返回:
        R(200, data=int) 对应参数的当前值
    """
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
    """
    获取火力点列表

    返回当前所有已标记的火力点数据。
    可通过flag参数过滤只显示当前用户标记的火力点。

    查询参数:
        flag: str  # 可选，"1"表示只显示当前用户标记的火力点

    返回:
        R(0, data=list) 火力点列表，每项包含entityId、dir、angle、userIds等
    """
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
def set_mortarRounds():
    """
    设置迫击炮弹数量

    更新每轮开火发射的迫击炮弹数量。

    查询参数:
        mortarRounds: int  # 迫击炮弹数量

    返回:
        R(0) 成功
    """
    mortarRounds = request.args.get('mortarRounds')
    # 将mortarRounds的值保存到Redis
    redis_cli.set('squad:fire_data:control:mortarRounds', mortarRounds)
    return R(0)


@mortar_blueprint.route("/get_bezier_points", methods=['POST'])
def get_bezier_points_api():
    """
    计算鼠标移动轨迹的贝塞尔曲线点

    根据控制点参数生成模拟人类操作的鼠标移动轨迹。
    用于调整密位(mail)或方位角(orientation)时的平滑移动。
    同时更新Redis中对应轨迹配置的参数。

    查询参数:
        type: str  # 轨迹类型: "mail"(密位) | "orientation"(方位角)

    请求体:
        {
            "name": str,       # 轨迹配置名称
            "height": float,   # 轨迹高度（用于计算控制点）
            "width": float,    # 轨迹宽度（用于计算X坐标）
            "points": list,    # 贝塞尔控制点列表 (0-1归一化值)
            "num_points": int  # 输出点数量
        }

    返回:
        R(200, data=list) 轨迹点列表，每项为(x, y)坐标元组
        R(404) 找不到指定的轨迹配置
        R(500) Redis中无轨迹数据
    """
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
    """
    获取鼠标移动轨迹配置列表

    返回指定类型的所有移动轨迹配置。
    用于自定义调整密位或方位角时的鼠标移动曲线。
    优先返回自定义配置，若无则返回默认配置。

    查询参数:
        type: str  # 轨迹类型: "mail"(密位) | "orientation"(方位角)

    返回:
        R(200, data=list) 轨迹配置列表
        R(500) Redis中无轨迹数据
    """
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
    """
    重置鼠标移动轨迹配置

    将指定的移动轨迹配置恢复为默认值。

    查询参数:
        type: str  # 轨迹类型: "mail"(密位) | "orientation"(方位角)

    请求体:
        {
            "name": str  # 要重置的轨迹配置名称
        }

    返回:
        R(200, data=dict) 重置后的轨迹配置
        R(500) 找不到轨迹数据或默认配置
    """
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
    """
    更新应用设置

    保存用户的应用配置到Redis。

    请求体:
        dict  # 设置对象，包含各种应用配置项

    返回:
        R(200) 成功
    """
    data = request.get_json()
    redis_cli.set('squad:settings', json.dumps(data))

    return R(200)


@mortar_blueprint.route("/get_settings", methods=["GET"])
def get_settings_():
    """
    获取应用设置

    从Redis读取当前的应用配置。

    返回:
        R(200, data=dict) 应用设置对象
    """
    settings = json.loads(redis_cli.get('squad:settings'))
    return R(200, settings)


@mortar_blueprint.route("/set_dir_data", methods=["POST"])
def set_dir_data():
    """
    设置火力点方向数据（未完成/废弃）

    注意: 此接口当前未被任何地方调用，且实现不完整
    （读取并修改数据后未写回Redis）。

    请求体:
        {
            "id": int,      # 火力点实体ID
            "dir": float,   # 方位角（度）
            "angle": float  # 仰角（密位）
        }

    返回:
        R(200) 成功
    """
    data = request.get_json()
    dir_data = json.loads(redis_cli.hget("squad:fire_data:standard", data['id']))
    dir_data['dir'] = data['dir']
    dir_data['angle'] = data['angle']
    return R(200)


@mortar_blueprint.route("/set_map", methods=["GET"])
def set_map():
    """
    设置当前地图

    加载指定的地图文件用于测距和坐标计算。

    查询参数:
        file_name: str  # 地图文件名（相对于templates/map/public/目录）

    返回:
        R(0) 成功
    """
    file_name = request.args.get("file_name")
    m = MapRanging()
    m.set_map(f"./templates/map/public/{file_name}")

    return R(0)


@mortar_blueprint.route("/set_weapon", methods=["GET"])
def set_weapon():
    """
    设置当前武器类型

    切换迫击炮计算器使用的武器类型，影响弹道计算参数。

    查询参数:
        WeaponType: str  # 武器类型标识 (如 "M121", "MK19" 等)

    返回:
        R(0) 成功
    """
    weapon_type = request.args.get("WeaponType")
    m = Weapon()
    m.set_type(weapon_type)
    redis_cli.set("squad:fire_data:control:weapon", weapon_type)
    log(f"设置武器{weapon_type}")
    return R(0)


@mortar_blueprint.route("/create_squad", methods=["GET"])
def create_squad():
    """
    创建战术小队

    在游戏中自动创建指定名称的小队。
    通过模拟键盘输入实现。

    查询参数:
        squad_name: str  # 小队名称

    返回:
        R(0) 成功
    """
    squad_name = request.args.get("squad_name")
    pub.set_createsquad_state(squad_name)
    return R(0)


def keypad_to_world(keypad_str: str, grid_spacing: float = 10000 / 3) -> tuple:
    """
    将网格坐标字符串转换为世界坐标

    参数:
        keypad_str: 网格坐标字符串，格式如 "G3-7-7-3"
        grid_spacing: 基础网格间距，默认 10000/3

    返回:
        (x, y) 世界坐标元组
    """
    import re

    # 解析网格坐标字符串
    # 格式: A1-1-1-1 或 G3-7-7-3
    pattern = r'^([A-Za-z])(\d+)-(\d)-(\d)-(\d)$'
    match = re.match(pattern, keypad_str.strip())

    if not match:
        raise ValueError(f"无效的网格坐标格式: {keypad_str}，正确格式如: G3-7-7-3")

    letter = match.group(1).upper()
    quadrant_y = int(match.group(2)) - 1  # 从1开始转为从0开始
    kp1 = int(match.group(3))  # 1-9
    kp2 = int(match.group(4))  # 1-9
    kp3 = int(match.group(5))  # 1-9

    # 计算 quadrant_x (A=0, B=1, ..., X=23)
    quadrant_x = ord(letter) - ord('A')

    # 计算网格常量
    micro_grid_spacing = grid_spacing / 3
    large_grid_spacing = grid_spacing * 3
    quadrant_size = large_grid_spacing * 3

    # 从 keypad 值反推偏移量
    # KP1 = 7 + floor((x % QUADRANT_SIZE) / LARGE_GRID_SPACING) - 3 * floor((y % QUADRANT_SIZE) / LARGE_GRID_SPACING)
    # KP 值 1-9 对应的 (dx, dy) 偏移:
    # 7 8 9    (0,0) (1,0) (2,0)
    # 4 5 6 => (0,1) (1,1) (2,1)
    # 1 2 3    (0,2) (1,2) (2,2)

    def kp_to_offset(kp):
        """将 keypad 值 (1-9) 转换为 (dx, dy) 偏移"""
        kp = kp - 1  # 转为 0-8
        dx = kp % 3
        dy = 2 - (kp // 3)
        return dx, dy

    kp1_dx, kp1_dy = kp_to_offset(kp1)
    kp2_dx, kp2_dy = kp_to_offset(kp2)
    kp3_dx, kp3_dy = kp_to_offset(kp3)

    # 计算世界坐标 (取每个格子的中心点)
    x = (quadrant_x * quadrant_size +
         kp1_dx * large_grid_spacing +
         kp2_dx * grid_spacing +
         kp3_dx * micro_grid_spacing +
         micro_grid_spacing / 2)  # 加半格偏移到中心

    y = (quadrant_y * quadrant_size +
         kp1_dy * large_grid_spacing +
         kp2_dy * grid_spacing +
         kp3_dy * micro_grid_spacing +
         micro_grid_spacing / 2)  # 加半格偏移到中心

    return (x, y)


@mortar_blueprint.route("/add_marker", methods=["POST"])
def add_marker():
    """
    通过网格坐标添加火力点或武器标记

    请求体:
        {
            "keypad": "G3-7-7-3",  # 网格坐标
            "type": "target" | "weapon",  # 标记类型
            "active": true,  # 可选，是否激活火力点，默认 true
            "grid_spacing": 3333.33  # 可选，网格间距
        }
    """
    try:
        data = request.get_json()
        keypad = data.get('keypad')
        marker_type = data.get('type', 'target')  # 默认为火力点
        active = data.get('active', True)  # 默认激活
        grid_spacing = data.get('grid_spacing', 10000 / 3)

        if not keypad:
            return R(400, message="缺少 keypad 参数")

        # 转换坐标
        try:
            x, y = keypad_to_world(keypad, grid_spacing)
        except ValueError as e:
            return R(400, message=str(e))

        # 通过 RPC 通知前端添加标记
        try:
            import json as json_module

            # 使用与 map_raning.py 相同的 RPC 调用方式
            rpc_param = json_module.dumps({
                "x": x,
                "y": y,
                "type": marker_type,
                "active": active
            })

            rpc_response = requests.post(
                f"http://127.0.0.1:12080/go?group=map&action=addMarker&param={rpc_param}",
                timeout=5,
                proxies={}
            )

        except Exception as e:
            # RPC 通知失败不影响返回，将坐标信息返回给调用方
            print(f"RPC 通知失败: {e}")

        return R(0, data={
            "keypad": keypad,
            "type": marker_type,
            "active": active,
            "x": x,
            "y": y,
            "message": f"标记已添加: {keypad} -> ({x:.2f}, {y:.2f})"
        })

    except Exception as e:
        return R(500, message=f"添加标记失败: {str(e)}")
