import json
import logging
import random

from utils.redis_connect import redis_cli

# 配置日志记录器
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class MortarFireControl:
    def __init__(self, sessionId):
        self._sessionId = sessionId
        self._prefix = f"squad:{sessionId}:fire_control:"

    def _get_key(self, key):
        """生成带有会话前缀的键"""
        return self._prefix + key

    def add_mortar(self, mortar_id):
        """添加迫击炮"""
        key = self._get_key("mortars")
        if not redis_cli.sismember(key, mortar_id):
            logging.info(f"房间{self._sessionId} 添加迫击炮{mortar_id}")
            redis_cli.sadd(key, mortar_id)

    def remove_mortar(self, mortar_id):
        """移除迫击炮"""
        key = self._get_key("mortars")
        if redis_cli.sismember(key, mortar_id):
            logging.info(f"房间{self._sessionId} 移除迫击炮{mortar_id}")
            redis_cli.srem(key, mortar_id)

    def add_fire_point(self, fp_id):
        """添加火力点"""
        key = self._get_key("fire_points")
        if not redis_cli.sismember(key, fp_id):
            logging.info(f"房间{self._sessionId} 添加火力点{fp_id}")
            redis_cli.sadd(key, fp_id)
            fp_counts_key = self._get_key("fire_point_counts")
            redis_cli.hset(fp_counts_key, fp_id, 0)  # 初始化分配次数为0

    def remove_fire_point(self, fp_id):
        """移除火力点"""
        key = self._get_key("fire_points")
        fire_count_key = self._get_key("fire_point_counts")
        if redis_cli.sismember(key, fp_id):
            logging.info(f"房间{self._sessionId} 移除火力点{fp_id}")
            redis_cli.srem(key, fp_id)
            redis_cli.hdel(fire_count_key, fp_id)

    # mark_fire_point_as_unreachable 和 assign_fire_point 方法
    # 需要根据实际情况进行调整，这里省略了具体实现

    def get_assignments(self):
        """获取当前的分配情况"""
        assignments_key = self._get_key("assignments")
        assignments_raw = redis_cli.hgetall(assignments_key)
        assignments = {k.decode("utf-8"): json.loads(v) for k, v in assignments_raw.items()}
        return assignments

    def mark_fire_point_as_unreachable(self, mortar_id, fp_id):
        """标记某个火力点对于特定迫击炮不可达"""
        unreachable_key = self._get_key(f"unreachable:{mortar_id}")
        if redis_cli.sismember(self._get_key("fire_points"), fp_id):
            logging.info(f"房间{self._sessionId} 标记火力点{fp_id}对迫击炮{mortar_id}不可达")
            redis_cli.sadd(unreachable_key, fp_id)

    def unmark_fire_point_as_unreachable(self, mortar_id, fp_id):
        """取消标记某个火力点对于特定迫击炮不可达"""
        unreachable_key = self._get_key(f"unreachable:{mortar_id}")
        if redis_cli.sismember(unreachable_key, fp_id):
            logging.info(f"房间{self._sessionId} 取消标记火力点{fp_id}对迫击炮{mortar_id}不可达")
            redis_cli.srem(unreachable_key, fp_id)

    def assign_fire_point(self, mortar_id, ordered=True):
        """为指定迫击炮分配一个火力点，可以选择是否按顺序分配"""
        if not redis_cli.sismember(self._get_key("mortars"), mortar_id):
            return None

        # 获取所有可用的火力点，排除不可达的火力点
        all_fire_points = redis_cli.smembers(self._get_key("fire_points"))
        unreachable_fps = redis_cli.smembers(self._get_key(f"unreachable:{mortar_id}"))
        eligible_fire_points = list(all_fire_points - unreachable_fps)
        if self.check_and_notify_all_fp_assigned():
            return None
        if not ordered:
            random.shuffle(eligible_fire_points)

        for fp_bytes in eligible_fire_points:
            fp_id = fp_bytes.decode("utf-8")
            count_key = self._get_key("fire_point_counts")
            # 分配次数最少的火力点
            if redis_cli.hget(count_key, fp_id) is None or int(redis_cli.hget(count_key, fp_id)) == min(
                    [int(count) for count in redis_cli.hvals(count_key)], default=0):
                # 更新分配
                redis_cli.hincrby(count_key, fp_id, 1)
                assignments_key = self._get_key("assignments")
                current_assignments = json.loads(
                    redis_cli.hget(assignments_key, mortar_id).decode('utf-8')) if redis_cli.hexists(assignments_key,
                                                                                                     mortar_id) else []
                current_assignments.append(fp_id)
                redis_cli.hset(assignments_key, mortar_id, json.dumps(current_assignments))
                logging.info(f"房间{self._sessionId} {mortar_id} 分配: {fp_id}")
                return fp_id

        # 如果没有找到符合条件的火力点，则尝试返回None
        return None

    def check_and_notify_all_fp_assigned(self):
        """检查是否每个火力点都至少被分配了一次，并进行相应通知"""
        fire_point_counts_key = self._get_key("fire_point_counts")
        all_counts = redis_cli.hvals(fire_point_counts_key)
        if all_counts and all(int(count) > 0 for count in all_counts):
            # 此处实现通知逻辑
            logging.info(f"房间{self._sessionId} 所有火力点都至少被分配了一次")
            # 重置所有火力点的分配次数为0
            all_fire_points = redis_cli.hkeys(fire_point_counts_key)
            for fp_id in all_fire_points:
                redis_cli.hset(fire_point_counts_key, fp_id, 0)

            # 清空所有不可达火力点的设置
            mortars = redis_cli.smembers(self._get_key("mortars"))
            for mortar_id_bytes in mortars:
                mortar_id = mortar_id_bytes.decode("utf-8")
                unreachable_key = self._get_key(f"unreachable:{mortar_id}")
                redis_cli.delete(unreachable_key)
            return True
        return False

    def remove_all_fire_points(self):
        """删除全部火力点"""
        # 清空所有火力点
        fire_points_key = self._get_key("fire_points")
        fire_point_counts_key = self._get_key("fire_point_counts")
        all_fire_points = redis_cli.smembers(fire_points_key)

        if all_fire_points:
            for fp_bytes in all_fire_points:
                fp_id = fp_bytes.decode("utf-8")
                # 从火力点计数中移除
                redis_cli.hdel(fire_point_counts_key, fp_id)

                # 从每个迫击炮的不可达火力点列表中移除这个火力点
                for mortar_id_bytes in redis_cli.smembers(self._get_key("mortars")):
                    mortar_id = mortar_id_bytes.decode("utf-8")
                    unreachable_key = self._get_key(f"unreachable:{mortar_id}")
                    if redis_cli.sismember(unreachable_key, fp_id):
                        redis_cli.srem(unreachable_key, fp_id)

            # 清空火力点集合
            redis_cli.delete(fire_points_key)

            logging.info(f"房间{self._sessionId} 已删除全部火力点")


if __name__ == '__main__':
    # 示例使用
    control = MortarFireControl("12345")
    control.add_mortar("M1")
    control.add_mortar("M2")
    control.add_fire_point(1)
    control.add_fire_point(2)
    control.add_fire_point(3)
    control.add_fire_point(4)
    control.add_fire_point(5)
    control.mark_fire_point_as_unreachable("M1", 1)
    control.mark_fire_point_as_unreachable("M1", 2)
    control.mark_fire_point_as_unreachable("M1", 3)
    control.mark_fire_point_as_unreachable("M1", 4)
    control.mark_fire_point_as_unreachable("M1", 5)

    # 动态添加和分配
    control.assign_fire_point("M1")
# 动态移除
