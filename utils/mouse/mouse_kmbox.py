#!/user/bin/env python
# coding=utf-8
"""
@project :
@author  : zengx
@file   : mouse_kmbox.py
@ide    : PyCharm
@time   : 2022-12-18 12:19:05
"""
import threading
import time
from time import sleep

import serial
import win32api
from pynput.mouse import Listener
import win32con

from utils.mouse.mouse_interface import Mouse


class Mouse_kmbox(Mouse):
    def __init__(self):
        super().__init__()
        self._ser, self._ret = self._openPort("COM5", 115200, 0.015)
        self._keys = []
        self._move_queue = []
        self._write_command = []
        self._read_command = []
        threading.Thread(target=self._send_key).start()

        # Listener(on_click=self._add).start()

    def move(self, x, y):
        self._move_queue.append((x, y))
        pass

    # 打开串口
    # 端口，GNU / Linux上的/ dev / ttyUSB0 等 或 Windows上的 COM3 等
    # 波特率，标准值之一：50,75,110,134,150,200,300,600,1200,1800,2400,4800,9600,19200,38400,57600,115200
    # 超时设置,None：永远等待操作，0为立即返回请求结果，其他值为等待超时时间(单位为秒）
    def _openPort(self, portx, bps, timeout):

        ret = False
        try:
            # 打开串口，并得到串口对象
            ser = serial.Serial(portx, bps, timeout=timeout)
            # 判断是否打开成功
            if ser.is_open:
                ret = True
            return ser, ret

        except Exception as e:
            print("---异常---：", e)

    def _writePort(self, text):
        try:
            result = self._ser.write(text.encode("utf-8"))  # 写数据
            self._ser.flush()
            return result
        except Exception as e:
            print(f"写数据异常{e}")
            return 0

    # 查按键是否被按下
    def _send_key(self):
        while True:
            move_count = 0
            if self._move_queue:
                try:
                    axis = self._move_queue.pop(0)
                    self._writePort(f"km.move({axis[0]},{axis[1]})\r\n")
                    # sleep(0.006)

                    self._ser.read(len(f"km.move({axis[0]},{axis[1]})\r\n>>> "))

                except Exception as e:
                    print(f"鼠标移动异常:{e}")

            keys = {
                "side1": win32con.VK_XBUTTON1,
                "left": win32con.VK_LBUTTON
            }
            for key in self._keys:
                if win32api.GetAsyncKeyState(keys[key['type']]) != 0:

                    if not key['pressed']:
                        if key['down_call_func']:
                            key['down_call_func'](*key['down_args'])
                        key['pressed'] = True
                elif win32api.GetAsyncKeyState(keys[key['type']]) == 0:
                    if key['pressed']:
                        if key['up_call_func']:
                            key['up_call_func'](*key['up_args'])
                        key['pressed'] = False

                if key['pressed']:
                    if key['call_func']:
                        key['call_func'](*key['press_args'])

    # def test(self):
    #     self._writePort(f"km.move({1},{1})\r\n")
    #     self._writePort(f"km.right()\r\n")
    #     self._writePort(f"km.side1()\r\n")
    #     print(int(time.time() * 1000))
    #     res = self._ser.read(len(f"km.move(1,1)\r\n>>> ")).decode("utf-8")
    #     print(int(time.time() * 1000))
    #     print([res])
    #     res = self._ser.read(len(f"km.right()\r\n0\r\n>>> ")).decode("utf-8")
    #     print(int(time.time() * 1000))
    #     print([res])
    #     res = self._ser.read(len(f"km.side1()\r\n0\r\n>>> ")).decode("utf-8")
    #     print(int(time.time() * 1000))
    #
    #     print([res])
    #

    def add_event(self, key, call_func=None, down_call_func=None, up_call_func=None, press_args=(), down_args=(),
                  up_args=()):
        """
        添加按键监听

        @param key: 按键名称    right|middle|left|side1|side2|side3|side4
        @param call_func:   按下按键的事件回调
        @param down_call_func: 刚按下按键的事件回调
        @param up_call_func:    刚松开按键的事件回调
        @param press_args:  按住时的参数
        @param down_args:   刚按下的参数
        @param up_args:        刚松开的参数
        @return:
        """
        k = {
            "command": f"km.{key}()\r\n",
            "type": key,
            "call_func": call_func,
            "down_call_func": down_call_func,
            "up_call_func": up_call_func,
            "pressed": False,
            "press_args": press_args,
            "down_args": down_args,
            "up_args": up_args
        }
        self._keys.append(k)

        pass

    def key_state(self, key):
        for k in self._keys:
            if key == k['type']:
                return k['pressed']
        assert f"请先使用add_event函数添加 {key} 的监听"
