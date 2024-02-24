import subprocess
import socket
import threading
import time

import redis

# 创建连接到 Redis 服务器的连接
# 假设 Redis 服务器运行在本地，默认端口为6379，无密码
redis_cli = redis.Redis(host='localhost', port=6379, db=0)


def check_redis_service(host='127.0.0.1', port=6379):
    """检测指定主机和端口上的 Redis 服务是否运行。"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    if result != 0:
        command = 'cd Redis-x64-5.0.14.1 && start startup.bat'

        # 使用Popen而不是run来启动新的命令窗口
        subprocess.Popen(command, shell=True)
        time.sleep(2)
