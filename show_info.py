import tkinter as tk

from utils.utils import get_resolution_case


def create_topmost_window(x, y, width, height, text):
    # 创建新窗口
    window = tk.Toplevel()
    # 设置窗口无边框
    window.overrideredirect(True)
    # 窗口总在最前面
    window.attributes('-topmost', True)
    # 设置窗口位置和大小
    window.geometry(f"{width}x{height}+{x}+{y}")
    # 创建一个标签控件，添加到窗口中
    label = tk.Label(window, text=text, bg="#f87171", font=('Helvetica', 14))
    label.pack(ipadx=20, ipady=20)

    # 定义一个方法用来更新标签的文本内容
    def update_text(new_text):
        label.config(text=new_text)
        # 定义一个方法来控制窗口的显示与隐藏

    def set_visibility(visible):
        if visible:
            window.deiconify()  # 显示窗口
        else:
            window.withdraw()  # 隐藏窗口

        # 返回窗口, 更新文本函数和显示/隐藏控制函数

        # 定义一个方法来设置背景颜色

    def set_background_color(new_color):
        label.config(bg=new_color)

    return {
        "window": window,
        "update_text": update_text,
        "set_visibility": set_visibility,
        "set_background_color": set_background_color
    }


# 创建主窗口
root = tk.Tk()
win_w = 120
win_h = 50
# 隐藏主窗口
root.withdraw()
resolution_case = get_resolution_case()
# 创建两个置顶窗口，指定宽度和高度

topmost_orientation = create_topmost_window(
    int((resolution_case['orientation_b_x'] + resolution_case['orientation_t_x']) / 2 - win_w / 2),
    int(resolution_case['orientation_t_y'] - win_h - 3), win_w, win_h, "窗口 1")
topmost_mail = create_topmost_window(int(resolution_case['mail_b_x'] + 3), int(resolution_case['mail_c_y'] - win_h / 2),
                                     win_w, win_h, "窗口 2")

# 更新窗口文本内容的示例
topmost_mail["update_text"]("密位:1333")
topmost_orientation["update_text"]("方位:111.1")
topmost_mail['set_visibility'](False)
topmost_orientation['set_visibility'](False)

