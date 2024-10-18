import json
import os
import socket
import time
from datetime import datetime

import numpy as np
import pyautogui
from scipy.special import comb

from utils.redis_connect import redis_cli


def filter_points(points):
    """
    去掉与上一个值相差大于35的值，
    只保留最后一个与上一个值大于35的值。
    """
    filtered_points = [points[0]]  # 初始化，总是包含第一个点

    i = 1
    while i < len(points):
        if abs(points[i] - filtered_points[-1]) > 35:
            # 查找下一个变化不超过35的点或数组结束
            j = i + 1
            while j < len(points) and abs(points[j] - points[i]) > 35:
                i = j  # 更新i以跳过这个点
                j += 1
            # i现在指向最后一个与前一个相差大于35的值
            # 如果i不是数组的最后一个索引，它将被跳过
            if j < len(points):
                i = j - 1  # 保留i指向的点，因为它是小于35变化的开始
        filtered_points.append(points[i])
        i += 1

    return np.array(filtered_points)


def generate_bezier_points(start_point, end_point, control_points, num_points):
    """
    生成任意次贝塞尔曲线上的点，以模拟过头然后修正的移动轨迹，并确保点为整数。

    参数:
    start_point (float): 起始点的水平位置。
    end_point (float): 终点的水平位置。
    control_points (list of float): 控制点的水平位置列表。
    num_points (int): 要生成的曲线点的数量。

    返回:
    np.ndarray: 曲线上的点的水平位置数组，值为整数。
    """
    n = len(control_points)  # 控制点的数量
    t_values = np.linspace(0, 1, num_points)
    bezier_points = []
    for t in t_values:
        bezier_point = 0
        for i, point in enumerate([start_point] + control_points + [end_point]):
            # 计算二项式系数 * 控制点权重
            bezier_point += comb(n + 1, i) * (1 - t) ** (n + 1 - i) * t ** i * point
        bezier_points.append(bezier_point)
    # 四舍五入并转换为整数
    bezier_points_rounded = np.round(bezier_points).astype(int)
    # return filter_points(bezier_points_rounded)
    return bezier_points_rounded


def calculate_nonuniform_x_coords(y_coords):
    """
    根据给定的纵坐标非均匀地计算横坐标，并确保横坐标单调递增，同时将横坐标值精确到小数点后两位。

    参数:
    y_coords (list): 纵坐标的列表。

    返回:
    list: 非均匀分配且精确到小数点后两位的横坐标列表。
    """
    # 确保纵坐标是一个Numpy数组
    y_coords_array = np.array(y_coords)

    # 计算纵坐标相对于最小值的差异
    y_diffs_relative = y_coords_array - y_coords_array.min()

    # 将这些差异归一化，以便它们的总和为1
    y_diffs_normalized = y_diffs_relative / np.sum(y_diffs_relative)

    # 计算非均匀的横坐标间隔
    x_coords_intervals = np.cumsum(y_diffs_normalized)

    # 生成横坐标，起始点为0
    x_coords = np.insert(x_coords_intervals, 0, 0)

    # 将横坐标精确到小数点后两位
    x_coords_rounded = np.round(x_coords, 2)

    # 由于归一化过程可能导致最后一个值小于1，需要手动设置最后一个横坐标为1
    x_coords_rounded[-1] = 1.0

    return x_coords_rounded[1:].tolist()


def get_settings():
    return json.loads(redis_cli.get("squad:settings"))


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
        input()
        return False

    res = res[0]
    # 确保使用正确的数据类型和访问方式
    res['mail_b_x'] = res['mail_c_x']
    res['mail_b_y'] = res['mail_c_y'] - res['mail_t_y'] + res['mail_c_y']

    # 可能需要返回更新后的配置，以便外部使用
    return res


import numpy as np
import cv2


def letterbox(img, new_shape=(640, 640), auto=False, scaleFill=False, scaleUp=True):
    """
    python的信封图片缩放
    :param img: 原图
    :param new_shape: 缩放后的图片
    :param color: 填充的颜色
    :param auto: 是否为自动
    :param scaleFill: 填充
    :param scaleUp: 向上填充
    :return:
    """
    shape = img.shape[:2]  # current shape[height,width]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleUp:
        r = min(r, 1.0)  # 确保不超过1
    ration = r, r  # width,height 缩放比例
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]
    if auto:
        dw, dh = np.mod(dw, 64), np.mod(dh, 64)
    elif scaleFill:
        dw, dh = 0.0, 0.0
        new_unpad = (new_shape[1], new_shape[0])
        ration = new_shape[1] / shape[1], new_shape[0] / shape[0]
    # 均分处理
    dw /= 2
    dh /= 2
    if shape[::-1] != new_unpad:
        img = cv2.resize(img, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))  # 添加边界
    return img, ration, (dw, dh)


def clip_coords(boxes, img_shape):
    """
    图片的边界处理
    :param boxes: 检测框
    :param img_shape: 图片的尺寸
    :return:
    """
    boxes[:, 0].clip(0, img_shape[1])  # x1
    boxes[:, 1].clip(0, img_shape[0])  # y1
    boxes[:, 2].clip(0, img_shape[1])  # x2
    boxes[:, 3].clip(0, img_shape[0])  # x2


def scale_coords(img1_shape, coords, img0_shape, ratio_pad=None):
    """
    坐标还原
    :param img1_shape: 旧图像的尺寸
    :param coords: 坐标
    :param img0_shape:新图像的尺寸
    :param ratio_pad: 填充率
    :return:
    """
    if ratio_pad is None:  # 从img0_shape中计算
        gain = min(img1_shape[0] / img0_shape[0], img1_shape[1] / img0_shape[1])  # gain=old/new
        pad = (img1_shape[1] - img0_shape[1] * gain) / 2, (img1_shape[0] - img0_shape[0] * gain) / 2
    else:
        gain = ratio_pad[0][0]
        pad = ratio_pad[1]

    coords[:, [0, 2]] -= pad[0]  # x padding
    coords[:, [1, 3]] -= pad[1]  # y padding
    coords[:, :4] /= gain
    clip_coords(coords, img0_shape)
    return coords


pubsub_msgs = []  # 一个日志队列


def log(msg):
    # 获取当前时间
    now = datetime.now()
    t = now.strftime("%H:%M:%S.") + str(now.microsecond)[:3]
    print(msg)
    pubsub_msgs.append(f'{t}  :{msg}')



def is_auto_fire():
    state = redis_cli.get("squad:fire_data:control:auto_fire")
    state = int(state)
    if state == 1:
        return True
    return False


def is_stop():
    state = redis_cli.get("squad:fire_data:control:state")
    state = int(state)
    if state == 1:
        return False
    return True

def save_num(img, name, save_err):
    if not save_err:
        return
    if not name:
        return
    file_path = f"./imgs/orientation/{name}"
    if not os.path.exists(file_path):
        os.mkdir(file_path)

    cv2.imwrite(file_path + f"/{name}_{time.time() * 1000}.png", img)


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

def filter_lines_by_y1(coords, y1_threshold):
    filtered_coords = []
    for coord in coords:
        # 检查当前坐标与已过滤坐标的 y1 值之差
        if all(abs(coord[1] - c[1]) >= y1_threshold for c in filtered_coords) and all(
                abs(coord[3] - c[3]) >= y1_threshold for c in filtered_coords) and coord[2] - coord[0] > 10:
            filtered_coords.append((int(coord[0]), int(coord[1]), int(coord[2]), int(coord[3])))
    return filtered_coords


def press_key(key, seconds=0.5):
    # log(f"按住{key} {seconds}s")
    pyautogui.keyDown(key)

    # 等待 10 毫秒
    time.sleep(seconds)

    # 松开 'W' 键
    pyautogui.keyUp(key)



