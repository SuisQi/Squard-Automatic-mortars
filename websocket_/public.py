import json

global_connections = {}  # 全局WebSocket连接字典

mortar_control_pool = {}   #控制协同开火的对象池，key为sessionId,value为对象

def decode_redis_hash(hash_data):
    """
    将从Redis hgetall命令返回的字节串哈希表解码为字符串哈希表。

    参数:
    - hash_data: 一个字典，其中包含从Redis hgetall命令返回的字节串键值对。

    返回值:
    - 一个字典，其中所有的键和值都是解码后的字符串。
    """

    return {key.decode(): json.loads(value.decode()) for key, value in hash_data.items()}


def extract_odd_positions_from_timestamp():
    """
    该函数生成一个13位的时间戳，并从中提取奇数位置上的字符。

    返回:
        由时间戳奇数位置上的字符组成的字符串。
    """
    from datetime import datetime
    import time

    # 获取当前时间戳（毫秒级）
    timestamp = int(round(time.time() * 1000))

    # 将时间戳转换成字符串，以便提取奇数位置的字符
    timestamp_str = str(timestamp)

    # 提取奇数位置的字符
    odd_positions = timestamp_str[::2]

    return odd_positions


