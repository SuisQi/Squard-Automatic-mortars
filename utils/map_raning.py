import concurrent
import copy
import json
import os
import threading
import time

import cv2
import numpy as np
import requests
from matplotlib import pyplot as plt
from tqdm import tqdm

from show_info import a_icon, b_icon, c_icon
from utils.screen_shot import screen_shot
from utils.utils import get_resolution_case, log
from utils.yolov5_detect import Detector, DetectorTRT, names_maps


def build_pyramid(image, max_level=3):
    pyramid = [image]
    for level in range(1, max_level):
        image = cv2.pyrDown(image)
        pyramid.append(image)
    return pyramid


class MapRanging():
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MapRanging, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if hasattr(self, 'initialized'):
            return
        self.initialized = True
        self._map = None
        self._resolution_case = get_resolution_case()
        self._screen = screen_shot()
        self._imgsz = 1280
        log("加载模型...")
        try:
            # n = 5 / 0
            self._detector = DetectorTRT(b"./model/map.engine", "./lib/yolov5.dll")
            log("使用trt加速")
        except Exception as e:
            self._detector = Detector("./model/map.onnx", self._imgsz, 0.25)
            log("使用onnx推理")
        log("模型加载完毕")
        warm_up_image = np.random.rand(self._imgsz, self._imgsz, 3).astype(np.float32)
        # log("开始模型预热")
        # for i in tqdm(range(100), desc="模型预热进度"):
        #     self._detector.detect(warm_up_image, loged=False)
        # log("模型预热完毕")
        self._type = "light-launcher"
        self._current_timer = None

    def set_map(self, file_name):
        self._map = cv2.imread(file_name)
        if self._map is None:
            raise ValueError(f"Could not read the map image from file: {file_name}")

    def _hidden_icons(self):
        if self._current_timer is not None:
            self._current_timer.cancel()
            self._current_timer = None
        a_icon['set_visibility'](False)
        b_icon['set_visibility'](False)
        c_icon['set_visibility'](False)

    def start(self):
        log("开始计算，结果没出来前请勿重复操作")
        img = self._screen.capture(self._resolution_case['map_l'], self._resolution_case['map_t'],
                                   self._resolution_case['map_r'], self._resolution_case['map_b'])
        os.makedirs("./imgs/maps", exist_ok=True)
        file_name = f'./imgs/maps/{int(time.time() * 1000)}.png'

        # img = cv2.imread("./imgs/maps/1716702594820.png")
        start_time = time.time()  # 开始计时
        try:
            top, bottom, right, left = self._template_matching(self._map, img)
            print(top, bottom, right, left)
            end_time = time.time()
            log(f"模板匹配耗时: {end_time - start_time:.2f} 秒")
            # top, bottom, right, left = (2935, 2949, 2838, 2837)
            start_time = time.time()  # 开始计时

            detections = self._detector.detect(img, 0.25)

            end_time = time.time()
            # self._detector.draw_detections(img, detections,"output.png")
            # print(f"yolo识别耗时: {end_time - start_time:.2f} 秒")
            # self._detector.draw_detections(img, detections, "output.png")
            for detection in detections:
                w = self._resolution_case['map_r'] - self._resolution_case['map_l']
                h = self._resolution_case['map_b'] - self._resolution_case['map_t']
                detection["pos"] = [((detection['bbox'][0] + detection['bbox'][2] / 2) / w * (right - left) + left) / (
                    self._map.shape[1]),
                                    ((detection['bbox'][1] + detection['bbox'][3] / 2) / h * (bottom - top) + top) / (
                                        self._map.shape[0])]
                detection["bbox"] = [(detection["bbox"][2] / w) * (right - left) / self._map.shape[1],
                                     (detection["bbox"][3] / h) * (bottom - top) / (self._map.shape[0])]

                log(f"检测到{names_maps[detection['class']]},置性度:{round(detection['confidence'],2)}")

            res = requests.post(
                f"http://127.0.0.1:12080/go?group=map&action=handlerData&param={json.dumps(detections)}",
                timeout=3).json()
            print(res)
            data = json.loads(res['data'])

            self._hidden_icons()
            if 't1' in data:

                s = f"A:"
                if "type" in data:
                    self._type = data['type']
                if self._type == "mortar":
                    if data['t1']['angle']:
                        s = s + f"{int(data['t1']['angle'])}°"
                    else:
                        s = s + f"超出范围"
                elif self._type == 'light-launcher':
                    s = s + f"{int(data['t1']['dist'] / 100)}m"
                if self._type != "":
                    a_icon['set_visibility'](True)
                a_icon["update_text"](s)

            if 'tB_1' in data:

                s = f"B:"
                if "type" in data:
                    self._type = data['type']
                if self._type == "mortar":
                    if data['tB_1']['angle']:
                        s = s + f"{int(data['tB_1']['angle'])}°"
                    else:
                        s = s + f"超出范围"
                elif self._type == 'light-launcher':
                    s = s + f"{int(data['tB_1']['dist'] / 100)}m"
                if self._type != "":
                    b_icon['set_visibility'](True)
                b_icon["update_text"](s)

            if 'tC_1' in data:

                s = f"C:"
                if "type" in data:
                    self._type = data['type']
                if self._type == "mortar":
                    if data['tC_1']['angle']:
                        s = s + f"{int(data['tC_1']['angle'])}°"
                    else:
                        s = s + f"超出范围"
                elif self._type == 'light-launcher':
                    s = s + f"{int(data['tC_1']['dist'] / 100)}m"
                if self._type != "":
                    c_icon['set_visibility'](True)
                c_icon["update_text"](s)
            # 结束计时
            self._current_timer = threading.Timer(6, self._hidden_icons)
            self._current_timer.start()
            # self._detector.free()
            # self._show_result(self._map, top, bottom, right, left)
            # return top, bottom, right, left

            cv2.imwrite(file_name, img)
        except ValueError as e:
            log("计算中止")
            return None

    def _template_matching(self, target, template):
        if target is None:
            log("请先去计算器选择地图")
            raise ValueError("Target image is not set. Please call set_map() with a valid image file.")
        if template is None:
            log("Template image is not provided.")
            raise ValueError("Template image is not provided.")

        # original_target = copy.deepcopy(target)
        start_time = time.time()  # 开始计时
        # 创建图像金字塔
        max_level = 4
        target_pyramid = build_pyramid(target, max_level)
        template_pyramid = build_pyramid(template, max_level)

        # 初始化SIFT检测器
        sift = cv2.SIFT_create()

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
            search_params = dict(checks=50)

            flann = cv2.FlannBasedMatcher(index_params, search_params)
            matches = flann.knnMatch(des1, des2, k=2)

            # 应用比值测试
            good_matches = []
            for m, n in matches:
                if m.distance < 0.6 * n.distance:
                    good_matches.append(m)

            # 提取匹配点
            if len(good_matches) > 4:
                src_pts = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                dst_pts = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

                # 使用RANSAC方法计算变换矩阵
                M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

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

                # 在原始图像上绘制边界框
                # cv2.rectangle(original_target, (left, top), (right, bottom), (0, 255, 0), 2)
                #
                # # 保存结果图片
                # result_file_name = f'./imgs/maps/result/{int(time.time() * 1000)}.png'
                # cv2.imwrite(result_file_name, original_target)

                # 提前退出多分辨率循环
                found_match = True
                return top, bottom, right, left
            log(f"{target_resized.shape}没匹配到地图,进行下一个阶层的检测")

        if not found_match:
            os.makedirs("./imgs/maps/error", exist_ok=True)
            error_file_name = f'./imgs/maps/error/{int(time.time() * 1000)}.png'
            cv2.imwrite(error_file_name, template)
            log("没有匹配到地图，缩放下试试")
            raise ValueError("")

    def _show_result(self, image, top, bottom, right, left):
        # 绘制矩形框
        cv2.rectangle(image, (left, top), (right, bottom), (0, 0, 255), 2)
        # 显示结果图像
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        plt.title('Template Matching Result')
        plt.show()
