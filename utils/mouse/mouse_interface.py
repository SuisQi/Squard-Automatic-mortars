#!/user/bin/env python
# coding=utf-8
"""
@project :
@author  : zengx
@file   : mouse_interface.py
@ide    : PyCharm
@time   : 2022-12-18 12:15:24
"""


class Mouse:
    def __init__(self):
        pass

    def move(self, x, y):
        """
        移动鼠标到相对当前鼠标位置+x,+y的位置
        @param x:
        @param y:
        @return:
        """
        pass

    def add_event(self, key, call_func=None, down_call_func=None, up_call_func=None, press_args=(), down_args=(), up_args=()):
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
        pass

    def key_state(self, key):
        """
        获取按键的状态 按住或松开   要使用该函数必须先使用add_event函数添加对应按键的监听
        @param key: right|middle|left|side1|side2|side3|side4
        @return:    False:松开|True:按住
        """
        pass
