import concurrent.futures
import copy
import threading
import time

import cv2
import numpy as np


# def template_matching(target, template):
#     start_time = time.time()  # 开始计时
#     original_target = copy.deepcopy(target)
#
#     # 记录原始图像尺寸
#     original_target_shape = target.shape
#     original_template_shape = template.shape
#
#     # 缩小图像尺寸以加快处理速度
#     max_width = int(target.shape[1] * 0.25)
#     target_scale_percent = 100
#     template_scale_percent = 100
#
#     if target.shape[1] > max_width:
#         target_scale_percent = max_width / target.shape[1] * 100
#         target_width = int(target.shape[1] * target_scale_percent / 100)
#         target_height = int(target.shape[0] * target_scale_percent / 100)
#         target = cv2.resize(target, (target_width, target_height), interpolation=cv2.INTER_AREA)
#
#     if template.shape[1] > max_width:
#         template_scale_percent = max_width / template.shape[1] * 100
#         template_width = int(template.shape[1] * template_scale_percent / 100)
#         template_height = int(template.shape[0] * template_scale_percent / 100)
#         template = cv2.resize(template, (template_width, template_height), interpolation=cv2.INTER_AREA)
#
#     # 将图像转换为灰度图像
#     template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
#     target_gray = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)
#
#     # 初始化SIFT检测器
#     sift = cv2.SIFT_create()
#
#     def detect_and_compute(image):
#         """检测关键点和计算描述符的函数"""
#         return sift.detectAndCompute(image, None)
#
#     # 使用并行处理检测关键点和计算描述符
#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         future_template = executor.submit(detect_and_compute, template_gray)
#         future_target = executor.submit(detect_and_compute, target_gray)
#         kp1, des1 = future_template.result()
#         kp2, des2 = future_target.result()
#
#     # 使用FLANN进行特征匹配
#     FLANN_INDEX_KDTREE = 1
#     index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=10)
#     search_params = dict(checks=50)  # or pass empty dictionary
#
#     flann = cv2.FlannBasedMatcher(index_params, search_params)
#     matches = flann.knnMatch(des1, des2, k=2)
#
#     # 应用比值测试
#     good_matches = []
#     for m, n in matches:
#         if m.distance < 0.7 * n.distance:
#             good_matches.append(m)
#
#     # 提取匹配点
#     if len(good_matches) > 4:
#         src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
#         dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
#
#         # 使用RANSAC方法计算变换矩阵
#         M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
#
#         # 获取模板的宽度和高度
#         h, w = template_gray.shape
#
#         # 使用变换矩阵将模板的四个顶点变换到目标图像上
#         pts = np.float32([[0, 0], [0, h], [w, h], [w, 0]]).reshape(-1, 1, 2)
#         dst = cv2.perspectiveTransform(pts, M)
#
#         # 计算边界框并还原到原始图像的比例
#         left = int(dst[:, 0, 0].min() * original_target_shape[1] / target.shape[1])
#         top = int(dst[:, 0, 1].min() * original_target_shape[0] / target.shape[0])
#         right = int(dst[:, 0, 0].max() * original_target_shape[1] / target.shape[1])
#         bottom = int(dst[:, 0, 1].max() * original_target_shape[0] / target.shape[0])
#
#         # # 在原始图像上绘制边界框
#         cv2.rectangle(original_target, (left, top), (right, bottom), (0, 255, 0), 2)
#
#         # 保存结果图片
#         result_file_name = f'./imgs/maps/result/test.png'
#         cv2.imwrite(result_file_name, original_target)
#
#     end_time = time.time()
#     print(f"耗时: {end_time - start_time:.2f} 秒")

def build_pyramid(image, max_level=3):
    pyramid = [image]
    for level in range(1, max_level):
        image = cv2.pyrDown(image)
        pyramid.append(image)
    return pyramid
def template_matching(target, template):
    original_target = copy.deepcopy(target)
    start_time = time.time()  # 开始计时
    # 创建图像金字塔
    max_level = 4
    target_pyramid = build_pyramid(target, max_level)
    template_pyramid = build_pyramid(template, max_level)

    # 初始化SIFT检测器
    sift = cv2.SIFT_create(contrastThreshold=0.04, edgeThreshold=10)

    def detect_and_compute(image):
        """检测关键点和计算描述符的函数"""
        return sift.detectAndCompute(image, None)

    found_match = False

    for level in range(max_level - 1, -1, -1):
        target_resized = target_pyramid[level]
        template_resized = template_pyramid[level]

        # 将图像转换为灰度图像
        template_gray = cv2.cvtColor(template_resized, cv2.COLOR_BGR2GRAY)
        target_gray = cv2.cvtColor(target_resized, cv2.COLOR_BGR2GRAY)

        # 使用并行处理检测关键点和计算描述符
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_template = executor.submit(detect_and_compute, template_gray)
            future_target = executor.submit(detect_and_compute, target_gray)
            kp1, des1 = future_template.result()
            kp2, des2 = future_target.result()

        # 使用FLANN进行特征匹配
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=10)
        search_params = dict(checks=100)

        flann = cv2.FlannBasedMatcher(index_params, search_params)
        matches = flann.knnMatch(des1, des2, k=2)

        # 应用比值测试
        good_matches = []
        for m, n in matches:
            if m.distance < 0.7 * n.distance:
                good_matches.append(m)

        # 提取匹配点
        if len(good_matches) > 4:
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

            # 使用RANSAC方法计算变换矩阵
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 3.0)

            # 获取模板的宽度和高度
            h, w = template_gray.shape

            # 使用变换矩阵将模板的四个顶点变换到目标图像上
            pts = np.float32([[0, 0], [0, h], [w, h], [w, 0]]).reshape(-1, 1, 2)
            dst = cv2.perspectiveTransform(pts, M)

            # 计算边界框并还原到原始图像的比例
            scale = 2 ** level
            left = int(dst[:, 0, 0].min() * scale)
            top = int(dst[:, 0, 1].min() * scale)
            right = int(dst[:, 0, 0].max() * scale)
            bottom = int(dst[:, 0, 1].max() * scale)
            print(left,right,top,bottom)
            # 在原始图像上绘制边界框
            cv2.rectangle(original_target, (left, top), (right, bottom), (0, 255, 0), 2)

            # 保存结果图片
            result_file_name = f'./imgs/maps/result/test.png'
            cv2.imwrite(result_file_name, original_target)

            # 提前退出多分辨率循环
            found_match = True
            break

    if not found_match:
        print("未找到足够的匹配点。")
    end_time = time.time()
    print(f"耗时: {end_time - start_time:.2f} 秒")


t = cv2.imread("./templates/map/public/maps/tallil_minimap.jpg")
m = cv2.imread("./imgs/maps/error/1716953387665.png")

# for i in range(1_0):
template_matching(t, m)
