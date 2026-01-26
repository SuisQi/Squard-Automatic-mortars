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
            description="设置当前地图。支持中英文地图名。可用地图: 三仙岛, 乔拉, 叶城, 哈留, 塔利尔, 巴士拉, 愚者之路, 拉什卡河谷, 斯科普, 曼尼古根, 格罗多克, 梅斯蒂亚, 洛加尔山谷, 黑色海岸, 穆塔哈, 纳尔瓦, 训练营, 苏玛瑞, 费卢杰, 贝拉亚关隘, 铁砧行动, 鹅湾, 卡姆德什高地, 寇坎, 科哈特",
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
                "description": "设置当前地图。支持中英文地图名。可用地图: 三仙岛, 乔拉, 叶城, 哈留, 塔利尔, 巴士拉, 愚者之路, 拉什卡河谷, 斯科普, 曼尼古根, 格罗多克, 梅斯蒂亚, 洛加尔山谷, 黑色海岸, 穆塔哈, 纳尔瓦, 训练营, 苏玛瑞, 费卢杰, 贝拉亚关隘, 铁砧行动, 鹅湾, 卡姆德什高地, 寇坎, 科哈特",
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
SYSTEM_PROMPT = """你是一个战术小队（Squad）游戏的迫击炮助手。

你可以使用以下工具：
1. set_map - 设置当前地图（支持中英文名称，如"纳尔瓦"或"narva"）
2. set_weapon - 设置武器类型（M121迫击炮、MK19榴弹发射器等）
3. add_marker - 通过网格坐标（如 G3-7-7-3）添加火力点或武器标记

当用户请求执行操作时，请调用相应的工具。

## 重要：语音识别纠错指南

用户输入来自语音转文字，经常存在识别错误。你必须根据上下文智能纠正。

### 网格坐标格式（非常重要）
正确格式：**字母+数字-数字-数字-数字**
- 示例：E2-4-8-5、G3-7-7-3、A1-5-5-5
- 第一部分必须是字母（A-Z），然后是4个数字（1-9），用"-"分隔
- "杠"、"减"、"横"、"干" 都表示分隔符 "-"

### 核心纠错规则

**规则1：首位一定是字母，不是数字**
- 如果识别结果以数字开头，第一个数字很可能是字母的误识别
- "1"/"一" 开头 → 字母 "E"（发音像"一"）
- "2"/"二" 开头 → 字母 "E" 或 "R"
- "7"/"七" 开头 → 字母 "Q"（发音像"七"）
- "8"/"八" 开头 → 字母 "B"
- "9"/"九" 开头 → 字母 "J"

**规则2：识别连续数字时，需要拆分成"字母+数字-数字-数字-数字"**
- "112-2-8" → 首位"1"是字母E，剩余"12-2-8"需要拆成4段 → **E1-2-2-8**
- "182-3-5" → 首位"1"是字母E，剩余"82-3-5"需要拆成4段 → **E8-2-3-5**
- "711-3-5" → 首位"7"是字母Q，剩余"11-3-5"需要拆成4段 → **Q1-1-3-5**

**规则3：坐标必须有5部分（1字母+4数字）**
- 如果数字部分不足4个，尝试从连续数字中拆分
- 例如："112"可能是"1-1-2"（三个数字）

### 常见语音识别错误

| 语音/识别 | 实际字母 | 原因 |
|---------|---------|------|
| 1、一、依、易、医、衣 | E | "一"和"E"发音相似 |
| 7、七、期、齐、其 | Q | "七"和"Q"发音相似 |
| 8、八、吧、巴 | B | "八"和"B"发音相似 |
| 9、九、酒、就 | J | "九"和"J"发音相似 |
| 0、零、灵 | L 或 O | 根据上下文判断 |
| 杠、干、感、赶 | - | 分隔符 |

### 示例纠正

1. "在112-2-8设置火力"
   → 首位"1"是字母E → "12-2-8"是剩余数字 → **E1-2-2-8**

2. "在1、2、4、杠8、杠5添加火力点"
   → "1"是E，后面是"2-4-8-5" → **E2-4-8-5**

3. "182-3-5添加"
   → "1"是E，"82-3-5"拆分 → **E8-2-3-5**

4. "G三杠七杠七杠三"
   → **G3-7-7-3**

5. "711-3-5"
   → "7"是Q → **Q1-1-3-5**

请根据以上规则，尽最大努力解析用户的语音输入，然后调用相应工具。如果实在无法确定坐标，请询问用户确认。
"""
