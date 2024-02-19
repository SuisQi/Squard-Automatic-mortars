import numpy as np
from scipy.special import comb


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


def generate_bezier_points(start_point, end_point, control_points, num_points=5):
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
            bezier_point += comb(n+1, i) * (1-t)**(n+1-i) * t**i * point
        bezier_points.append(bezier_point)
    # 四舍五入并转换为整数
    bezier_points_rounded = np.round(bezier_points).astype(int)
    return filter_points(bezier_points_rounded)
