# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是《战术小队》(Squad) 半自动迫击炮计算器的交互式地图前端应用。这是一个基于TypeScript的React/Redux单页面应用，使用Webpack构建，提供实时战术地图可视化和武器计算功能。

## 开发命令

### 核心命令
```bash
# 开发服务器（带热重载）
npm run dev

# 生产构建
npm run build

# 开发构建（带监视）
npm run build-dev

# Tailwind CSS监视模式  
npm run css

# 启动本地服务器
npm run server
```

### 构建配置
- **开发模式**: 使用 `dev.config.js` 配置，包含source maps和开发服务器
- **生产模式**: 使用 `prod.config.js` 配置，代码压缩和优化
- **通用配置**: `common.config.js` 包含共享webpack设置

## 核心架构

### 状态管理 (Redux)
应用使用Redux进行集中状态管理，包含以下主要模块：

- **world**: 实体组件系统(ECS)架构，管理武器、目标、图标等游戏实体
- **camera**: 相机变换和缩放控制
- **minimap/heightmap/terrainmap**: 不同类型地图数据管理
- **ui**: 用户界面状态和设置
- **replication_ws**: WebSocket实时通信

### 实体组件系统 (ECS)
核心游戏逻辑基于ECS架构：

- **实体(Entities)**: 武器(Weapon)、目标(Target)、图标(Icon)等
- **组件(Components)**: Transform、Weapon、Selection等
- **系统(Systems)**: 渲染、物理计算、用户交互等

### 地图系统
支持多种地图类型和30+个《战术小队》官方地图：

- **minimap**: 小地图纹理和UI叠加
- **heightmap**: 地形高度数据，用于弹道计算
- **terrainmap**: 地形纹理显示
- **contourmap**: 等高线SVG显示

### 弹道物理计算
位于 `src/world/projectilePhysics.ts`，实现：

- 迫击炮弹道计算 (`getMortarFiringSolution`)
- M121迫击炮专用计算 (`getM121FiringSolution`) 
- MK19榴弹发射器计算 (`getMK19FiringSolution`)
- 高弧/低弧轨迹选择

## 渲染系统

### Canvas渲染
主渲染循环在 `src/render/canvas.ts`：

- 使用2D Canvas API进行实时渲染
- 分层渲染：地图底层、实体、UI叠加
- 相机变换和缩放支持
- 优化的像素对齐和抗锯齿

### 关键渲染组件
- `drawWeapons()`: 武器位置和射程显示
- `drawTargets()`: 目标标记和弹道指示器
- `drawIcons()`: 战术图标和单位标记
- `drawSpreadEllipse()`: 武器精度椭圆显示

## 用户交互

### 鼠标控制
- **双击**: 添加新目标点
- **Alt + 左键**: 标记为火力点
- **Ctrl + 左键**: 删除选中点
- **拖拽**: 移动相机视角
- **滚轮**: 缩放地图

### 键盘快捷键
集成完整的键盘控制系统，支持实体选择、地图导航等操作。

## WebSocket通信

### 实时数据同步
- 使用WebSocket连接Python后端
- 支持武器位置、目标数据实时同步
- 错误处理和重连机制
- 消息序列化和反序列化

### 通信协议
处理来自后端的OCR检测数据：
- `handlerData`: 处理YOLO检测结果
- 武器类型识别: mortar, light-launcher, t1, tC_1, tB_1
- 坐标系转换和地图映射

## 类型系统

### 核心类型定义
- `World`: ECS世界状态
- `StoreState`: Redux全局状态类型
- `Transform`: 3D变换矩阵
- `WeaponComponent`: 武器属性和状态
- `Target`: 目标实体定义

### 地图配置类型
每个地图包含完整的元数据：
- 地形分辨率和缩放参数
- 纹理坐标映射
- 高度压缩设置
- 旋转和偏移参数

## 开发注意事项

### 代码风格
- 严格TypeScript模式，启用所有类型检查
- 使用ES2020模块系统
- React 16.13.1兼容性要求
- Immer用于不可变状态更新

### 性能优化
- Canvas渲染优化和像素对齐
- Redux状态订阅优化
- 地图纹理预加载和缓存
- WebSocket消息去抖和节流

### 调试工具
- Redux DevTools集成（开发模式）
- Source maps支持
- 详细的类型错误报告
- Performance API集成

## 地图数据结构

每个地图配置包含：
```typescript
{
  "reference": "游戏模式参考",
  "minimap_image_src": "小地图图片路径", 
  "heightmap_image_src": "高度图路径",
  "terrainmap_image_src": "地形图路径",
  "landscape": {
    "loc_x": "X坐标偏移",
    "loc_y": "Y坐标偏移", 
    "scale_x": "X轴缩放",
    "scale_y": "Y轴缩放",
    "scale_z": "高度缩放",
    "resolution_x": "分辨率宽度",
    "resolution_y": "分辨率高度"
  },
  "mapTexture": "纹理尺寸",
  "mapTextureCorner0/1": "纹理角点坐标",
  "compression": "数据压缩设置"
}
```

## 第三方依赖

### 核心库
- **React 16.13.1**: UI组件系统
- **Redux 4.0.5**: 状态管理
- **gl-matrix 3.3.0**: 3D数学计算
- **Immer 9.0.6**: 不可变状态更新
- **Axios 1.6.2**: HTTP客户端

### 开发工具
- **TypeScript 4.5.2**: 类型系统
- **Webpack 5.x**: 模块打包
- **Tailwind CSS 3.4.1**: 样式框架
- **ts-loader 8.0.17**: TypeScript编译

## 回答须知

- 回答尽量用中文
- 代码尽量写详细的中文注释
- 有不清楚的问我
