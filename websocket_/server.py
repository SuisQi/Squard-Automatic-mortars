# 引入websockets库
import asyncio
import json
import threading
import traceback

import websockets

from websocket_.mortarFireControl import MortarFireControl
from utils.redis_connect import redis_cli
from websocket_.fire_control_server import run_control_server
from websocket_.public import global_connections, extract_odd_positions_from_timestamp, \
    mortar_control_pool

connected = {}
additional_servers = {}  # 用于存储额外的WebSocket服务器实例


# 定义一个函数来检查是否存在以特定模式匹配的键
def check_key_exists(match_pattern, del_flag=False):
    cursor = '0'
    while cursor != 0:
        cursor, keys = redis_cli.scan(cursor=cursor, match=match_pattern, count=100)
        if keys:  # 如果在当前迭代中找到了匹配的键，返回True
            if del_flag:
                for k in keys:
                    redis_cli.delete(k)
            else:
                return True
    # 完成所有迭代后，如果没有找到任何键，返回False
    return False


def update_components(sessionId, message):
    components = json.loads(redis_cli.get(f"squad:{sessionId}:world:components").decode())
    # room = json.loads(redis_cli.get(f"squad:{sessionId}:session").decode())
    components_dict = {}
    components_list = {}
    for k in components:
        components_dict[k] = {}
        for v in components[k]:
            components_dict[k][v[0]] = v[1]

    if "payload" in message['payload']:
        payload = message['payload']['payload']
    else:
        payload = None
    if message['payload']['type'] == "DIRDATA_ADD":
        components_dict['dirData'][payload['entityId']] = payload
    elif message['payload']['type'] == "DIRDATA_REMOVE":
        del components_dict['dirData'][payload['entityId']]
    elif message['payload']['type'] == "TRANSFORM_MOVE_TO":
        components_dict['transform'][payload['entityId']]['transform'][12] = payload['location'][0]
        components_dict['transform'][payload['entityId']]['transform'][13] = payload['location'][1]
    elif message['payload']['type'] == "ENTITY_REMOVE":
        if payload['entityId'] in components_dict['transform']:
            del components_dict['transform'][payload['entityId']]
        if payload['entityId'] in components_dict['dirData']:
            del components_dict['dirData'][payload['entityId']]
        if payload['entityId'] in components_dict['entity']:
            del components_dict['entity'][payload['entityId']]
    elif message['payload']['type'] == "ENTITY_ADD":

        if payload['entityType'] == "Target":
            components_dict['entity'][payload['entityId']] = {
                "entityType": payload['entityType'],
                "entityId": payload['entityId'],
                "selected": False
            }
        else:
            components_dict['weapon'][payload['entityId']] = {
                "weaponType": "standardMortar",
                "isActive": False,
                "heightOverGround": 0
            }
        components_dict['transform'][payload['entityId']] = {
            "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, payload['location'][0], payload['location'][1], 0, 1]
        }

    elif message['payload']['type'] == "ENTITY_REMOVE_ALL_TARGETS":
        for entityId in components_dict['entity']:
            if components_dict['entity'][entityId]["entityType"] == "Target":
                del components_dict['entity'][entityId]
                del components_dict['transform'][entityId]

        components_dict['icon'] = {}
        components_dict['dirData'] = {}
    for k in components_dict:
        components_list[k] = []

        for kj in components_dict[k]:
            components_list[k].append([kj, components_dict[k][kj]])
        # for
    # if message['payload']['type'] == "DIRDATA_ADD":
    #     components['dirData'].append([message['payload']['payload']['entityId'], message['payload']['payload']])
    # redis_cli.set(f"squad:{sessionId}:session", json.dumps(room))
    redis_cli.set(f"squad:{sessionId}:world:components", json.dumps(components_list))


# 定义处理WebSocket请求的函数
async def echo(websocket, path):
    room_session_id = ""
    user_session_id = ""
    try:
        async for message in websocket:
            message = json.loads(message)

            if message['command'] == "CREATE":
                user_session_id = room_session_id = extract_odd_positions_from_timestamp()

                control = MortarFireControl(room_session_id)
                mortar_control_pool[room_session_id] = control
                print(message)
                global_connections[room_session_id] = [websocket]
                control.add_mortar(user_session_id)
                state = message['payload']['state']
                for d in state['dirData']:
                    d[1]['userIds'] = [user_session_id]
                for d in state['dirData']:
                    control.add_fire_point(d[1]['entityId'])
                redis_cli.set(f"squad:{room_session_id}:world:components", json.dumps(state))
                session = {
                    "users":

                        [{
                            "id": user_session_id,
                            "name": "房主"
                        }],
                    "sessionId": room_session_id,
                    "nextId": 1

                }
                redis_cli.set(f"squad:{room_session_id}:session", json.dumps(session))
                await websocket.send(json.dumps({
                    "command": "JOINED",
                    "payload": {
                        "sessionId": room_session_id,
                        "state": state,
                        "users": session['users'],
                        "userId": user_session_id
                    }
                }))
            elif message['command'] == "JOIN":
                room_session_id = message['payload']['sessionId']
                if not room_session_id or room_session_id not in global_connections:
                    await websocket.send(json.dumps({
                        "command": "ERROR",
                        "payload": {
                            "msg": "房间不存在"
                        }
                    }))
                    await websocket.close()
                    return

                global_connections[room_session_id].append(websocket)
                session = json.loads(redis_cli.get(f"squad:{room_session_id}:session"))

                user_session_id = extract_odd_positions_from_timestamp()
                """
                添加到redis里
                """
                control = mortar_control_pool[room_session_id]
                control.add_mortar(user_session_id)
                """
                将指令发送给其他客户端
                """
                user = {
                    "id": user_session_id,
                    "name": f"队员_{session['nextId']}"
                }
                session['users'].append(user)
                session['nextId'] = session['nextId'] + 1
                redis_cli.set(f"squad:{room_session_id}:session", json.dumps(session))
                for w in global_connections[room_session_id]:
                    print(message)
                    if w == websocket:
                        continue
                    await w.send(json.dumps({
                        "command": "USER_JOINED",
                        "payload": user
                    }))
                await websocket.send(json.dumps({
                    "command": "JOINED",
                    "payload": {
                        "sessionId": room_session_id,
                        "state": json.loads(redis_cli.get(f"squad:{room_session_id}:world:components")),
                        "users": session['users'],
                        "userId": user['id']
                    }
                }))
            elif message['command'] == "ACTION":
                update_components(room_session_id, message)
                print(message)
                for w in global_connections[room_session_id]:
                    if w == websocket:
                        continue
                    await w.send(json.dumps(message))

        if user_session_id == room_session_id:
            del mortar_control_pool[room_session_id]
            for w in global_connections[room_session_id]:
                await w.close()
            # 使用生成器函数删除所有以"squad:12345"为前缀的键
            check_key_exists(f"squad:{room_session_id}*", True)
            del global_connections[room_session_id]
        else:

            global_connections[room_session_id] = [x for x in global_connections[room_session_id] if x != websocket]
            session = json.loads(redis_cli.get(f"squad:{room_session_id}:session"))
            session['users'] = list(filter(lambda f: f['id'] != user_session_id, session['users']))
            redis_cli.set(f"squad:{room_session_id}:session", json.dumps(session))
            for w in global_connections[room_session_id]:
                if w == websocket:
                    continue
                await w.send(json.dumps({
                    "command": "USER_LEFT",
                    "payload": {
                        "userId": user_session_id
                    }

                }))
            mortar_control_pool[room_session_id].remove_mortar(user_session_id)

    except Exception as e:
        print(traceback.format_exc())


# 启动WebSocket服务器
async def web_server():
    print("websocket启动")
    threading.Thread(target=run_control_server).start()
    async with websockets.serve(echo, "0.0.0.0", 1234):
        await asyncio.Future()  # 运行直到被取消


if __name__ == '__main__':
    asyncio.run(web_server())
