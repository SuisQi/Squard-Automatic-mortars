from utils.redis_connect import redis_cli
from weapons.m121 import M121
from weapons.mortar import Mortar


class A:
    def __init__(self, a):
        pass

    def join(self):
        pass


class Weapon():
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Weapon, cls).__new__(cls, *args, **kwargs)
            cls._instance.initialized = False  # 设置一个标志，确保它的存在
        return cls._instance

    def __init__(self):
        if self.initialized:  # 避免多次初始化
            return
        self.initialized = True
        if redis_cli.get("squad:fire_data:control:weapon"):
            self._type = redis_cli.get("squad:fire_data:control:weapon").decode()
        else:
            self._type = "standardMortar"
        self._weapons = {
            "standardMortar": Mortar(),
            "M121": M121()
        }

    def fire(self, count, dir, angle):
        if self._type in self._weapons:
            self._weapons[self._type].fire(count, dir, angle)

    def set_type(self, _type):
        self._type = _type

    def get_angle_precision(self):
        if self._type == "standardMortar":
            return 0
        elif self._type == "M121":
            return 2
        return 1

    def listen_verify_orientation(self):
        if self._type in self._weapons:
            return self._weapons[self._type].listen_verify_orientation

        return A

    def listen_verify_mail(self):
        if self._type in self._weapons:
            return self._weapons[self._type].listen_verify_mail
        return A
