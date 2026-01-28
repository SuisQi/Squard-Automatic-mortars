import threading
import time
from pynput import keyboard, mouse


class KeyMouseListener:
    def __init__(self, ctrl_action=None, alt_action=None, shift_action=None, hotkey_actions=None):
        """
        初始化键鼠监听器

        参数:
            ctrl_action: Ctrl + 中键 回调
            alt_action: Alt + 中键 回调
            shift_action: Shift + 中键 回调
            hotkey_actions: 单键热键回调字典，格式 {keyboard.Key.f7: callback, ...}
        """
        self.is_ctrl_pressed = False
        self.is_alt_pressed = False
        self.is_shift_pressed = False
        self.is_middle_mouse_pressed = False
        self.ctrl_combination_detected = False
        self.alt_combination_detected = False
        self.shift_combination_detected = False
        self.ctrl_action = ctrl_action
        self.alt_action = alt_action
        self.shift_action = shift_action

        # 单键热键支持
        self.hotkey_actions = hotkey_actions or {}
        self._hotkey_cooldowns = {}  # 防抖时间记录
        self._cooldown_ms = 200  # 防抖间隔

    def on_key_press(self, key):
        try:
            if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
                self.is_ctrl_pressed = True
                self.check_combination()
            if key == keyboard.Key.alt_l or key == keyboard.Key.alt_r:
                self.is_alt_pressed = True
                self.check_combination()
            if key == keyboard.Key.shift:
                self.is_shift_pressed = True
                self.check_combination()

            # 检查单键热键
            self._check_hotkey(key)
        except AttributeError:
            pass

    def _check_hotkey(self, key):
        """检查并触发单键热键"""
        if key in self.hotkey_actions:
            now = time.time() * 1000
            last_time = self._hotkey_cooldowns.get(key, 0)

            # 防抖检查
            if now - last_time >= self._cooldown_ms:
                self._hotkey_cooldowns[key] = now
                action = self.hotkey_actions[key]
                if action:
                    threading.Thread(target=action).start()

    def on_key_release(self, key):
        try:
            if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
                self.is_ctrl_pressed = False
                self.ctrl_combination_detected = False
            if key == keyboard.Key.alt_l or key == keyboard.Key.alt_r:
                self.is_alt_pressed = False
                self.alt_combination_detected = False
            if key == keyboard.Key.shift:
                self.is_shift_pressed = False
                self.shift_combination_detected = False
        except AttributeError:
            pass

    def on_click(self, x, y, button, pressed):
        if button == mouse.Button.middle:
            self.is_middle_mouse_pressed = pressed
            if not pressed:
                self.ctrl_combination_detected = False
                self.alt_combination_detected = False
                self.shift_combination_detected = False
            self.check_combination()

    def check_combination(self):
        if self.is_ctrl_pressed and self.is_middle_mouse_pressed and not self.ctrl_combination_detected:
            if self.ctrl_action:
                self.ctrl_action()
            self.ctrl_combination_detected = True
        if self.is_alt_pressed and self.is_middle_mouse_pressed and not self.alt_combination_detected:
            if self.alt_action:
                threading.Thread(target=self.alt_action).start()
            self.alt_combination_detected = True
        if self.is_shift_pressed and self.is_middle_mouse_pressed and not self.shift_combination_detected:
            if self.shift_action:
                self.shift_action()
            self.shift_combination_detected = True

    def start(self):
        keyboard_listener = keyboard.Listener(on_press=self.on_key_press, on_release=self.on_key_release)
        mouse_listener = mouse.Listener(on_click=self.on_click)

        keyboard_listener.start()
        mouse_listener.start()

        keyboard_listener.join()
        mouse_listener.join()
