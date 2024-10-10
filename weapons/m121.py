import json
import os
import random
import threading
import time
import traceback

import cv2

from show_info import topmost_orientation, topmost_mail
from utils.calculate_press_time import calculate_press_ws_time, calculate_press_ad_time
from utils.redis_connect import redis_cli
from utils.utils import save_num, is_stop, log, generate_bezier_points, press_key, shortest_angle_distance, get_settings
from weapons.super_weapon import Super_Weapon


def get_second_decimal_place(number):
    # 转换数字为字符串，并找到小数点的位置
    str_number = str(number)
    decimal_index = str_number.find('.')

    # 如果没有小数点，返回 None
    if decimal_index == -1:
        return None

    # 确保有至少两位小数
    if len(str_number) > decimal_index + 2:
        return int(str_number[decimal_index + 2])
    else:
        return 0


def truncate_to_decimal_place(number, decimal_places):
    factor = 10 ** decimal_places
    truncated_number = int(number * factor) / factor
    return truncated_number


class M121(Super_Weapon):
    def __init__(self):
        super().__init__()
        self._press_mail_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [1.9, 2.7, 3.7, 4.6, 5.5]
        }
        self._press_oriention_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [10.4, 15.7, 21.2, 25.6, 30.7]
        }
        self._mail_amend = False  # 是否密位微调

    def fire(self, count, dir, angle):
        try:
            log("开炮!!!")
            for i in range(count):
                if is_stop():
                    break
                start_time = time.time()
                self._mail_amend = False
                self._move_target_orientation(dir)
                self._move_target_mail(angle)
                if is_stop():
                    break
                self._mail_amend = True
                self._move_target_orientation(dir)
                self._move_target_mail(angle)
                if is_stop():
                    break
                time.sleep(0.2)
                elapsed_time = time.time() - start_time
                if elapsed_time <= 3.3:
                    time.sleep(3.3 - elapsed_time)
                self._mouse.leftDown()
                time.sleep(1.2)
                self._mouse.leftUp()
                # 如果小于3s,就继续等待一会直到3s

        except Exception as e:
            print(traceback.format_exc())
        pass

    def _predict_mail(self, img, save_err=False):
        o_x_1 = list(map(lambda f: int(f), self._resolution_case['M121']['3']['o_x_1'].split(":")))
        o_x_2 = list(map(lambda f: int(f), self._resolution_case['M121']['3']['o_x_2'].split(":")))
        o_x_3 = list(map(lambda f: int(f), self._resolution_case['M121']['3']['o_x_3'].split(":")))
        slices = [
            (o_x_1[0], o_x_1[1]),
            (o_x_2[0], o_x_2[1]),
            (o_x_3[0], o_x_3[1]),

        ]
        # 调用函数
        result = self._extract_and_classify(img, slices, save_num, save_err)

        if result == -1:
            o_x_1 = list(map(lambda f: int(f), self._resolution_case['M121']['2']['o_x_1'].split(":")))
            o_x_2 = list(map(lambda f: int(f), self._resolution_case['M121']['2']['o_x_2'].split(":")))
            slices = [
                (o_x_1[0], o_x_1[1]),
                (o_x_2[0], o_x_2[1]),
            ]
            result = self._extract_and_classify(img, slices, save_num, save_err)
        return result

    def _get_mail(self, save=True):
        img = self._screen.capture(self._resolution_case['M121']['mail_left'],
                                   self._resolution_case['M121']['mail_top'],
                                   self._resolution_case['M121']['mail_right'],
                                   self._resolution_case['M121']['mail_bottom'])
        # 转换为灰度图
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 应用二值化
        _, img = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)
        # _, image_bytes = cv2.imencode('.png', img)
        mail = self._predict_mail(img, save)
        if save:
            if not os.path.exists("./imgs/mail/M121"):
                os.makedirs("./imgs/mail/M121")
            cv2.imwrite(f"./imgs/mail/M121/{time.time() * 1000}_{mail}.png", img)
        if mail == -1:
            return False
        return int(mail) / 100

    def _mouse_move_mail(self, gap, move_orientation=False, scale=50):

        for i in range(abs(gap)):
            time.sleep(0.02)
            self._mouse.move(0, scale * (-1 if gap > 0 else 1))

    def _move_target_mail(self, target, deep=0):
        mail = self._get_mail()
        if is_stop():
            return False

        if not mail:
            log("识别密位错误，重新识别")
            return

        if deep >= 4:
            return None
        gap = target - mail
        if abs(gap) > 2:
            start_point = 0  # 起始水平位置
            end_point = gap  # 终点水平位置

            mail_trajectory = random.choice(json.loads(redis_cli.get("squad:trajectory:custom"))['mail'])
            control_points = list(map(lambda f: int(gap * f), mail_trajectory['points']))
            bezier_points = generate_bezier_points(start_point, end_point,
                                                   control_points,
                                                   num_points=mail_trajectory['num_points'] if mail_trajectory[
                                                                                                   'num_points'] >= 2 else 2)
            print(bezier_points)
            for i in range(1, len(bezier_points)):
                gap = bezier_points[i] - bezier_points[i - 1]

                if abs(gap) > 2:
                    press_key('w' if gap > 0 else 's', calculate_press_ws_time(abs(gap), self._press_mail_dict))
                    time.sleep(random.uniform(0.1, 0.3))
                elif abs(gap) <= 2:
                    self._mouse_move_mail(gap * 10)
                    time.sleep(random.uniform(0.1, 0.3))
        return self._amend_mail(target)

    def _amend_mail(self, target, deep=0):
        _target = round(truncate_to_decimal_place(target, 1) - 0.1, 2)
        mail = self._get_mail()
        if is_stop():
            return False
        if not mail:
            return None
        # log(f"识别到当前密位:{mail}")
        # cv2.imwrite(f'{mail}.png', img)
        if mail == 0:
            print(f"识别密位错误，重新识别")

            return self._amend_mail(_target, deep + 1)
        if deep >= 5:
            return None

        gap = round(_target, 1) - mail

        gap = round(gap, 1)
        if abs(gap) >= 0.1:
            if deep > 5:
                return False
            self._mouse_move_mail(int(gap * 10))
            time.sleep(0.1)
            return self._amend_mail(target, deep + 1)
        else:
            if self._mail_amend:
                for i in range(1_0):
                    self._mouse_move_mail(1, scale=5)
                    mail = self._get_mail()
                    if mail == target:
                        print(f"微调次数:{get_second_decimal_place(target)}")
                        for j in range(get_second_decimal_place(target)):
                            self._mouse_move_mail(1, scale=5)
                        break
            return True

    def _mouse_move_orientation(self, gap, move_mail=False):
        # log(f"鼠标向{'右' if gap > 0 else '左'}移动{gap}")
        count = 0
        for i in range(int(abs(gap) * 10)):
            time.sleep(0.01)
            if i % 5 == 0:
                count = count + 1
                # time.sleep(random.uniform(0.1, 0.3))
            # self._mouse.move(12 * (1 if gap > 0 else -1), 27 if i % 5 == 0 else 0)
            self._mouse.move(10 * (1 if gap > 0 else -1), 0)
        # self._mouse_move_mail(count,move_orientation=True)

    def _amend_orientation(self, target, deep=0):
        try:
            deep_out = 10
            orientation = self._get_orientation(False)
            if is_stop():
                return False
            if not orientation:
                return False
            gap = round(shortest_angle_distance(orientation, target), 1)
            if gap == 0:
                time.sleep(0.3)
                orientation = self._get_orientation(False)
                if orientation == target:
                    return True
                return self._amend_orientation(target, deep + 1)

            if deep >= deep_out:
                print("超出递归")
                return False

            # if orientation > 360 or orientation < 0:
            #     return self._amend_orientation(target, deep + 1)
            if abs(gap) > 10:
                seconds = calculate_press_ad_time(abs(gap), self._press_oriention_dict)
                press_key('d' if gap > 0 else 'a', seconds)
                return self._amend_orientation(target, deep + 1)
            else:
                self._mouse_move_orientation(gap, True)
                time.sleep(0.1)
                return self._amend_orientation(target, deep + 1)
        except Exception:
            self._mouse_move_orientation(4, True)
            if deep >= 10:
                return
            return self._amend_orientation(target, deep + 1)

    def _move_target_orientation(self, target, deep=0):
        '''

        :param target:
        :return:
        '''

        # TODO  这里把获取方位的图像位置调为根据分辨率自动调整

        orientation = self._get_orientation()
        if is_stop():
            return False

        # log(f"当前方位{orientation}")
        if orientation < 0:
            log(f"获取方位错误，重新获取")
            press_key('d', 0.01)
            if deep >= 3:
                return False
            return self._move_target_orientation(target, deep + 1)

        gap = shortest_angle_distance(orientation, target)
        if abs(gap) > 5:
            start_point = 0  # 起始水平位置
            end_point = gap  # 终点水平位置

            orientation_trajectory = random.choice(json.loads(redis_cli.get("squad:trajectory:custom"))['orientation'])

            control_points = list(map(lambda f: int(gap * f), orientation_trajectory['points']))
            bezier_points = generate_bezier_points(start_point, end_point,
                                                   control_points,
                                                   num_points=orientation_trajectory['num_points'] if
                                                   orientation_trajectory[
                                                       'num_points'] >= 2 else 2)

            for i in range(1, len(bezier_points)):
                gap = bezier_points[i] - bezier_points[i - 1]
                if abs(gap) > 10:
                    press_key('d' if gap > 0 else 'a', calculate_press_ad_time(abs(gap), self._press_oriention_dict))
                    time.sleep(random.uniform(0.1, 0.3))
                elif abs(gap) <= 10:
                    self._mouse_move_orientation(gap, True)
                    time.sleep(random.uniform(0.1, 0.3))
        return self._amend_orientation(target)
