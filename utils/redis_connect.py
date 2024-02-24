import subprocess
import socket
import threading
import time

import redis

# 创建连接到 Redis 服务器的连接
# 假设 Redis 服务器运行在本地，默认端口为6379，无密码
redis_cli = redis.Redis(host='localhost', port=6379, db=0)


def start_redis():
    subprocess.run(
        'start cmd.exe -c Redis-x64-5.0.14.1\\start.bat',
        shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def check_redis_service(host='127.0.0.1', port=6379):
    """检测指定主机和端口上的 Redis 服务是否运行。"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((host, port))
        sock.close()
        if result != 0:
            result = subprocess.run(
                'Redis-x64-5.0.14.1\\redis-server.exe --service-install Redis-x64-5.0.14.1\\redis.windows.conf --service-name redisserver1 --loglevel verbose',
                shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print(f'安装redis服务:{result.stdout}')
            result = subprocess.run('Redis-x64-5.0.14.1\\redis-server.exe --service-start --service-name redisserver1',
                                    shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print(f'启动redis服务:{result.stdout}')

    except Exception as e:
        threading.Thread(target=start_redis).start()
        time.sleep(2)
