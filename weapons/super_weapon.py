import json
import os
import random
import threading
import time
from abc import ABC, abstractmethod

import cv2
import ddddocr

from show_info import topmost_orientation, topmost_mail
from utils.calculate_press_time import calculate_press_ad_time
from utils.classify.mail import PredictMail, PredictNumber
from utils.mouse.mouse_ghub import Mouse_ghub
from utils.redis_connect import redis_cli
from utils.screen_shot import screen_shot
from utils.utils import get_resolution_case, is_stop, log, press_key, shortest_angle_distance, generate_bezier_points, \
    get_settings, save_num


class Super_Weapon(ABC):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Super_Weapon, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self._number_classify = ddddocr.DdddOcr(show_ad=False, import_onnx_path="./squard_orientation.onnx",
                                                charsets_path="./charsets_orientation.json")
        self._screen = screen_shot()
        self._mouse = Mouse_ghub()
        self._resolution_case = get_resolution_case()
        self._mail_model = PredictMail("./model/mail.onnx")
        self._number_model = PredictNumber("./model/number.onnx")
        self._press_oriention_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [10.4, 15.7, 21.2, 25.6, 30.7]
        }

    @abstractmethod
    def fire(self, count, dir, angle):
        '''

        :param count:   一轮打几炮
        :param dir:     方位
        :param angle:   密位
        :param max_pos  最高位 3表示千位
        :return:
        '''
        pass

    def _extract_and_classify(self, img, slices, save_num, save_err,max_pos=3):
        result = 0
        for i, (start, end) in enumerate(slices):
            try:
                img_slice = img[:, start:end]  # 提取图像切片
                number = self._number_model(img_slice)
                if number < 0:
                    save_num(img_slice, number, save_err)
                    return -1
                result += number * (10 ** (max_pos - i))  # 计算结果，假设是从最高位到最低位
            except Exception as e:
                print(e)
                return -1

            # 保存图像和数字
            # save_num(img_slice, number, save_err)

        return result

    def _get_orientation(self, save=True):
        img = self._screen.capture(self._resolution_case['orientation_t_x'], self._resolution_case['orientation_t_y'],
                                   self._resolution_case['orientation_b_x'], self._resolution_case['orientation_b_y'])
        if not os.path.exists("./imgs/orientation"):
            os.makedirs("./imgs/orientation")
        # 转换为灰度图
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 应用二值化
        _, img = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)
        _, image_bytes = cv2.imencode('.png', img)
        # orientation = get_orientation(self._number_classify, img)
        orientation = self._predict_orientation(img, save)
        if save:
            cv2.imwrite(f"./imgs/orientation/{time.time() * 1000}_{orientation}.png", img)
        # orientation = get_orientation(self._number_classify, img)
        if orientation == False:
            return False
        orientation = int(orientation) / 10
        return orientation

    def _predict_orientation(self, img, save_err=False):
        '''
        获取方位
        :return:
        '''
        try:
            # 2560*1600
            # result = int(number_classify.detect(img[:, :14])) * 1000
            # result += int(number_classify.detect(img[:, 16:27])) * 100
            # result += int(number_classify.detect(img[:, 27:44])) * 10
            # result += int(number_classify.detect(img[:, 48:]))
            # 2560*1400
            # 定义图像切片的起始和结束位置
            # slices = [(0, 15), (15, 27), (27, 39), (44, 57)]
            o_x_1 = list(map(lambda f: int(f), self._resolution_case['o_x_1'].split(":")))
            o_x_2 = list(map(lambda f: int(f), self._resolution_case['o_x_2'].split(":")))
            o_x_3 = list(map(lambda f: int(f), self._resolution_case['o_x_3'].split(":")))
            o_x_4 = list(map(lambda f: int(f), self._resolution_case['o_x_4'].split(":")))
            slices = [
                (o_x_1[0], o_x_1[1]),
                (o_x_2[0], o_x_2[1]),
                (o_x_3[0], o_x_3[1]),
                (o_x_4[0],
                 o_x_4[1] if len(o_x_4) > 1 else self._resolution_case['orientation_b_x'] - self._resolution_case[
                     'orientation_t_x']),

            ]
            # 调用函数
            result = self._extract_and_classify(img, slices, save_num, save_err)
            return result
        except Exception as e:
            # log(traceback.format_exc())
            return None

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

    def _amend_orientation(self, target, deep=0):
        try:

            orientation = self._get_orientation(False)
            if is_stop():
                return False
            if not orientation:
                log("方位识别错误")
                return False
            gap = shortest_angle_distance(orientation, target)
            if round(abs(gap), 2) <= get_settings()['orientation_gap']:
                return True

            if deep >= 5:
                return

            if orientation > 360 or orientation < 0:
                return self._amend_orientation(target, deep + 1)
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
            if deep >= 4:
                return
            return self._amend_orientation(target, deep + 1)

    def _mouse_move_orientation(self, gap, move_mail=False):
        # log(f"鼠标向{'右' if gap > 0 else '左'}移动{gap}")
        count = 0
        for i in range(int(abs(gap) * 10)):
            time.sleep(0.01)
            if i % 5 == 0:
                count = count + 1
                # time.sleep(random.uniform(0.1, 0.3))
            # self._mouse.move(12 * (1 if gap > 0 else -1), 27 if i % 5 == 0 else 0)
            self._mouse.move(4 * (1 if gap > 0 else -1), 4 if move_mail else 0)
        # self._mouse_move_mail(count,move_orientation=True)

    def _verify_orientation(self, target):
        gap = float(get_settings()['orientation_gap'])

        while True:
            orientation = self._get_orientation()
            if round(abs(orientation - target), 1) <= gap:
                topmost_orientation["set_background_color"]("#4ade80")
                return True
            if is_stop():
                return False

            time.sleep(0.1)

    def _get_mail(self):
        pass

    def _verify_mail(self, target):

        while True:
            mail = self._get_mail()
            if not mail:
                continue
            if round(mail - target, 1) == 0:
                topmost_mail["set_background_color"]("#4ade80")
                return True
            if is_stop():
                return False

            time.sleep(0.1)

    def listen_verify_orientation(self, target):
        topmost_orientation["set_background_color"]("#f87171")
        topmost_orientation["update_text"](f"方位:{target}")
        t = threading.Thread(target=self._verify_orientation, args=(target,))
        t.start()
        return t

    def listen_verify_mail(self, target):
        topmost_mail["set_background_color"]("#f87171")
        topmost_mail["update_text"](f"密位:{target}")
        t = threading.Thread(target=self._verify_mail, args=(target,))
        t.start()
        return t
