import os
import random
import shutil
import threading

import os
import datetime
from PIL import ImageGrab
from pynput import mouse

from utils.utils import get_resolution_case

resolution_case = get_resolution_case()


def save_screen():
    # 获取当前时间作为文件名
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'./imgs/screen_shot/screenshot_{timestamp}.png'
    os.makedirs("./imgs/screen_shot", exist_ok=True)
    # 确保保存路径存在
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    # 截取特定区域并保存

    screenshot = ImageGrab.grab(
        bbox=(resolution_case['map_l'], resolution_case['map_t'], resolution_case['map_r'], resolution_case['map_b']))
    screenshot.save(filename)
    print(f'Screenshot saved to {filename}')


def on_click(x, y, button, pressed):
    # 判断是否按下中键
    if button == mouse.Button.middle and pressed:
        threading.Thread(target=save_screen).start()


# 监听鼠标事件
with mouse.Listener(on_click=on_click) as listener:
    listener.join()
