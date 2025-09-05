import os
import time

import cv2

from show_info import topmost_orientation, topmost_mail
from utils.utils import save_num, press_key
from weapons.super_weapon import Super_Weapon


class MK19(Super_Weapon):
    def w__init__(self):
        super().__init__()

        pass



    def _move_target_mail(self,target):
        count = int((30-target)*10)
        for i in range(count):
            self._mouse.move(0, 4)
            time.sleep(0.01)
        for i in range(int(count * 0.045)):
            self._mouse.move(0, 4)
            time.sleep(0.01)
        pass
    def fire(self, count, dir, angle):
        press_key('w', 1)
        self._move_target_mail(angle)
        pass
    def listen_verify_orientation(self,target):
        topmost_orientation["set_background_color"]("#f87171")
        topmost_orientation["update_text"](f"方位:{target}")
        pass

    def listen_verify_mail(self, target):
        topmost_mail["set_background_color"]("#f87171")
        topmost_mail["update_text"](f"密位:{target}")
        pass