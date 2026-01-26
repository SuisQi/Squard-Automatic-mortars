"""
Squad Mortar Calculator MCP AI Server

基于 SSE (Server-Sent Events) 传输的 MCP 服务器，集成 GLM-4 大模型。

提供以下工具:
- set_map: 设置当前地图
- set_weapon: 设置当前武器类型
- add_marker: 通过网格坐标添加标记
- ai_chat: 与 GLM-4 AI 对话

运行方式:
    python mcp_service/ai_server.py

或通过 index.py 自动启动
"""

import sys
import os
import logging

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import JSONResponse
from mcp.server import Server
from mcp.server.sse import SseServerTransport

from .tools import get_mcp_tools
from .handlers import dispatch_tool, get_ai_client

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建 MCP Server 实例
server = Server("squad-mortar-ai")

# SSE 传输
sse = SseServerTransport("/messages")


@server.list_tools()
async def list_tools():
    """列出所有可用工具"""
    return get_mcp_tools()


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """处理工具调用"""
    return await dispatch_tool(name, arguments)


# ASGI 应用处理 SSE 连接
async def handle_sse_asgi(scope, receive, send):
    """处理 SSE 连接 (ASGI 原生接口)"""
    async with sse.connect_sse(scope, receive, send) as streams:
        await server.run(
            streams[0],
            streams[1],
            server.create_initialization_options()
        )


async def health_check(request):
    """健康检查端点"""
    return JSONResponse({
        "status": "ok",
        "service": "squad-mortar-mcp-ai",
        "ai_configured": get_ai_client() is not None
    })


async def voice_chat(request):
    """语音识别结果处理端点 - 供语音服务调用"""
    try:
        data = await request.json()
        message = data.get("message", "")

        if not message:
            return JSONResponse({"error": "缺少 message 参数"}, status_code=400)

        # 调用 AI 处理
        result = await dispatch_tool("ai_chat", {"message": message})

        response_text = ""
        if result and len(result) > 0:
            response_text = result[0].text

        return JSONResponse({
            "status": "ok",
            "response": response_text
        })

    except Exception as e:
        logger.error(f"voice_chat 错误: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)


# 创建 Starlette 应用
app = Starlette(
    debug=False,
    routes=[
        Mount("/sse", app=handle_sse_asgi),
        Mount("/messages", app=sse.handle_post_message),
        Route("/health", health_check),
        Route("/voice_chat", voice_chat, methods=["POST"]),
    ],
    on_startup=[lambda: logger.info("MCP AI Server 启动中...")],
)


def run_server(host: str = "0.0.0.0", port: int = 8765):
    """运行 MCP AI 服务器"""
    logger.info(f"MCP AI Server 启动于 http://{host}:{port}")
    logger.info(f"SSE 端点: http://{host}:{port}/sse")
    logger.info(f"健康检查: http://{host}:{port}/health")

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="warning"
    )


if __name__ == "__main__":
    run_server()
