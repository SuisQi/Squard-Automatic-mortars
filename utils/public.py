import threading
import time

import cv2
import keyboard
import pyautogui
import pyperclip

from utils.redis_connect import redis_cli

MAP = None


def create_squad(squad_name):
    pyperclip.copy(f"createsquad {squad_name} 1")
    while True:
        state = redis_cli.get("squad:fire_data:control:createsquad")
        if state and squad_name:
            state = int(state)
            if state == 0:
                return

            # 按下 ~ 键
            keyboard.press_and_release("~")

            # time.sleep(0.01)
            # 模拟按下 Ctrl+V 进行粘贴
            keyboard.press_and_release("ctrl+v")
            # time.sleep(0.01)
            # 按下回车键
            keyboard.press_and_release("enter")
        # time.sleep(0.05)


def set_createsquad_state(squad_name):
    state = redis_cli.get("squad:fire_data:control:createsquad")
    state = int(state)
    if state == 0:
        redis_cli.set("squad:fire_data:control:createsquad", 1)
        threading.Thread(target=create_squad, args=(squad_name,)).start()
    else:
        redis_cli.set("squad:fire_data:control:createsquad", 0)
