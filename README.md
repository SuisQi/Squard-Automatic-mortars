# 半自动迫击炮

项目基于已开源的迫击炮计算器，截取屏幕内容使用ocr识别屏幕的方位和密位并自动转动到相应的位置，整个过程没有读取游戏内存



**演示地址** https://www.bilibili.com/video/BV1Vz421d79S/?spm_id_from=333.999.0.0



**免责声明**：本项目仅供学习和研究目的使用。作者不推荐也不鼓励使用此程序来破坏游戏平衡或违反游戏的服务条款。使用此脚本可能违反游戏的使用协议。请在考虑清楚后谨慎使用。 这是一个自动打迫击炮的脚本，旨在演示如何通过编程省去机械化重复的工作



**交流群**	201450922



**后续方向** 研究使用何种算法能有效的协同多门迫击炮轰炸同一门区域(在自己的训练服务器进行),并寻找该算法的实用场景

#### 操作方式

鼠标双击添加点
alt+左键将点标为火力点
ctrl+左键删除点



## 开始之前

在开始之前，请确保你的开发环境满足以下要求：

- Python 3.8
- Node.js (推荐使用最新稳定版)
- live-server (用于本地开发的简易HTTP服务器)



### 支持的分辨率

2560*1600

2560*1440

1920*1080

## 安装指南

跟随以下步骤设置你的本地开发环境：

### 安装Python 3.8

1. 访问 [Python官方下载页面](https://www.python.org/downloads/) 并下载Python 3.8版本。
2. 根据你的操作系统指示完成安装过程。

### 安装Node.js

1. 访问 [Node.js官方网站](https://nodejs.org/en/download/) 并下载适用于你操作系统的最新稳定版。
2. 完成安装向导来安装Node.js。

### 安装live-server

安装了Node.js后，你可以通过npm（Node.js的包管理器）安装`live-server`。打开你的命令行或终端，并执行以下命令：

```bash
npm install -g live-server
```

### 克隆项目仓库

使用以下命令将项目代码仓库克隆到你的本地机器：

```
git clone https://github.com/SuisQi/Squard-Automatic-mortars.git
```

### 安装项目依赖

切换到项目目录，并安装必要的Python依赖：

```bash
pip install -r requirements.txt
```

## 运行项目

```bash
python index.py
```

