import json

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
        return False

    res = res[0]
    # 确保使用正确的数据类型和访问方式
    res['mail_b_x'] = res['mail_c_x']
    res['mail_b_y'] = res['mail_c_y'] - res['mail_t_y'] + res['mail_c_y']

    # 可能需要返回更新后的配置，以便外部使用
    return res
