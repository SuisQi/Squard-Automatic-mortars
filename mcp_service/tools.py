"""
MCP 工具定义模块

定义所有可用的 MCP 工具及其 JSON Schema。
"""

from mcp.types import Tool


def get_mcp_tools() -> list[Tool]:
    """获取所有 MCP 工具定义"""
    return [
        Tool(
            name="set_map",
            description="设置当前地图。支持中英文地图名。可用地图: 巴士拉/albasrah, 纳尔瓦/narva, 叶城/yehorivka, 格罗多克/gorodok, 费卢杰/fallujah 等",
            inputSchema={
                "type": "object",
                "properties": {
                    "map_name": {
                        "type": "string",
                        "description": "地图名称（中文或英文），例如: '纳尔瓦', 'narva', '叶城', 'yehorivka'"
                    }
                },
                "required": ["map_name"]
            }
        ),
        Tool(
            name="set_weapon",
            description="设置当前武器类型。切换迫击炮计算器使用的武器类型，影响弹道计算参数。",
            inputSchema={
                "type": "object",
                "properties": {
                    "weapon_type": {
                        "type": "string",
                        "description": "武器类型标识，可选值: 'M121', 'MK19', 'UB32', 'HELL_CANNON', 'TECHNICAL_MORTAR', 'GRAD_21', 'BM21'"
                    }
                },
                "required": ["weapon_type"]
            }
        ),
        Tool(
            name="add_marker",
            description="通过网格坐标添加火力点或武器标记。网格坐标格式为字母+数字-数字-数字-数字，例如: G3-7-7-3",
            inputSchema={
                "type": "object",
                "properties": {
                    "keypad": {
                        "type": "string",
                        "description": "网格坐标，格式如: 'G3-7-7-3', 'A1-5-5-5'"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["target", "weapon"],
                        "description": "标记类型: 'target'(火力点/目标点) 或 'weapon'(武器位置)",
                        "default": "target"
                    },
                    "active": {
                        "type": "boolean",
                        "description": "是否激活该标记点",
                        "default": True
                    }
                },
                "required": ["keypad"]
            }
        ),
        Tool(
            name="ai_chat",
            description="与 GLM-4 AI 对话，获取战术建议、坐标解析帮助等。",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "用户消息"
                    }
                },
                "required": ["message"]
            }
        )
    ]


def get_glm_tools() -> list[dict]:
    """获取 GLM-4 函数调用工具定义"""
    return [
        {
            "type": "function",
            "function": {
                "name": "set_map",
                "description": "设置当前地图。支持中英文地图名。可用地图: 巴士拉/albasrah, 纳尔瓦/narva, 叶城/yehorivka, 格罗多克/gorodok, 费卢杰/fallujah, 乔拉/chora, 愚者之路/foolsroad, 鹅湾/goosebay 等",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "map_name": {
                            "type": "string",
                            "description": "地图名称（中文或英文），例如: '纳尔瓦', 'narva', '叶城', 'yehorivka'"
                        }
                    },
                    "required": ["map_name"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "set_weapon",
                "description": "设置当前武器类型。切换迫击炮计算器使用的武器类型，影响弹道计算参数。",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "weapon_type": {
                            "type": "string",
                            "enum": ["M121", "MK19", "UB32", "HELL_CANNON", "TECHNICAL_MORTAR", "GRAD_21", "BM21"],
                            "description": "武器类型标识"
                        }
                    },
                    "required": ["weapon_type"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "add_marker",
                "description": "通过网格坐标添加火力点或武器标记。网格坐标格式为字母+数字-数字-数字-数字，例如: G3-7-7-3",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "keypad": {
                            "type": "string",
                            "description": "网格坐标，格式如: 'G3-7-7-3', 'A1-5-5-5'"
                        },
                        "type": {
                            "type": "string",
                            "enum": ["target", "weapon"],
                            "description": "标记类型: 'target'(火力点/目标点) 或 'weapon'(武器位置)"
                        },
                        "active": {
                            "type": "boolean",
                            "description": "是否激活该标记点"
                        }
                    },
                    "required": ["keypad"]
                }
            }
        }
    ]


# GLM-4 系统提示词
SYSTEM_PROMPT = """你是一个战术小队（Squad）游戏的迫击炮计算助手。

你可以使用以下工具：
1. set_map - 设置当前地图（支持中英文名称，如"纳尔瓦"或"narva"）
2. set_weapon - 设置武器类型（M121迫击炮、MK19榴弹发射器等）
3. add_marker - 通过网格坐标（如 G3-7-7-3）添加火力点或武器标记

当用户请求执行操作时，请调用相应的工具。
当用户询问问题时，请用简洁专业的方式回答。"""
