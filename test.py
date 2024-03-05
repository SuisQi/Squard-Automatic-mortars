# 引入websockets库
import asyncio
import websockets

# 定义处理WebSocket请求的函数
async def echo(websocket, path):
    async for message in websocket:
        print(message)

# 启动WebSocket服务器
async def main():
    async with websockets.serve(echo, "0.0.0.0", 1234):
        await asyncio.Future()  # 运行直到被取消

# 运行服务器
asyncio.run(main())
