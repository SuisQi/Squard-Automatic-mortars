import os
import time

import cv2

from utils.utils import save_num
from weapons.super_weapon import Super_Weapon


class MK19(Super_Weapon):
    def __init__(self):
        super().__init__()
        self._press_mail_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [2.4,5.6,9.2, 14.9, 21.2]
        }
        self._press_oriention_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [10.4, 15.7, 21.2, 25.6, 30.7]
        }
        print(self._get_mail())
        pass

    def _get_mail(self, save=True):
        img = self._screen.capture(self._resolution_case['MK19']['mail_left'],
                                   self._resolution_case['MK19']['mail_top'],
                                   self._resolution_case['MK19']['mail_right'],
                                   self._resolution_case['MK19']['mail_bottom'])
        # 转换为灰度图
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 应用二值化
        _, img = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

        mail = self._predict_mail(img, save)
        if save:
            if not os.path.exists("./imgs/mail/MK19"):
                os.makedirs("./imgs/mail/MK19")
            cv2.imwrite(f"./imgs/mail/MK19/{time.time() * 1000}_{mail}.png", img)
        if mail == -1:
            return False
        return mail
    def _predict_mail(self, img, save_err=False):
        o_x_1 = list(map(lambda f: int(f), self._resolution_case['MK19']['2']['o_x_1'].split(":")))
        o_x_2 = list(map(lambda f: int(f), self._resolution_case['MK19']['2']['o_x_2'].split(":")))
        slices = [
            (o_x_1[0], o_x_1[1]),
            (o_x_2[0], o_x_2[1]),

        ]
        # 调用函数
        result = self._extract_and_classify(img, slices, save_num, save_err,1)

        if result == -1:
            o_x_1 = list(map(lambda f: int(f), self._resolution_case['MK19']['1']['o_x_1'].split(":")))
            slices = [
                (o_x_1[0], o_x_1[1]),
            ]
            result = self._extract_and_classify(img, slices, save_num, save_err,0)
        return result
    def fire(self, count, dir, angle):
        pass
