# 引入websockets库
import asyncio
import json
import traceback
from urllib.parse import urlparse, parse_qs

import websockets
from websockets.exceptions import ConnectionClosed

from utils.redis_connect import redis_cli
from websocket_.public import global_connections, decode_redis_hash, extract_odd_positions_from_timestamp

connected = {}
additional_servers = {}  # 用于存储额外的WebSocket服务器实例
userId = redis_cli.hget("squad:session", "userId").decode("utf-8")  # 自己的userId


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


# 定义处理WebSocket请求的函数
async def echo(websocket, path):
    room_session_id = ""
    user_session_id = ""
    try:
        async for message in websocket:
            message = json.loads(message)

            if message['command'] == "CREATE":
                user_session_id = room_session_id = extract_odd_positions_from_timestamp()
                print(message)
                global_connections[room_session_id] = [websocket]

                redis_cli.set(f"squad:{room_session_id}:world:components", json.dumps(message['payload']['state']))
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
                        "state": json.loads(redis_cli.get(f"squad:{room_session_id}:world:components")),
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
                        "sessionId": user_session_id,
                        "state": json.loads(redis_cli.get(f"squad:{room_session_id}:world:components")),
                        "users": session['users'],
                        "userId": user['id']
                    }
                }))
            elif message['command'] == "ACTION":
                for w in global_connections[room_session_id]:
                    if w == websocket:
                        continue
                    await w.send(json.dumps(message))

        if user_session_id == room_session_id:
            for w in global_connections[room_session_id]:
                await w.close()
            # 使用生成器函数删除所有以"squad:12345"为前缀的键
            check_key_exists(f"squad:{room_session_id}*", True)
        else:
            global_connections[room_session_id] = [x for x in global_connections[room_session_id] if x != websocket]
            session = json.loads(redis_cli.get(f"squad:{room_session_id}:session"))
            session['users'] = list(filter(lambda f: f['id'] != user_session_id, session['users']))
            redis_cli.set(f"squad:{room_session_id}:session", json.dumps(session))
            for w in global_connections[room_session_id]:
                await w.send(json.dumps({
                    "command": "USER_LEFT",
                    "payload": {
                        "userId": user_session_id
                    }

                }))
            del global_connections[room_session_id]
    except Exception as e:
        print(traceback.format_exc())


# 启动WebSocket服务器
async def web_server():
    async with websockets.serve(echo, "0.0.0.0", 1234):
        await asyncio.Future()  # 运行直到被取消



