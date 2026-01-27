import asyncio

from websocket_.dir_websocket import start_dir_server
from websocket_.server import web_server

start_dir_server()
asyncio.run(web_server())