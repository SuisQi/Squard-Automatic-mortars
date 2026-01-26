"""
MCP 工具处理函数模块

包含所有工具的具体处理逻辑。
"""

import json
import re
import logging
import requests

from mcp.types import TextContent

from utils.redis_connect import redis_cli
from utils.map_raning import MapRanging
from utils.utils import log
from weapons.weapon import Weapon

from .map_config import (
    MAP_NAME_MAPPING, MAP_CN_NAMES, MAP_FRONTEND_ID,
    get_map_file_path, resolve_map_name, get_available_maps_str
)
from .tools import get_glm_tools, SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def keypad_to_world(keypad_str: str, grid_spacing: float = 10000 / 3) -> tuple:
    """
    将网格坐标字符串转换为世界坐标

    参数:
        keypad_str: 网格坐标字符串，格式如 "G3-7-7-3"
        grid_spacing: 基础网格间距，默认 10000/3

    返回:
        (x, y) 世界坐标元组
    """
    pattern = r'^([A-Za-z])(\d+)-(\d)-(\d)-(\d)$'
    match = re.match(pattern, keypad_str.strip())

    if not match:
        raise ValueError(f"无效的网格坐标格式: {keypad_str}，正确格式如: G3-7-7-3")

    letter = match.group(1).upper()
    quadrant_y = int(match.group(2)) - 1
    kp1 = int(match.group(3))
    kp2 = int(match.group(4))
    kp3 = int(match.group(5))

    quadrant_x = ord(letter) - ord('A')

    micro_grid_spacing = grid_spacing / 3
    large_grid_spacing = grid_spacing * 3
    quadrant_size = large_grid_spacing * 3

    def kp_to_offset(kp):
        kp = kp - 1
        dx = kp % 3
        dy = 2 - (kp // 3)
        return dx, dy

    kp1_dx, kp1_dy = kp_to_offset(kp1)
    kp2_dx, kp2_dy = kp_to_offset(kp2)
    kp3_dx, kp3_dy = kp_to_offset(kp3)

    x = (quadrant_x * quadrant_size +
         kp1_dx * large_grid_spacing +
         kp2_dx * grid_spacing +
         kp3_dx * micro_grid_spacing +
         micro_grid_spacing / 2)

    y = (quadrant_y * quadrant_size +
         kp1_dy * large_grid_spacing +
         kp2_dy * grid_spacing +
         kp3_dy * micro_grid_spacing +
         micro_grid_spacing / 2)

    return (x, y)


def get_ai_client():
    """获取 GLM-4 AI 客户端"""
    try:
        from zai import ZhipuAiClient
        api_key = redis_cli.get("squad:ai:api_key")
        if api_key:
            api_key = api_key.decode()
            if api_key:
                return ZhipuAiClient(api_key=api_key)
    except ImportError:
        logger.warning("zai-sdk 未安装，AI 功能不可用")
    except Exception as e:
        logger.error(f"初始化 AI 客户端失败: {e}")
    return None


async def handle_set_map(arguments: dict) -> list[TextContent]:
    """处理 set_map 工具调用"""
    try:
        map_name = arguments.get("map_name")
        if not map_name:
            return [TextContent(type="text", text="错误: 缺少 map_name 参数")]

        map_prefix = resolve_map_name(map_name)

        if not map_prefix:
            available_maps = get_available_maps_str()
            return [TextContent(
                type="text",
                text=f"未找到地图: {map_name}\n可用地图: {available_maps}"
            )]

        # 设置后端地图
        file_path = get_map_file_path(map_prefix)
        m = MapRanging()
        m.set_map(file_path)

        # 通过 RPC 通知前端切换地图
        frontend_map_id = MAP_FRONTEND_ID.get(map_prefix, map_prefix)
        rpc_success = False
        try:
            rpc_param = json.dumps({"mapId": frontend_map_id})
            rpc_response = requests.post(
                f"http://127.0.0.1:12080/go?group=map&action=changeMap&param={rpc_param}",
                timeout=5,
                proxies={}
            )
            rpc_success = rpc_response.status_code == 200
        except Exception as e:
            log(f"MCP RPC 通知前端切换地图失败: {e}")

        cn_name = MAP_CN_NAMES.get(map_prefix, map_name)

        return [TextContent(
            type="text",
            text=f"地图已设置为: {cn_name}" + ("" if rpc_success else " (前端通知失败)")
        )]
    except Exception as e:
        return [TextContent(type="text", text=f"设置地图失败: {str(e)}")]


async def handle_set_weapon(arguments: dict) -> list[TextContent]:
    """处理 set_weapon 工具调用"""
    try:
        weapon_type = arguments.get("weapon_type")
        if not weapon_type:
            return [TextContent(type="text", text="错误: 缺少 weapon_type 参数")]

        m = Weapon()
        m.set_type(weapon_type)
        redis_cli.set("squad:fire_data:control:weapon", weapon_type)
        log(f"MCP: 设置武器 {weapon_type}")

        return [TextContent(
            type="text",
            text=f"武器已设置为: {weapon_type}"
        )]
    except Exception as e:
        return [TextContent(type="text", text=f"设置武器失败: {str(e)}")]


async def handle_add_marker(arguments: dict) -> list[TextContent]:
    """处理 add_marker 工具调用"""
    try:
        keypad = arguments.get("keypad")
        if not keypad:
            return [TextContent(type="text", text="错误: 缺少 keypad 参数")]

        marker_type = arguments.get("type", "target")
        active = arguments.get("active", True)
        grid_spacing = 10000 / 3

        # 转换坐标
        try:
            x, y = keypad_to_world(keypad, grid_spacing)
        except ValueError as e:
            return [TextContent(type="text", text=f"坐标转换错误: {str(e)}")]

        # 通过 RPC 通知前端添加标记
        rpc_success = False
        try:
            rpc_param = json.dumps({
                "x": x,
                "y": y,
                "type": marker_type,
                "active": active
            })

            rpc_response = requests.post(
                f"http://127.0.0.1:12080/go?group=map&action=addMarker&param={rpc_param}",
                timeout=5,
                proxies={}
            )
            rpc_success = rpc_response.status_code == 200
        except Exception as e:
            log(f"MCP RPC 通知失败: {e}")

        result = {
            "keypad": keypad,
            "type": marker_type,
            "active": active,
            "x": round(x, 2),
            "y": round(y, 2),
            "rpc_notified": rpc_success
        }

        return [TextContent(
            type="text",
            text=f"标记已添加:\n"
                 f"  网格坐标: {keypad}\n"
                 f"  世界坐标: ({result['x']}, {result['y']})\n"
                 f"  类型: {marker_type}\n"
                 f"  已激活: {active}\n"
                 f"  前端通知: {'成功' if rpc_success else '失败'}"
        )]
    except Exception as e:
        return [TextContent(type="text", text=f"添加标记失败: {str(e)}")]


async def handle_ai_chat(arguments: dict) -> list[TextContent]:
    """处理 AI 对话工具调用 - 支持工具调用"""
    try:
        message = arguments.get("message")
        if not message:
            return [TextContent(type="text", text="错误: 缺少 message 参数")]

        client = get_ai_client()
        if not client:
            return [TextContent(
                type="text",
                text="错误: AI 服务未配置。请先设置 API Key。"
            )]

        tools = get_glm_tools()

        # 第一次调用 - 可能触发工具调用
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            tools=tools,
            tool_choice="auto",
            max_tokens=1024,
            temperature=0.7
        )

        assistant_message = response.choices[0].message

        # 检查是否有工具调用
        if assistant_message.tool_calls:
            tool_results = []
            for tool_call in assistant_message.tool_calls:
                func_name = tool_call.function.name
                func_args = json.loads(tool_call.function.arguments)

                # 执行工具调用
                if func_name == "set_map":
                    result = await handle_set_map(func_args)
                elif func_name == "set_weapon":
                    result = await handle_set_weapon(func_args)
                elif func_name == "add_marker":
                    result = await handle_add_marker(func_args)
                else:
                    result = [TextContent(type="text", text=f"未知工具: {func_name}")]

                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "content": result[0].text
                })

            # 第二次调用 - 让模型根据工具结果生成最终回复
            final_response = client.chat.completions.create(
                model="glm-4-flash",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                    assistant_message.model_dump(),
                    *tool_results
                ],
                max_tokens=1024,
                temperature=0.7
            )

            ai_response = final_response.choices[0].message.content
        else:
            # 没有工具调用，直接返回回复
            ai_response = assistant_message.content

        return [TextContent(type="text", text=ai_response or "操作完成")]

    except Exception as e:
        logger.error(f"AI 对话失败: {e}")
        return [TextContent(type="text", text=f"AI 对话失败: {str(e)}")]


async def dispatch_tool(name: str, arguments: dict) -> list[TextContent]:
    """工具调用分发器"""
    if name == "set_map":
        return await handle_set_map(arguments)
    elif name == "set_weapon":
        return await handle_set_weapon(arguments)
    elif name == "add_marker":
        return await handle_add_marker(arguments)
    elif name == "ai_chat":
        return await handle_ai_chat(arguments)
    else:
        return [TextContent(type="text", text=f"未知工具: {name}")]
