import numpy as np
from scipy.optimize import curve_fit


def calculate_press_ad_time(y,data):
    """
    根据给定的输出y值，计算按键需要按下的时间。

    参数:
    y - 目标输出值

    返回:
    按键需要按下的时间（秒）
    """

    def fit_function(x, a, b):
        """
        定义一个线性函数来拟合数据。
        我们假设是线性关系，因为提供的数据点表明输出值随时间大致线性增加。
        """
        return a * x + b

    # 给定的数据
    x_data = np.array(data['press_time'])  # 时间（秒）
    y_data = np.array(data['dist'])  # 输出值

    # 进行线性曲线拟合
    params, _ = curve_fit(fit_function, x_data, y_data)

    # 提取参数 a 和 b
    a, b = params

    # 解线性方程 ax + b = y 来找到 x
    if a == 0:
        return "无解"  # 防止除以零
    time_to_press = (y - b) / a
    return time_to_press
def calculate_press_ws_time(y,data):
    """
    根据给定的输出y值，计算按键需要按下的时间。

    参数:
    y - 目标输出值

    返回:
    按键需要按下的时间（秒）
    """

    def fit_function(x, a, b):
        """
        定义一个线性函数来拟合数据。
        我们假设是线性关系，因为提供的数据点表明输出值随时间大致线性增加。
        """
        return a * x + b

    # 给定的数据
    x_data = np.array(data['press_time'])  # 时间（秒）
    y_data = np.array(data['dist'])  # 输出值

    # 进行线性曲线拟合
    params, _ = curve_fit(fit_function, x_data, y_data)

    # 提取参数 a 和 b
    a, b = params

    # 解线性方程 ax + b = y 来找到 x
    if a == 0:
        return "无解"  # 防止除以零
    time_to_press = (y - b) / a
    return time_to_press
