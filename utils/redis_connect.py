import os
import subprocess
import socket
import threading
import time

import redis

# 创建连接到 Redis 服务器的连接
# 假设 Redis 服务器运行在本地，默认端口为6379，无密码
redis_cli = redis.Redis(host='127.0.0.1', port=6379, db=0)




def is_port_in_use(port):
    """
    检测某个端口是否被占用。

    :param port: 端口号
    :return: 如果端口被占用返回 True，否则返回 False
    """
    host = socket.gethostname()
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return False
        except socket.error:
            return True


def check_redis_service(host='127.0.0.1', port=6379):
    """检测指定主机和端口上的 Redis 服务是否运行。"""
    if not is_port_in_use(6379):
        try:
            redis_path = 'Redis-x64-5.0.14.1'
            if not os.path.exists(redis_path):
                print(f"路径 {redis_path} 不存在")
                return

            command = 'startup.bat'

            # 使用Popen来启动新的命令窗口，但不创建新窗口
            process = subprocess.Popen(command, cwd=redis_path, shell=True, creationflags=subprocess.CREATE_NO_WINDOW,
                                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            # 获取标准输出和标准错误以进行调试
            stdout, stderr = process.communicate()
            if stderr:
                print(f"redis启动错误:{stderr}")
        except Exception as e:
            print("启动redis失败")
            print(e)
    else:
        print()
