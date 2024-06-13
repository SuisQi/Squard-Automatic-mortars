import threading

from pynput import keyboard, mouse


class KeyMouseListener:
    def __init__(self, ctrl_action=None, alt_action=None):
        self.is_ctrl_pressed = False
        self.is_alt_pressed = False
        self.is_middle_mouse_pressed = False
        self.ctrl_combination_detected = False
        self.alt_combination_detected = False
        self.ctrl_action = ctrl_action
        self.alt_action = alt_action

    def on_key_press(self, key):
        try:
            if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
                self.is_ctrl_pressed = True
                self.check_combination()
            if key == keyboard.Key.alt_l or key == keyboard.Key.alt_r:
                self.is_alt_pressed = True
                self.check_combination()
        except AttributeError:
            pass

    def on_key_release(self, key):
        try:
            if key == keyboard.Key.ctrl_l or key == keyboard.Key.ctrl_r:
                self.is_ctrl_pressed = False
                self.ctrl_combination_detected = False
            if key == keyboard.Key.alt_l or key == keyboard.Key.alt_r:
                self.is_alt_pressed = False
                self.alt_combination_detected = False
        except AttributeError:
            pass

    def on_click(self, x, y, button, pressed):
        if button == mouse.Button.middle:
            self.is_middle_mouse_pressed = pressed
            if not pressed:
                self.ctrl_combination_detected = False
                self.alt_combination_detected = False
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

    def start(self):
        keyboard_listener = keyboard.Listener(on_press=self.on_key_press, on_release=self.on_key_release)
        mouse_listener = mouse.Listener(on_click=self.on_click)

        keyboard_listener.start()
        mouse_listener.start()

        keyboard_listener.join()
        mouse_listener.join()

