from utils.redis_connect import redis_cli

redis_cli.hdel('squad:fire_data:standard', 1)