from weapons.super_weapon import Super_Weapon
import json
import os
import random
import re
import threading
import time
import traceback
from datetime import datetime

import cv2
import ddddocr
import numpy as np
import pyautogui

from show_info import topmost_orientation, topmost_mail
from utils.classify.mail import PredictMail, PredictNumber
from utils.redis_connect import redis_cli
from utils.utils import generate_bezier_points, get_settings, get_resolution_case, log, save_num, filter_lines_by_y1, \
    is_stop, press_key, shortest_angle_distance

pyautogui.FAILSAFE = False
from utils.calculate_press_time import  calculate_press_ws_time
from utils.mouse.mouse_ghub import Mouse_ghub
from utils.screen_shot import screen_shot


class Mortar(Super_Weapon):
    def __init__(self):
        # self._number_classify = NumberClassify()
        super().__init__()
        self._press_mail_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [35, 51, 68, 81, 100]
        }
        self._press_oriention_dict = {
            "press_time": [0.1, 0.2, 0.3, 0.4, 0.5],
            "dist": [10.4, 15.7, 21.2, 25.6,30.7]
        }
        self._count = 0

    def _mouse_move_mail(self, gap, move_orientation=False):

        for i in range(abs(gap)):
            time.sleep(0.01)
            self._mouse.move((8 if i % 10 == 0 else 0) if move_orientation else 0, 8 * (-1 if gap > 0 else 1))


    def _get_mail(self, saved=True, error_save=True):
        '''
        获取密位
        :param img:
        :return:
        '''
        # 切割图像，只要刻度部分

        img = self._screen.capture(self._resolution_case['mail_t_x'], self._resolution_case['mail_t_y'],
                                   self._resolution_case['mail_b_x'], self._resolution_case['mail_b_y'])
        image = img[:, self._resolution_case['mail_l_x1']:self._resolution_case['mail_l_x2']]

        # 将图像转换为灰度图
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # 应用较大的自适应阈值窗口以避免噪声和较小的物体
        binary_image = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                             cv2.THRESH_BINARY_INV, 35, 15)

        # 使用较小的核心以防止靠近的线条融合。
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (10, 2))
        morph_image = cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, horizontal_kernel, iterations=1)
        lsd = cv2.createLineSegmentDetector(0)
        # 检测线段
        lines = lsd.detect(morph_image)[0]
        # 将线段坐标提取为元组列表
        line_coordinates = [tuple(line[0]) for line in lines] if lines is not None else []

        # 过滤线段坐标
        filtered_line_coordinates = filter_lines_by_y1(line_coordinates, self._resolution_case['y1_threshold'])

        thick_lines = []
        if filtered_line_coordinates is not None:
            for line in filtered_line_coordinates:
                x1 = line[0] + self._resolution_case['mail_l_x1']
                y1 = line[1]
                x2 = line[2] + self._resolution_case['mail_l_x1']
                y2 = line[3]

                thick_lines.append(line)
                # 画线
                cv2.line(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        if not thick_lines:
            return None

        thick_lines = sorted(thick_lines, key=lambda l: l[1], reverse=False)
        mail_lines = list(filter(lambda l: abs(l[0] - l[2]) > 60, thick_lines))
        mail = None
        mail_lines = sorted(mail_lines, key=lambda l: abs(l[0] - l[2]), reverse=True)
        for mail_line in mail_lines:
            # width_img = img[max(0, mail_line[1] - 30):min(260, mail_line[1] + 30),]
            # cv2.line(img, (0, mail_line[1]), (260, mail_line[3]), (0, 0, 255), 2)
            mail_img = img[max(0, mail_line[1] - 30):min(
                self._resolution_case['mail_b_y'] - self._resolution_case['mail_t_y'],
                mail_line[1] + 30),
                       :mail_line[0] + self._resolution_case['mail_l_x1']]

            # Convert the image to grayscale
            gray = cv2.cvtColor(mail_img, cv2.COLOR_BGR2GRAY)
            if mail_img.size == 0:
                continue
            _, mail_img = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
            # 配置 tesseract 以仅识别数字

            mail = self._mail_model(mail_img)

            if mail > 0:

                n = min(thick_lines, key=lambda coord: abs(
                    coord[1] - int((self._resolution_case['mail_b_y'] - self._resolution_case['mail_t_y']) / 2)))
                n_index = thick_lines.index(n)
                m_index = thick_lines.index(mail_line)
                if mail_line[1] > int((self._resolution_case['mail_b_y'] - self._resolution_case['mail_t_y']) / 2):
                    mail = mail + abs(m_index - n_index)
                else:
                    mail = mail - abs(m_index - n_index)
                break
        return mail

    def _amend_mail(self, target, deep=0):

        mail = self._get_mail()
        if is_stop():
            return False
        if not mail:
            return None
        # log(f"识别到当前密位:{mail}")
        # cv2.imwrite(f'{mail}.png', img)
        if mail > 1580 or mail < 800:
            log(f"识别密位错误，重新识别")
            # cv2.imwrite(f'./imgs/error/mails/{mail}_{time.time()}.png', img)
            if mail < 800:
                self._mouse_move_mail(3)
            else:
                self._mouse_move_mail(-3)
            if deep >= 4:
                return None
            return self._amend_mail(target, deep + 1)

        gap = target - mail
        if abs(gap) >= get_settings()['mail_gap']:
            if deep > 3:
                return False
            self._mouse_move_mail(gap)
            time.sleep(0.1)
            return self._amend_mail(target, deep + 1)
        else:
            return True

    def _move_target_mail(self, target, deep=0):
        '''

        :param target:
        :return:r
       '''

        mail = self._get_mail()
        if is_stop():
            return False
        if not mail:
            return None
        # log(f"识别到当前密位:{mail}")
        # cv2.imwrite(f'{mail}.png', img)
        if mail > 1580 or mail < 800:
            log(f"识别密位错误，重新识别")
            # cv2.imwrite(f'./imgs/error/mails/{mail}_{time.time()}.png', img)
            if mail < 900:
                self._mouse_move_mail(3)
            else:
                self._mouse_move_mail(-3)
            if deep >= 4:
                return None
            return self._move_target_mail(target, deep + 1)

        gap = target - mail
        start_point = 0  # 起始水平位置
        end_point = gap  # 终点水平位置
        # 设定控制点以创建过头然后修正的效果
        # 第一个控制点向目标方向推进，第二个控制点过头一些，然后终点回归
        # control_points = [int(gap * (1 / 4)), int(gap * (6 / 5)), int(gap * 9 / 10),
        #                   int(gap * 12 / 11)]  # 控制点列表，可以调整以改变曲线形状

        mail_trajectory = random.choice(json.loads(redis_cli.get("squad:trajectory:custom"))['mail'])
        control_points = list(map(lambda f: int(gap * f), mail_trajectory['points']))
        bezier_points = generate_bezier_points(start_point, end_point,
                                               control_points,
                                               num_points=mail_trajectory['num_points'] if mail_trajectory[
                                                                                               'num_points'] >= 2 else 2)

        # if len(bezier_points) == 2:
        #     self._mouse_move_mail(gap)
        #     return True
        for i in range(1, len(bezier_points)):
            gap = bezier_points[i] - bezier_points[i - 1]
            if abs(gap) > 35:
                press_key('w' if gap > 0 else 's', calculate_press_ws_time(abs(gap), self._press_mail_dict))
                time.sleep(random.uniform(0.1, 0.3))
            elif abs(gap) <= 35:
                self._mouse_move_mail(gap)
                time.sleep(random.uniform(0.1, 0.3))

        return self._amend_mail(target)





    def fire(self, count, dir, angle):
        '''

        :param count:   一轮打几炮
        :param dir:     方位
        :param angle:   密位
        :return:
        '''
        try:
            f1 = self._move_target_orientation(dir)
            f2 = self._move_target_mail(int(angle))

            # if not f1 or not f2:
            #     log("跳过该点")
            #     return

            time.sleep(random.uniform(get_settings()['beforeFire'][0], get_settings()['beforeFire'][0]))
            log("开炮!!!")
            for i in range(count):

                if is_stop():
                    break

                self._mouse.leftDown()

                time.sleep(1.2)
                self._mouse.leftUp()
                self._count += 1
                if self._count == 3:
                    # 换弹
                    press_key('r', 0.1)
                    time.sleep(3.5)
                    self._mouse.rightDown()
                    self._mouse.rightUp()
                    self._count = 0

                time.sleep(0.1)
        except Exception as e:
            print(traceback.format_exc())
