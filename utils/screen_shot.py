import time

import cv2
import mss
import numpy
import numpy as np
import win32con
import win32gui
import win32ui


class screen_shot():
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(screen_shot, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        # hwnd = win32gui.FindWindow(0, "dumpbin - Everything")
        # hwnd = win32gui.FindWindow(0, win_name)
        hwnd = win32gui.GetDesktopWindow()
        # hwnd = win32gui.FindWindow(0, "SquadGame  ")
        self._hWndDC = win32gui.GetWindowDC(hwnd)  # 0表示当前活跃的窗口
        # 创建设备描述表
        self._mfcDC = win32ui.CreateDCFromHandle(self._hWndDC)
        # 创建内存设备描述表
        self._saveDC = self._mfcDC.CreateCompatibleDC()
        # 创建位图对象准备保存图片
        self._saveBitMap = win32ui.CreateBitmap()
        # mss screen capture: get raw pixels from the screen as np array

        # left = left + 8
        # right = right - 8

    def capture(self, left, top, right, bottom):
        # width = right - left
        # height = bottom - top
        #
        # # 为bitmap开辟存储空间
        # self._saveBitMap.CreateCompatibleBitmap(self._mfcDC, width, height)
        # # 将截图保存到saveBitMap中
        # self._saveDC.SelectObject(self._saveBitMap)
        # # 保存bitmap到内存设备描述表
        # self._saveDC.BitBlt((0, 0), (width, height), self._mfcDC, (left, top),
        #                     win32con.SRCCOPY)
        # signedIntsArray = self._saveBitMap.GetBitmapBits(True)
        # im0 = numpy.frombuffer(signedIntsArray, dtype='uint8')
        # im0.shape = (height, width, 4)
        # im0 = cv2.cvtColor(im0, cv2.COLOR_BGRA2RGB)
        # im0 = cv2.cvtColor(im0, cv2.COLOR_RGBA2BGR)
        # return im0

        bbox = {
            "top": top,
            "left": left,
            "width": right - left,
            "height": bottom - top
        }
        with mss.mss() as sct:
            # 使用 sct.grab 捕获指定区域
            sct_img = sct.grab(bbox)
            # Converting to a NumPy array
            img_np = np.array(sct_img, dtype='uint8')
            # Ensuring the array is contiguous in memory
            img_np = np.ascontiguousarray(img_np[:, :, :3])  # Trimming to BGR and making contiguous
            return img_np
