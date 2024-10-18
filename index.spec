# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['index.py'],
    pathex=[],
    binaries=[],
    datas=[("./charsets.json","."),("./squard.onnx","."),
    ('D:\\conda\\anaconda3\\envs\\squard\\Lib\\site-packages\\onnxruntime\\capi\\onnxruntime_providers_shared.dll', 'onnxruntime\\capi'),
    ("./config.ini","."),
    ("./charsets_orientation.json","."),
    ("./squard_orientation.onnx","."),
    ("./v16.9.1","./v16.9.1"),
    ("./templates/control/dist","./templates/control/dist"),
    ("./templates/map/public","./templates/map/public"),
    ("./resolution_case.json","."),
    ("./Redis-x64-5.0.14.1","./Redis-x64-5.0.14.1"),
    ("./model","./model"),
    ("./lib","./lib"),
    ("./utils/mouse/ghub_mouse.dll","./utils/mouse")
    ],
    hiddenimports=['engineio.async_drivers.threading','torch','pytorch'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'torchvision', 'torchaudio'],
    noarchive=False,
)

# 移除包含 .git 的数据条目
a.datas = [data for data in a.datas if not data[0].endswith('.git') and '.git/' not in data[0]]
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='index',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='logo.ico',
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],

    name='半自动计算器',
)
