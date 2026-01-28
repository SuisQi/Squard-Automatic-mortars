# -*- coding: utf-8 -*-
"""
地图贴图模块
使用 SIFT 特征匹配计算屏幕截图到底图的透视变换矩阵
"""
import base64
import json
import os
import time
from typing import Optional, Dict, Any, Tuple

import cv2
import numpy as np
import requests

from utils.screen_shot import screen_shot
from utils.utils import get_resolution_case, log


class MapOverlay:
    """地图贴图处理器 - 单例模式"""

    _instance = None

    # SIFT 特征匹配参数
    LOWE_RATIO = 0.7        # Lowe 比值测试阈值
    RANSAC_THRESHOLD = 5.0  # RANSAC 重投影误差阈值
    MIN_MATCH_COUNT = 10    # 最小匹配点数
    SCALE_FACTOR = 0.5      # 缩放因子，用于加速处理

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MapOverlay, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, 'initialized'):
            return
        self.initialized = True

        self._screen = screen_shot()
        self._resolution_case = get_resolution_case()
        self._sift = cv2.SIFT_create()
        self._flann = self._create_flann_matcher()

        # 底图相关
        self._base_map = None
        self._base_map_path = None
        self._base_keypoints = None
        self._base_descriptors = None
        self._base_scaled = None

        # 防抖
        self._last_trigger_time = 0
        self._cooldown_ms = 200


    def _create_flann_matcher(self) -> cv2.FlannBasedMatcher:
        """创建 FLANN 匹配器"""
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)
        return cv2.FlannBasedMatcher(index_params, search_params)

    def set_base_map(self, map_image_path: str) -> bool:
        """
        设置底图并预计算特征点

        参数:
            map_image_path: 底图文件路径 (minimap 或 terrainmap)

        返回:
            是否成功
        """
        if self._base_map_path == map_image_path and self._base_map is not None:
            # 底图未变化，无需重新计算
            return True

        if not os.path.exists(map_image_path):
            log(f"[MapOverlay] 底图文件不存在: {map_image_path}")
            return False

        self._base_map = cv2.imread(map_image_path)
        if self._base_map is None:
            log(f"[MapOverlay] 无法读取底图: {map_image_path}")
            return False

        self._base_map_path = map_image_path

        # 缩放底图加速特征提取
        self._base_scaled = cv2.resize(
            self._base_map, None,
            fx=self.SCALE_FACTOR,
            fy=self.SCALE_FACTOR
        )
        gray_base = cv2.cvtColor(self._base_scaled, cv2.COLOR_BGR2GRAY)

        # 预计算底图特征点和描述符
        start_time = time.time()
        self._base_keypoints, self._base_descriptors = self._sift.detectAndCompute(gray_base, None)
        elapsed = time.time() - start_time

        log(f"[MapOverlay] 底图特征点: {len(self._base_keypoints)}, 耗时: {elapsed:.2f}s")
        return True

    def capture_and_match(self) -> Optional[Dict[str, Any]]:
        """
        截取屏幕并计算透视变换

        返回:
            {
                'homography': list,        # 3x3 透视变换矩阵
                'corners': list,           # 截图在底图上的四角坐标
                'screenshotSize': [w, h],  # 截图尺寸
                'matchCount': int,         # 匹配点数量
                'inliers': int,            # RANSAC 内点数
                'screenshotBase64': str    # Base64 编码的截图 (JPEG)
            }
            匹配失败返回 None
        """
        if self._base_map is None or self._base_descriptors is None:
            log("[MapOverlay] 底图未设置，请先调用 set_base_map()")
            return None

        # 1. 截取游戏地图区域
        screenshot = self._capture_game_screen()
        if screenshot is None:
            log("[MapOverlay] 截图失败")
            return None

        start_time = time.time()

        # 2. 缩放截图
        scaled_shot = cv2.resize(
            screenshot, None,
            fx=self.SCALE_FACTOR,
            fy=self.SCALE_FACTOR
        )
        gray_shot = cv2.cvtColor(scaled_shot, cv2.COLOR_BGR2GRAY)

        # 3. 提取截图特征点
        kp_shot, des_shot = self._sift.detectAndCompute(gray_shot, None)
        if des_shot is None or len(kp_shot) < self.MIN_MATCH_COUNT:
            log(f"[MapOverlay] 截图特征点不足: {len(kp_shot) if kp_shot else 0}")
            return None

        # 4. FLANN KNN 匹配
        try:
            matches = self._flann.knnMatch(des_shot, self._base_descriptors, k=2)
        except cv2.error as e:
            log(f"[MapOverlay] FLANN 匹配失败: {e}")
            return None

        # 5. Lowe 比值测试筛选
        good_matches = []
        for match_pair in matches:
            if len(match_pair) == 2:
                m, n = match_pair
                if m.distance < self.LOWE_RATIO * n.distance:
                    good_matches.append(m)

        if len(good_matches) < self.MIN_MATCH_COUNT:
            log(f"[MapOverlay] 匹配点不足: {len(good_matches)} < {self.MIN_MATCH_COUNT}")
            return None

        # 6. 提取匹配点坐标
        src_pts = np.float32([kp_shot[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([self._base_keypoints[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

        # 7. RANSAC 计算 Homography
        H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, self.RANSAC_THRESHOLD)
        if H is None:
            log("[MapOverlay] 无法计算 Homography 矩阵")
            return None

        # 8. 计算截图四角在原始底图上的位置
        # H 是从 缩放截图 到 缩放底图 的变换
        # 我们需要将 原始截图四角 变换到 原始底图坐标
        h, w = screenshot.shape[:2]

        # 先将原始截图坐标缩放到匹配时使用的尺度
        corners_original = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
        corners_scaled = corners_original * self.SCALE_FACTOR

        # 使用 H 变换到缩放后的底图坐标
        corners_in_scaled_base = cv2.perspectiveTransform(corners_scaled, H)

        # 还原到原始底图坐标
        transformed_corners = corners_in_scaled_base / self.SCALE_FACTOR

        # 9. 编码截图为 Base64
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, 80]
        _, buffer = cv2.imencode('.jpg', screenshot, encode_params)
        screenshot_base64 = base64.b64encode(buffer).decode('utf-8')

        inliers = int(mask.ravel().sum())
        elapsed = time.time() - start_time

        log(f"[MapOverlay] 匹配成功: {len(good_matches)} 匹配, {inliers} 内点, 耗时: {elapsed:.2f}s")

        return {
            'homography': H.tolist(),  # 返回缩放空间的 H
            'corners': transformed_corners.reshape(-1, 2).tolist(),
            'screenshotSize': [w, h],
            'matchCount': len(good_matches),
            'inliers': inliers,
            'screenshotBase64': screenshot_base64
        }

    def _capture_game_screen(self) -> Optional[np.ndarray]:
        """截取游戏地图区域"""
        try:
            case = self._resolution_case
            img = self._screen.capture(
                case['map_l'], case['map_t'],
                case['map_r'], case['map_b']
            )
            return img
        except Exception as e:
            log(f"[MapOverlay] 截图异常: {e}")
            return None

    def overlay_to_frontend(self, map_path: str = None) -> bool:
        """
        执行贴图并发送到前端

        参数:
            map_path: 底图路径，如果为 None 则使用已设置的底图

        返回:
            是否成功
        """
        # 防抖检查
        now = time.time() * 1000
        if now - self._last_trigger_time < self._cooldown_ms:
            log("[MapOverlay] 冷却中，跳过")
            return False
        self._last_trigger_time = now

        # 设置底图（如果提供）
        if map_path and not self.set_base_map(map_path):
            return False

        if self._base_map is None:
            log("[MapOverlay] 请先设置底图")
            return False

        # 执行匹配
        result = self.capture_and_match()
        if result is None:
            return False

        # 发送到前端
        return self._send_to_frontend(result)

    def _send_to_frontend(self, result: Dict[str, Any]) -> bool:
        """通过 RPC 发送贴图数据到前端"""
        try:
            import urllib.parse
            rpc_param = json.dumps(result)
            # URL 编码参数，避免 Base64 中的 +/= 字符导致问题
            encoded_param = urllib.parse.quote(rpc_param, safe='')
            response = requests.post(
                f"http://127.0.0.1:12080/go?group=map&action=setMapOverlay&param={encoded_param}",
                timeout=10,
                proxies={}
            )
            response_json = response.json()

            if response_json.get('status') == 200:
                log("[MapOverlay] 贴图数据已发送到前端")
                return True
            else:
                log(f"[MapOverlay] RPC 响应异常: {response_json}")
                return False

        except requests.exceptions.Timeout:
            log("[MapOverlay] RPC 超时，前端可能未启动")
            return False
        except Exception as e:
            log(f"[MapOverlay] RPC 调用失败: {e}")
            return False

    def get_current_map_path(self) -> Optional[str]:
        """获取当前底图路径"""
        return self._base_map_path
