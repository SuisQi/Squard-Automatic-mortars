import json
import os
import random
import re
import time
import traceback
from datetime import datetime

import cv2
import ddddocr
import numpy as np
import pyautogui

from utils.redis_connect import redis_cli
from utils.utils import generate_bezier_points, get_settings

pyautogui.FAILSAFE = False
from utils.calculate_press_time import calculate_press_ad_time, calculate_press_ws_time
from utils.mouse.mouse_ghub import Mouse_ghub
from utils.screen_shot import screen_shot



pubsub_msgs = []  # 一个日志队列
screen_size = pyautogui.size()
WIDTH = screen_size.width
HEIGHT = screen_size.height


def get_resolution_case():
    try:
        with open("./resolution_case.json", 'r') as f:
            resolution_cases = json.load(f)
    except FileNotFoundError:
        print("未找到resolution_case.json文件。")
        return False
    except json.JSONDecodeError:
        print("JSON解码错误。")
        return False

    res = list(filter(lambda f: f['name'] == f'{WIDTH}*{HEIGHT}', resolution_cases))
    if not res:
        print(f'{WIDTH}*{HEIGHT}分辨率未做适配')
        return False

    res = res[0]
    # 确保使用正确的数据类型和访问方式
    res['mail_b_x'] = res['mail_c_x']
    res['mail_b_y'] = res['mail_c_y'] - res['mail_t_y'] + res['mail_c_y']

    # 可能需要返回更新后的配置，以便外部使用
    return res


resolution_case = get_resolution_case()


def log(msg):
    # 获取当前时间
    now = datetime.now()
    t = now.strftime("%Y-%m-%d %H:%M:%S.") + str(now.microsecond)[:3]
    pubsub_msgs.append(f'{t}  :{msg}')


def filter_lines_by_y1(coords, y1_threshold):
    filtered_coords = []
    for coord in coords:
        # 检查当前坐标与已过滤坐标的 y1 值之差
        if all(abs(coord[1] - c[1]) >= y1_threshold for c in filtered_coords):
            filtered_coords.append(coord)
    return filtered_coords


def get_mil(img, saved=True, error_save=True):
    '''
    获取密位
    :param img:
    :return:
    '''
    # cv2.imwrite(f'imgs/mail_test/test.png', img)
    # 步骤1：切割图像，只要刻度部分
    image = img[:, resolution_case['mail_l_x1']:resolution_case['mail_l_x2']]
    # cv2.imwrite(f'imgs/mail_test/test2.png', image)

    # 转换为灰度图
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 应用二值化
    _, binary = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    # 步骤3：使用霍夫变换(HoughLinesP)检测线条并获取线条的端点
    lines = cv2.HoughLinesP(binary, 1, np.pi / 180, threshold=20, minLineLength=5, maxLineGap=30)
    # Extract the line coordinates into a list of tuples
    line_coordinates = [tuple(line[0]) for line in lines] if lines is not None else []

    # Filter the line coordinates
    filtered_line_coordinates = filter_lines_by_y1(line_coordinates, 5)

    # 步骤4：基于线条长度过滤出粗线，并在图像上绘制
    thick_lines = []
    if filtered_line_coordinates is not None:
        for line in filtered_line_coordinates:
            x1 = line[0] + resolution_case['mail_l_x1']
            y1 = line[1]
            x2 = line[2] + resolution_case['mail_l_x1']
            y2 = line[3]
            length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            if length > 20 and abs(y2 - y1) < 4:  # 假设粗线条长度大于20像素
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
        mail_img = img[max(0, mail_line[1] - 30):min(resolution_case['mail_b_y'] - resolution_case['mail_t_y'],
                                                     mail_line[1] + 30), :mail_line[0] + resolution_case['mail_l_x1']]

        # Convert the image to grayscale
        gray = cv2.cvtColor(mail_img, cv2.COLOR_BGR2GRAY)
        if mail_img.size == 0:
            continue
        _, mail_img = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
        # 配置 tesseract 以仅识别数字

        _, image_bytes = cv2.imencode('.png', mail_img)
        mail = ocr.classification(image_bytes.tobytes())

        if len(mail) > 0:
            if saved:

                file_name = f'./imgs/mail/{mail}/{mail}_{int(time.time() * 1000)}.png'

                folder_path = f'./imgs/mail/{mail}'
                if not os.path.exists(folder_path):
                    # 创建文件夹
                    os.makedirs(folder_path)
                cv2.imwrite(file_name, mail_img)
            if error_save and (int(mail) > 1580 or int(mail) < 800):

                file_name = f'./imgs/error/mail/{mail}/{mail}_{int(time.time() * 1000)}.png'

                folder_path = f'./imgs/error/mail/{mail}'
                if not os.path.exists(folder_path):
                    # 创建文件夹
                    os.makedirs(folder_path)
                cv2.imwrite(file_name, mail_img)
                cv2.imwrite(f"./imgs/error/mail/{time.time() * 1000}.png", img)
                # cv2.imwrite(f'imgs/all/{mail}_e{int(time.time()*1000)}.png',width_img)
                # cv2.imwrite(f'imgs/all/{mail}_{int(time.time() * 1000)}.png', img)
            mail = re.sub(r'[^\d]', '', mail)
            if mail == '':
                return 100000
            mail = int(mail)

            n = min(thick_lines, key=lambda coord: abs(
                coord[1] - int((resolution_case['mail_b_y'] - resolution_case['mail_t_y']) / 2)))
            n_index = thick_lines.index(n)
            m_index = thick_lines.index(mail_line)
            if mail_line[1] > int((resolution_case['mail_b_y'] - resolution_case['mail_t_y']) / 2):
                mail = mail + abs(m_index - n_index)
            else:
                mail = mail - abs(m_index - n_index)
            break

    return mail


def press_key(key, seconds=0.5):
    pyautogui.keyDown(key)

    # 等待 10 毫秒
    time.sleep(seconds)

    # 松开 'W' 键
    pyautogui.keyUp(key)


def shortest_angle_distance(angle_a, angle_b):
    """
    计算在圆上从角度A到角度B的最短角度距离。

    参数:
    angle_a - 当前方位
    angle_b - 目标方位

    返回:
    最短角度距离（顺时针为正，逆时针为负）
    """
    # 规范化角度到 [0, 360) 范围
    angle_a %= 360
    angle_b %= 360

    # 计算两种可能的角度差：顺时针和逆时针
    distance_clockwise = (angle_b - angle_a) % 360
    distance_counterclockwise = (angle_a - angle_b) % 360

    # 选择最短的角度距离，并确定是顺时针还是逆时针
    if distance_clockwise <= distance_counterclockwise:
        return distance_clockwise
    else:
        return -distance_counterclockwise


def save_num(img, name, save_err):
    if not save_err:
        return
    if not name:
        return
    file_path = f"./imgs/orientation/train/{name}"
    if not os.path.exists(file_path):
        os.mkdir(file_path)

    cv2.imwrite(file_path + f"/{name}_{time.time() * 1000}.png", img)


def extract_and_classify(img, slices, number_classify, save_num, save_err):
    result = 0
    for i, (start, end) in enumerate(slices):
        try:
            img_slice = img[:, start:end]  # 提取图像切片
            number_ = number_classify.detect(img_slice)
            cv2.imwrite(f"./number_test/{number_}_{time.time() * 1000}.png", img_slice)

            number = int(number_)  # 识别数字
            result += number * (10 ** (3 - i))  # 计算结果，假设是从最高位到最低位
        except Exception as e:
            cv2.imwrite(f"./number_test/{number_}_{time.time() * 1000}.png", img_slice)
            print(e)
            return None

        # 保存图像和数字
        # save_num(img_slice, number, save_err)

    return result


def get_orientation(number_classify, img, save_err=False):
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
        o_x_1 = list(map(lambda f: int(f), resolution_case['o_x_1'].split(":")))
        o_x_2 = list(map(lambda f: int(f), resolution_case['o_x_2'].split(":")))
        o_x_3 = list(map(lambda f: int(f), resolution_case['o_x_3'].split(":")))
        o_x_4 = list(map(lambda f: int(f), resolution_case['o_x_3'].split(":")))
        slices = [
            (o_x_1[0], o_x_1[1]),
            (o_x_2[0], o_x_2[1]),
            (o_x_3[0], o_x_3[1]),
            (o_x_4[0],
             o_x_4[1] if len(o_x_4) > 1 else resolution_case['orientation_b_x'] - resolution_case[
                 'orientation_t_x']),

        ]
        # 调用函数
        result = extract_and_classify(img, slices, number_classify, save_num, save_err)
        return result
    except Exception as e:
        # log(traceback.format_exc())
        return None


ocr = ddddocr.DdddOcr(show_ad=False, import_onnx_path="./squard.onnx", charsets_path="./charsets.json")


def stop():
    state = redis_cli.get("squad:fire_data:control:state")
    state = int(state)
    if state == 1:
        return False
    return True


class Squard():
    def __init__(self):
        # self._number_classify = NumberClassify()
        self._number_classify = ddddocr.DdddOcr(show_ad=False, import_onnx_path="./squard_orientation.onnx",
                                                charsets_path="./charsets_orientation.json")
        self._screen = screen_shot()
        self._mouse = Mouse_ghub()
        self._count = 0

    def _mouse_move_mail(self, gap, move_orientation=False):

        for i in range(abs(gap)):
            time.sleep(0.01)
            self._mouse.move((28 if i % 10 == 0 else 0) if not move_orientation else 0, 27 * (-1 if gap > 0 else 1))

    def _mouse_move_orientation(self, gap):
        count = 0
        for i in range(int(abs(gap) * 10)):
            time.sleep(0.01)
            if i % 5 == 0:
                count = count + 1
                time.sleep(random.uniform(0.1, 0.3))
            # self._mouse.move(12 * (1 if gap > 0 else -1), 27 if i % 5 == 0 else 0)
            self._mouse.move(12 * (1 if gap > 0 else -1), 0)
        # self._mouse_move_mail(count,move_orientation=True)

    def _move_mail(self, target, deep=0):

        img = self._screen.capture(resolution_case['mail_t_x'], resolution_case['mail_t_y'],
                                   resolution_case['mail_b_x'], resolution_case['mail_b_y'])
        mail = get_mil(img)
        if not mail:
            return None
        # log(f"识别到当前密位：{mail}")
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
            return self._move_mail(target, deep + 1)

        gap = target - mail
        if gap >= get_settings()['mail_gap']:
            if deep > 3:
                return False
            self._mouse_move_mail(gap)
            time.sleep(0.1)
            return self._move_mail(target, deep + 1)
        else:
            return True

    def _move_target_mail(self, target, deep=0):
        '''

        :param target:
        :return:r
       '''
        img = self._screen.capture(resolution_case['mail_t_x'], resolution_case['mail_t_y'],
                                   resolution_case['mail_b_x'], resolution_case['mail_b_y'])
        mail = get_mil(img)
        if not mail:
            return None
        # log(f"识别到当前密位：{mail}")
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
        print(control_points)
        print(bezier_points)
        # if len(bezier_points) == 2:
        #     self._mouse_move_mail(gap)
        #     return True
        for i in range(1, len(bezier_points)):
            gap = bezier_points[i] - bezier_points[i - 1]
            if abs(gap) > 35:
                press_key('w' if gap > 0 else 's', calculate_press_ws_time(abs(gap)))
                time.sleep(random.uniform(0.1, 0.3))
            elif abs(gap) <= 35:
                self._mouse_move_mail(gap)
                time.sleep(random.uniform(0.1, 0.3))
        #

        # if abs(gap) <= 1:
        #     return True
        # if abs(gap) > 35:
        #     press_key('w' if gap > 0 else 's', calculate_press_ws_time(abs(gap)))
        #
        #     return self._move_target_mail(target, deep)
        # elif abs(gap) <= 35:
        #     self._mouse_move_mail(gap)
        #     time.sleep(0.1)
        #     return self._move_target_mail(target, deep)
        return self._move_mail(target)

    def _move_target_orientation(self, target, deep=0):
        '''

        :param target:
        :return:
        '''

        # TODO  这里把获取方位的图像位置调为根据分辨率自动调整
        img = self._screen.capture(resolution_case['orientation_t_x'], resolution_case['orientation_t_y'],
                                   resolution_case['orientation_b_x'], resolution_case['orientation_b_y'])
        if not os.path.exists("./imgs/orientation"):
            os.makedirs("./imgs/orientation")

        cv2.imwrite(f"./imgs/orientation/{time.time() * 1000}.png", img)
        _, image_bytes = cv2.imencode('.png', img)
        # orientation = get_orientation(self._number_classify, img)
        orientation = self._number_classify.classification(image_bytes.tobytes())
        # orientation = get_orientation(self._number_classify, img)

        if not orientation:
            log("方位识别错误")
            return False
        orientation = int(orientation) / 10
        # log(f"当前方位{orientation}")
        if orientation > 360 or orientation < 0:
            log(f"获取方位错误，重新获取")
            press_key('d', 0.01)
            return self._move_target_orientation(target)
        # cv2.imwrite(f'{orientation}.png', img)
        gap = shortest_angle_distance(orientation, target)
        # log(f"误差{round(abs(gap), 2)}")
        if round(abs(gap), 2) <= get_settings()['orientation_gap']:
            return True
        if deep >= 5:
            return
        if abs(gap) > 10:
            seconds = calculate_press_ad_time(abs(gap))
            press_key('d' if gap > 0 else 'a', seconds)
            return self._move_target_orientation(target, deep + 1)
        else:
            self._mouse_move_orientation(gap)
            time.sleep(0.1)
            return self._move_target_orientation(target, deep + 1)


    def fire(self, count, dir, angle):
        '''

        :param count:   一轮打几炮
        :param dir:     方位
        :param angle:   密位
        :return:
        '''
        try:
            f2 = self._move_target_mail(angle)
            f1 = self._move_target_orientation(dir)

            # if not f1 or not f2:
            #     log("跳过该点")
            #     return

            time.sleep(random.uniform(get_settings()['beforeFire'][0], get_settings()['beforeFire'][0]))
            log("开炮!!!")
            for i in range(count):

                if stop():
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
