import time

import cv2
import numpy
import win32con
import win32gui
import win32ui


class screen_shot():
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
        width = right - left
        height = bottom - top

        # 为bitmap开辟存储空间
        self._saveBitMap.CreateCompatibleBitmap(self._mfcDC, width, height)
        # 将截图保存到saveBitMap中
        self._saveDC.SelectObject(self._saveBitMap)
        # 保存bitmap到内存设备描述表
        self._saveDC.BitBlt((0, 0), (width, height), self._mfcDC, (left, top),
                            win32con.SRCCOPY)
        signedIntsArray = self._saveBitMap.GetBitmapBits(True)
        im0 = numpy.frombuffer(signedIntsArray, dtype='uint8')
        im0.shape = (height, width, 4)
        im0 = cv2.cvtColor(im0, cv2.COLOR_BGRA2RGB)
        im0 = cv2.cvtColor(im0, cv2.COLOR_RGBA2BGR)
        return im0
