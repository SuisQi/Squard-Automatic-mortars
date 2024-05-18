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
    async with websockets.serve(echo, "0.0.0.0", 1235):
        await asyncio.Future()  # 运行直到被取消


async def get_dirs():
    while True:
        if connect_pools and redis_cli.exists('squad:fire_data:standard'):
            entityIds = list(redis_cli.hkeys('squad:fire_data:standard'))
            entityIds = list(map(lambda f: f.decode(), entityIds))
            for websocket in connect_pools:
                for entityId in entityIds:
                    await websocket.send(json.dumps({
                        "command": "compute",
                        "payload": entityId
                    }))
        await asyncio.sleep(0.2)  # 异步等待，替代 time.sleep

if __name__ == '__main__':
    threading.Thread(target=get_dirs).start()
    asyncio.run(dir_web_server())


def start_dir_server():
    async def async_server_tasks():
        # 创建两个任务
        dir_server = asyncio.create_task(dir_web_server())
        dir_task = asyncio.create_task(get_dirs())
        # 等待这两个任务完成，gather 会同时运行这两个任务
        await asyncio.gather(dir_server, dir_task)

    def run_async_server():
        loop = asyncio.new_event_loop()  # 创建新的事件循环
        asyncio.set_event_loop(loop)  # 设置为当前线程的事件循环
        try:
            loop.run_until_complete(async_server_tasks())  # 运行异步任务
        finally:
            loop.close()  # 关闭事件循环

    thread = threading.Thread(target=run_async_server)  # 创建并启动线程
    thread.start()