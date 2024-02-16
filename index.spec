# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['index.py'],
    pathex=[],
    binaries=[],
    datas=[("./charsets.json","."),("./best.onnx","."),("./squard.onnx","."),
    ('D:\\conda\\anaconda3\\envs\\squard\\Lib\\site-packages\\onnxruntime\\capi\\onnxruntime_providers_shared.dll', 'onnxruntime\\capi'),
    ("./config.ini","."),
    ("./charsets_orientation.json","."),
    ("./squard_orientation.onnx","."),
    ("./v16.9.1","./v16.9.1"),
    ("./templates/","./templates/")
    ],
    hiddenimports=['engineio.async_drivers.threading','torch','pytorch'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'torchvision', 'torchaudio'],
    noarchive=False,
)
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
