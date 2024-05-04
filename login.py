import json
import time
import os
import configparser
import uuid
from datetime import datetime

import colorama
from colorama import Fore, Style
from prettytable import PrettyTable

import requests

# from API.Aes import decrypt_aes

# 创建ConfigParser对象
config = configparser.ConfigParser()

# 读取配置文件
config.read('config.ini')
# SQUARD的每个字母的ASCII表示
S = ["  SSSS ", " SS  SS", " SS    ", "  SSSS ", "    SS ", " SS  SS", "  SSSS "]
Q = ["  QQQ  ", " QQ QQ ", "QQ   QQ", "QQ   QQ", " QQ QQ ", "  QQQQ ", "     QQ"]
U = ["UU   UU", "UU   UU", "UU   UU", "UU   UU", "UU   UU", " UUUUUU", "   UU  "]
A = ["   A   ", "  A A  ", " A   A ", "AAAAAAA", "A     A", "A     A", "A     A"]
R = ["RRRRR  ", "RR   RR", "RR   RR", "RRRRR  ", "RR RR  ", "RR  RR ", "RR   RR"]
D = ["DDDD   ", "D   DD ", "D    DD", "D    DD", "D    DD", "D   DD ", "DDDD   "]

# ANSI颜色代码
colors = ["\033[91m", "\033[92m", "\033[93m", "\033[94m", "\033[95m", "\033[96m"]
import pyautogui

screen_size = pyautogui.size()
WIDTH = screen_size.width
HEIGHT = screen_size.height


def get_mac_address():
    """ 获取MAC地址 """
    mac = uuid.getnode()
    mac_str = ':'.join(("%012X" % mac)[i:i + 2] for i in range(0, 12, 2))
    return mac_str


# 清屏函数
def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def display_rule():
    colorama.init(autoreset=True)

    print(Fore.CYAN + Style.BRIGHT + "欢迎使用  半自动迫击炮计算器")
    print(Fore.YELLOW + "使用前须知：\n")
    print(Fore.WHITE + "1. 本项目仅供学习和研究使用，不得用于任何非法用途。")
    # print("")
    print("2. 开发者不承担因使用本项目引起的任何责任。\n")

    agreement = input(Fore.GREEN + "如果您同意以上条款，请按'y'继续：")

    if agreement.lower() == 'y':
        os.system('cls' if os.name == 'nt' else 'clear')
        # 在这里启动游戏脚本的功能
    else:
        exit(1)

# 逐字显示SQUARD的函数
def display_squard():
    letters = [S, Q, U, A, R, D]
    for i in range(len(S)):
        clear_screen()
        for j in range(i + 1):
            for k in range(len(letters)):
                if j < len(letters[k]):
                    print(colors[k % len(colors)] + letters[k][j] + "\033[0m", end="  ")
                else:
                    print(" " * len(letters[k][0]), end="  ")
            print()
        time.sleep(0.1)


def verify(write=True):
    tel = config['settings']['tel']
    if (not tel or tel == '') and write:
        tel = input("请输入账号:")
    params = {
        "tel": tel,
        "mac_address": get_mac_address()
    }
    res = requests.post(f"http://{config['settings']['host']}/user/get", params=params).json()
    res = json.loads(decrypt_aes(res['data']))

    # 获取当前时间的13位时间戳
    timestamp_ms = int(time.time() * 1000)
    # 如果时间戳相差大于10秒，则错误
    if abs(res['time_stamp'] - timestamp_ms) > 100000:
        print("网络错误")
        print(res['data'])
        return res['data']

    if res['code'] != 0:
        print(res['msg'])
        if res['code'] == 404:
            # 将更改写回配置文件
            config['settings']['tel'] = ''
            with open('config.ini', 'w') as configfile:
                config.write(configfile)
        return res

    if write:
        # 将更改写回配置文件
        config['settings']['tel'] = tel
        with open('config.ini', 'w') as configfile:
            config.write(configfile)
    return res


def get_resolution_case():
    res = requests.get(f"http://{config['settings']['host']}/resolution-case/get?name={WIDTH}*{HEIGHT}").json()
    res = json.loads(decrypt_aes(res['data']))
    if res['code'] != 0:
        print(res['msg'])
        return False

    res['data']['mail_b_x'] = res['data']['mail_c_x']
    res['data']['mail_b_y'] = res['data']['mail_c_y'] - res['data']['mail_t_y'] + res['data']['mail_c_y']
    with open("./resolution_case.json", 'w') as f:
        json.dump(res['data'], f)

    return True


def login():
    display_squard()
    data = verify()

    if "data" not in data:
        return False
    if data['code'] != 0:
        return False
    data = data['data']
    res = requests.get(f"http://{config['settings']['host']}/config/get?name=version").json()
    # 创建一个表格
    table = PrettyTable()
    table.field_names = ["Key", "Value"]
    # 添加每行数据
    meal_type = {
        0: "体验版",
        1: "包月"
    }
    table.add_row(["账号", data['tel']])
    table.add_row(["到期时间", data['expiration_time']])
    table.add_row(["套餐类型", meal_type[data['type']]])
    table.add_row(["当前版本",config['settings']['version']])

    # 打印表格
    print(table)


    if res['data'] != config['settings']['version']:
        print("当前版本不是最新版，请前往qq群下载最新版")
    if not get_resolution_case():
        return False
    return True
