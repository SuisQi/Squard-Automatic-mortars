import ctypes
import time

from ctypes import windll, c_long, c_ulong, Structure, Union, c_int, POINTER, sizeof, CDLL
from os import path

basedir = path.dirname(path.abspath(__file__))

"""
Input
"""
INPUT_MOUSE = 0  # 鼠标输入事件
INPUT_KEYBOARD = 1  # 键盘输入事件
INPUT_HARDWARE = 2  # 硬件输入事件
# ↓↓↓↓↓↓↓↓↓ 简易鼠标行为模拟,使用SendInput函数或者调用ghub驱动 ↓↓↓↓↓↓↓↓↓
LONG = c_long
DWORD = c_ulong
ULONG_PTR = POINTER(DWORD)

gmok = 0
# ↓↓↓↓↓↓↓↓↓ 简易鼠标行为模拟,使用SendInput函数或者调用ghub驱动 ↓↓↓↓↓↓↓↓↓
LONG = c_long
DWORD = c_ulong
ULONG_PTR = POINTER(DWORD)
# gm = CDLL(dlldir)
gmok = 0
"""
MouseInput
"""
MOUSEEVENTF_MOVE = 0x0001  # 移动
MOUSEEVENTF_LEFTDOWN = 0x0002  # 左键按下
MOUSEEVENTF_LEFTUP = 0x0004  # 左键释放
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0010
MOUSEEVENTF_MIDDLEDOWN = 0x0020
MOUSEEVENTF_MIDDLEUP = 0x0040
MOUSEEVENTF_XDOWN = 0x0080  # 侧键按下
MOUSEEVENTF_XUP = 0x0100  # 侧键释放
MOUSEEVENTF_WHEEL = 0x0800  # 滚轮垂直滚动, mouseData需传入滚动值, 一个滚动单位是120(像素?)
MOUSEEVENTF_HWHEEL = 0x1000  # 滚轮水平滚动
MOUSEEVENTF_MOVE_NOCOALESCE = 0x2000  # 移动消息不会被合并
MOUSEEVENTF_VIRTUALDESK = 0x4000  # Maps coordinates to the entire desktop. Must be used with MOUSEEVENTF_ABSOLUTE.
MOUSEEVENTF_ABSOLUTE = 0x8000  # 鼠标移动事件, 如果设置此标记就是绝对移动, 否则就是相对移动. 相对鼠标运动受鼠标速度(控制面板中的指针移动速度)和两个鼠标阈值(?和速度在同一个地方设置)的影响, 绝对值移动时范围是[0,65535]


class MOUSEINPUT(Structure):
    _fields_ = (('dx', LONG),
                ('dy', LONG),
                ('mouseData', DWORD),
                ('dwFlags', DWORD),
                ('time', DWORD),
                ('dwExtraInfo', ULONG_PTR))


class _INPUTunion(Union):
    _fields_ = (('mi', MOUSEINPUT), ('mi', MOUSEINPUT))


class INPUT(Structure):
    _fields_ = (('type', DWORD),
                ('union', _INPUTunion))


class MouseInput(ctypes.Structure):
    _fields_ = [("dx", ctypes.c_long),  # 水平方向的绝对位置/相对移动量(像素), dwFlags 中包含 MOUSEEVENTF_ABSOLUTE 标识就是绝对移动, 否则是相对移动
                ("dy", ctypes.c_long),  # 垂直方向的绝对位置/相对移动量(像素)
                ("mouseData", ctypes.c_ulong),
                # 某些事件的额外参数, 如: MOUSEEVENTF_WHEEL(中键滚动), 可填正负值, 一个滚动单位是120(像素?); 还有 MOUSEEVENTF_XDOWN/MOUSEEVENTF_XUP
                ("dwFlags", ctypes.c_ulong),  # 事件标识集, 可以是移动或点击事件的合理组合, 即可以一个命令实现移动且点击
                ("time", ctypes.c_ulong),  # 事件发生的时间戳, 可以指定发生的时间? 传入0则使用系统提供的时间戳
                ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))]  # 应用可通过 GetMessageExtraInfo 来接收通过此参数传递的额外消息

def MouseInput_(flags, x, y, data):
    return MOUSEINPUT(x, y, data, flags, 0, None)
class KeyboardInput(ctypes.Structure):
    _fields_ = [("wVk", ctypes.c_ushort),
                # 虚拟键码, 范围在[1,254], 如果dwFlags指定了KEYEVENTF_UNICODE, 则wVk必须是0, https://learn.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes
                ("wScan", ctypes.c_ushort),  # 键的硬件扫描码, 如果dwFlags指定了KEYEVENTF_UNICODE, 则wScan需为一个Unicode字符
                ("dwFlags", ctypes.c_ulong),  # 事件标识集, 可合理组合
                ("time", ctypes.c_ulong),
                ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))]


class HardwareInput(ctypes.Structure):
    _fields_ = [("uMsg", ctypes.c_ulong),
                ("wParamL", ctypes.c_short),
                ("wParamH", ctypes.c_ushort)]


class Inner(ctypes.Union):  # 共用体, 和结构体类似, 但是各成员属性共用同一块内存空间, 实例化时的空间大小就是成员属性中最大的那个的空间大小, 实例化时只能赋值ki/mi/hi中的一个
    _fields_ = [("ki", KeyboardInput),
                ("mi", MouseInput),
                ("hi", HardwareInput)]


class Input(ctypes.Structure):
    _fields_ = [("type", ctypes.c_ulong),  # 输入事件类型
                ("ii", Inner)]

def Input_(structure):
    return INPUT(0, _INPUTunion(mi=structure))
def SendInput(*inputs):  # 接收任意个参数, 将其打包成为元组形参, 双*是打包成为字典形参
    nInputs = len(inputs)
    pointer = Input * nInputs
    pInputs = pointer(*inputs)
    # 创建一个指定类型的C数组并返回首指针, 格式如下
    # pointer = (Type * 数组长度)(填充该数组的实例,用逗号分隔开,个数不超过数组长度)
    # 1. pointer = (Input * 3)(); 创建一个空间为3个Input的C数组, 其中的每个位置的Input已经按默认值初始化
    # 2. pointer = (Input * 3)(input); 创建一个空间为3个Input的C数组, 并将input赋值给第一个位置
    # 3. pointer = (Input * 3)(input, input2, input2), 创建一个空间为3个Input的C数组, 并将input赋值给第一个位置, 将input2赋值给第二第三个位置
    # 4. pointer = (Input * 3)(input, input2, input3, input4), 创建一个空间为3个Input的C数组, 赋值时报错, 因为没有放input4的空间
    # 5. pointer = (Input * 3)(*inputs); 创建一个空间为3个Input的C数组, 并将集合类型的inputs解包并赋值给数组的对应位置
    # 6. 也可以如上分开两行写
    cbSize = ctypes.sizeof(Input)
    return ctypes.windll.user32.SendInput(nInputs, pInputs, cbSize)
def Mouse(flags, x=0, y=0, data=0):
    return Input_(MouseInput_(flags, x, y, data))

class Mouse_ghub():

    def __init__(self):
        pass

    def SendInput(self, *inputs):
        nInputs = len(inputs)
        LPINPUT = INPUT * nInputs
        pInputs = LPINPUT(*inputs)
        cbSize = c_int(sizeof(INPUT))
        return windll.user32.SendInput(nInputs, pInputs, cbSize)

    def _sendInput(self,*inputs):
        nInputs = len(inputs)
        LPINPUT = INPUT * nInputs
        pInputs = LPINPUT(*inputs)
        cbSize = c_int(sizeof(INPUT))
        return windll.user32.SendInput(nInputs, pInputs, cbSize)

    def move(self, x, y):
        # 移动鼠标到相对于当前位置的新位置
        move_input = self._m(MOUSEEVENTF_MOVE, x, y)
        self._sendInput(move_input)

    def _MouseInput(self, flags, x, y, data):
        return MOUSEINPUT(x, y, data, flags, 0, None)

    def _Input(self, structure):
        return INPUT(0, _INPUTunion(mi=structure))

    def _m(self, flags, x=0, y=0, data=0):
        return self._Input(self._MouseInput(flags, x, y, data))



    def mouse_down(self, key=1):  # for import
        if gmok:
            return gm.press(key)
        if key == 1:
            return self._sendInput(self._m(0x0002))
        elif key == 2:
            return self._sendInput(self._m(0x0008))

    def mouse_up(self, key=1):  # for import
        if gmok:
            return gm.release()
        if key == 1:
            return self._sendInput(self._m(0x0004))
        elif key == 2:
            return self._sendInput(self._m(0x0010))

    def leftDown(self):
        return SendInput(Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_LEFTDOWN, 0, None))))


    def leftUp(self):
        return SendInput(Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_LEFTUP, 0, None))))

    def rightDown(self):
        return SendInput(Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_RIGHTDOWN, 0, None))))


    def rightUp(self):
        return SendInput(Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_RIGHTUP, 0, None))))

    def leftClick(self):
        return SendInput(
            Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, None))))

    def rightClick(self):
        return SendInput(
            Input(INPUT_MOUSE, Inner(mi=MouseInput(0, 0, 0, MOUSEEVENTF_RIGHTDOWN | MOUSEEVENTF_RIGHTUP, 0, None))))



