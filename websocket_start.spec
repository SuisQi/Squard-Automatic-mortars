# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for websocket_start.py
# 用于在 Linux 上打包

block_cipher = None

a = Analysis(
    ['websocket_start.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'websockets',
        'websockets.server',
        'websockets.legacy',
        'websockets.legacy.server',
        'redis',
        'flask',
        'flask.json',
        'werkzeug',
        'jinja2',
        'asyncio',
        'json',
        'logging',
        'threading',
        'traceback',
        'time',
        'random',
        'socket',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # 排除不需要的大型包
        'tkinter',
        'matplotlib',
        'numpy',
        'pandas',
        'scipy',
        'PIL',
        'cv2',
        'onnx',
        'onnxruntime',
        'torch',
        'tensorflow',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='websocket_start',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
