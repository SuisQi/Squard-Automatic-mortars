"""
地图配置模块

包含地图名称映射、中文名显示、前端ID等配置。
"""

# 地图名称映射表（英文名/中文名 -> 文件名前缀）
MAP_NAME_MAPPING = {
    # 英文名
    'albasrah': 'albasrah',
    'anvil': 'anvil',
    'belaya': 'belaya',
    'blackcoast': 'blackcoast',
    'chora': 'chora',
    'fallujah': 'fallujah',
    'foolsroad': 'foolsroad',
    'goosebay': 'goosebay',
    'gorodok': 'gorodok',
    'harju': 'harju',
    'jensensrange': 'jensensrange',
    'kamdesh': 'kamdesh',
    'kohat': 'kohat',
    'kokan': 'kokan',
    'logar': 'logar',
    'lashkar': 'lashkar',
    'manicouagan': 'manicouagan',
    'mestia': 'mestia',
    'mutaha': 'mutaha',
    'narva': 'narva',
    'skorpo': 'skorpo',
    'sumari': 'sumari',
    'tallil': 'tallil',
    'yehorivka': 'yehorivka',
    'sanxianislands': 'sanxianislands',
    # 中文名
    '巴士拉': 'albasrah',
    '铁砧行动': 'anvil',
    '贝拉亚关隘': 'belaya',
    '黑色海岸': 'blackcoast',
    '乔拉': 'chora',
    '费卢杰': 'fallujah',
    '愚者之路': 'foolsroad',
    '鹅湾': 'goosebay',
    '格罗多克': 'gorodok',
    '哈留': 'harju',
    '训练营': 'jensensrange',
    '卡姆德什高地': 'kamdesh',
    '科哈特': 'kohat',
    '寇坎': 'kokan',
    '洛加尔山谷': 'logar',
    '拉什卡河谷': 'lashkar',
    '曼尼古根': 'manicouagan',
    '梅斯蒂亚': 'mestia',
    '穆塔哈': 'mutaha',
    '纳尔瓦': 'narva',
    '斯科普': 'skorpo',
    '苏玛瑞': 'sumari',
    '塔利尔': 'tallil',
    '叶城': 'yehorivka',
    '三仙岛': 'sanxianislands',
}

# 中文名显示映射
MAP_CN_NAMES = {
    'albasrah': '巴士拉',
    'anvil': '铁砧行动',
    'belaya': '贝拉亚关隘',
    'blackcoast': '黑色海岸',
    'chora': '乔拉',
    'fallujah': '费卢杰',
    'foolsroad': '愚者之路',
    'goosebay': '鹅湾',
    'gorodok': '格罗多克',
    'harju': '哈留',
    'jensensrange': '训练营',
    'kamdesh': '卡姆德什高地',
    'kohat': '科哈特',
    'kokan': '寇坎',
    'logar': '洛加尔山谷',
    'lashkar': '拉什卡河谷',
    'manicouagan': '曼尼古根',
    'mestia': '梅斯蒂亚',
    'mutaha': '穆塔哈',
    'narva': '纳尔瓦',
    'skorpo': '斯科普',
    'sumari': '苏玛瑞',
    'tallil': '塔利尔',
    'yehorivka': '叶城',
    'sanxianislands': '三仙岛',
}

# 前端地图 ID 映射（用于 RPC 通知前端切换地图）
MAP_FRONTEND_ID = {
    'albasrah': 'albasrah',
    'anvil': 'anvil',
    'belaya': 'belaya',
    'blackcoast': 'blackcoast',
    'chora': 'chora',
    'fallujah': 'fallujah',
    'foolsroad': 'foolsroad',
    'goosebay': 'goosebay',
    'gorodok': 'gorodok',
    'harju': 'harju',
    'jensensrange': 'jensensrange',
    'kamdesh': 'kamdesh',
    'kohat': 'kohat',
    'kokan': 'kokan',
    'logar': 'logar',
    'lashkar': 'lashkar',
    'manicouagan': 'manicouagan',
    'mestia': 'mestia',
    'mutaha': 'mutaha',
    'narva': 'narva',
    'skorpo': 'skorpoFull',  # 前端使用 skorpoFull
    'sumari': 'sumari',
    'tallil': 'tallil',
    'yehorivka': 'yehorivka',
    'sanxianislands': 'sanxianislands',
}


def get_map_file_path(map_prefix: str) -> str:
    """获取地图文件路径"""
    if map_prefix == 'skorpo':
        return "./templates/map/public/maps/skorpo_minimap_full.jpg"
    return f"./templates/map/public/maps/{map_prefix}_minimap.jpg"


def resolve_map_name(map_name: str) -> str | None:
    """解析地图名称，返回地图前缀或 None"""
    map_key = map_name.lower().replace(' ', '').replace('_', '')
    return MAP_NAME_MAPPING.get(map_key) or MAP_NAME_MAPPING.get(map_name)


def get_available_maps_str() -> str:
    """获取可用地图列表字符串（仅英文）"""
    return ', '.join(sorted([k for k in MAP_NAME_MAPPING.keys() if ord(k[0]) < 128]))
