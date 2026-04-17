#!/bin/bash
# build_linux.sh - 在 Linux 上打包 websocket_start.py
#
# 使用方法:
#   1. 将整个项目复制到 Linux 机器
#   2. 安装依赖: pip install -r requirements_websocket.txt pyinstaller
#   3. 运行此脚本: ./build_linux.sh

set -e

echo "=== 开始打包 websocket_start.py ==="

# 检查 Python 环境
python3 --version || { echo "错误: 未找到 Python3"; exit 1; }

# 安装依赖
echo "安装依赖..."
pip install -r requirements_websocket.txt pyinstaller

# 使用 PyInstaller 打包
echo "开始打包..."
pyinstaller websocket_start.spec --clean

echo "=== 打包完成 ==="
echo "可执行文件位于: dist/websocket_start"
echo ""
echo "运行前请确保:"
echo "  1. Redis 服务已启动 (redis-server)"
echo "  2. 端口 1234, 1235, 8081 未被占用"
