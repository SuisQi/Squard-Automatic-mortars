import asyncio
import json
import threading
import time
import traceback

import websockets

from utils.redis_connect import redis_cli

connect_pools = []


async def echo(websocket, path):
    if len(connect_pools) >= 1:
        await websocket.send(json.dumps({
            "command": "ERROR",
            "payload": "一台设备只能有一个计算器来标点，请不要在这个页面打火力点"
        }))
        return
    connect_pools.append(websocket)

    try:
        async for message in websocket:
            message = json.loads(message)
            if message['command'] == "SET":
                if redis_cli.exists("squad:fire_data:standard") and redis_cli.hget("squad:fire_data:standard",
                                                                                   message['payload']['entityId']):
                    data = json.loads(redis_cli.hget("squad:fire_data:standard", message['payload']['entityId']))
                    data['dir'] = message['payload']['dir']
                    data['angle'] = message['payload']['angle']
                    redis_cli.hset("squad:fire_data:standard", message['payload']['entityId'], json.dumps(data))
    except Exception as e:
        print(traceback.format_exc())
    finally:

        connect_pools.remove(websocket)


async def dir_web_server():
    print("websocket启动")
    async with websockets.serve(echo, "0.0.0.0", 1235):
        await asyncio.Future()  # 运行直到被取消


def get_dirs():
    while True:
        for w in connect_pools:
            if redis_cli.exists('squad:fire_data:standard'):
                entityIds = list(redis_cli.hkeys('squad:fire_data:standard'))
                entityIds = list(map(lambda f: f.decode(), entityIds))
                for entityId in entityIds:
                    send = w.send(json.dumps({
                        "command": "compute",
                        "payload": entityId
                    }))
                    asyncio.run(send)

        time.sleep(0.2)


if __name__ == '__main__':
    threading.Thread(target=get_dirs).start()
    asyncio.run(dir_web_server())


def start_dir_server():
    threading.Thread(target=get_dirs).start()
    asyncio.run(dir_web_server())