# 武器渲染器系统 - 添加新武器指南

本文档详细说明如何在武器渲染器系统中添加新武器。

## 系统架构概述

武器渲染器系统基于策略模式设计，每种武器类型都有对应的渲染器类。所有渲染器都实现统一的渲染接口，并提供特定武器的渲染逻辑。

### 核心组件

1. **BaseWeaponRenderer.ts** - 基础渲染器类，定义通用接口和方法
2. **具体武器渲染器** - 如`MortarWeaponRenderer.ts`、`M121WeaponRenderer.ts`等
3. **WeaponType** - 字符串字面量类型定义支持的武器类型
4. **weaponFactory.ts** - 武器渲染器工厂，使用回调函数避免循环依赖

## 添加新武器的步骤

### 1. 创建武器渲染器类

首先在`src/render/weaponRenderers/`目录下创建新的渲染器文件，例如`NewWeaponRenderer.ts`：

```typescript
import { BaseWeaponRenderer } from './BaseWeaponRenderer';
import { Weapon } from '../../world/types';
import { vec3 } from 'gl-matrix';

export class NewWeaponRenderer extends BaseWeaponRenderer {
    // 实现武器特定的渲染逻辑
    drawWeapon(ctx: CanvasRenderingContext2D, weapon: Weapon, screenTransform: (pos: vec3) => vec3 | null): void {
        // 调用父类方法获取屏幕坐标
        const screenPos = this.getWorldPos(weapon, screenTransform);
        if (!screenPos) return;

        // 实现武器图标绘制逻辑
        ctx.save();
        ctx.translate(screenPos[0], screenPos[1]);
        
        // 绘制武器图标
        ctx.fillStyle = '#ff0000'; // 武器颜色
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // 实现射程圆绘制逻辑
    drawWeaponRange(ctx: CanvasRenderingContext2D, weapon: Weapon, screenTransform: (pos: vec3) => vec3 | null): void {
        const screenPos = this.getWorldPos(weapon, screenTransform);
        if (!screenPos) return;

        // 获取武器射程参数
        const range = this.getWeaponRange(weapon);
        
        ctx.save();
        ctx.translate(screenPos[0], screenPos[1]);
        
        // 绘制射程圆
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, range, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    // 获取武器射程（需要根据具体武器实现）
    private getWeaponRange(weapon: Weapon): number {
        // 根据武器属性计算射程
        return 100; // 示例值
    }
}
```

### 2. 注册武器类型

在`src/world/components/weapon.ts`文件中添加新的武器类型：

```typescript
export type WeaponType = "standardMortar" | "technicalMortar" | "ub32" | "hellCannon" | "bm21"|"M121"|"MK19" | "newWeapon"; // 添加新武器类型
```

### 3. 更新武器渲染器工厂

在`src/render/weaponRenderers/index.ts`中导入并注册新的渲染器：

```typescript
// 在weaponRenderers对象中添加新武器的渲染器回调函数
export const weaponRenderers = {
  // ... 现有武器渲染器
  "standardMortar": () => {
    // ... 现有实现
  },
  "M121": () => {
    // ... 现有实现
  },
  // ... 其他现有武器渲染器
  
  // 添加新武器渲染器
  "newWeapon": () => {
    if (!weaponRendererInstances["newWeapon"]) {
      const { NewWeaponRenderer } = require('./NewWeaponRenderer');
      weaponRendererInstances["newWeapon"] = new NewWeaponRenderer();
    }
    return weaponRendererInstances["newWeapon"];
  }
} as const;
```

### 4. 添加国际化支持

在`src/i18n/locales/zh.ts`和`src/i18n/locales/en.ts`中添加新武器的翻译：

**中文翻译 (zh.ts):**
```typescript
const zhTranslations: LanguagePack = {
  // ... 现有翻译
  weapons: {
    // ... 现有武器翻译
    standardMortar: '标准迫击炮',
    M121: '120毫米迫击炮',
    technicalMortar: '技术型迫击炮',
    ub32: 'UB32火箭弹',
    hellCannon: '地狱火炮',
    bm21: 'BM-21火箭炮',
    MK19: 'MK19榴弹发射器',
    newWeapon: '新武器名称' // 添加新武器翻译
  },
  // ...
};
```

**英文翻译 (en.ts):**
```typescript
const enTranslations: LanguagePack = {
  // ... 现有翻译
  weapons: {
    // ... 现有武器翻译
    standardMortar: 'Standard Mortar',
    M121: '120mm Mortar',
    technicalMortar: 'Technical Mortar',
    ub32: 'UB32/S5 Rockets',
    hellCannon: 'Hell Cannon',
    bm21: 'BM-21 Grad',
    MK19: 'MK19',
    newWeapon: 'New Weapon Name' // 添加新武器翻译
  },
  // ...
};
```

### 5. 更新武器选项

在`src/ui/leftPanel.ts`中添加新武器到武器选项列表：

```typescript
// 武器基础数据（不包含显示名称）
const weaponBaseOptions = [
    // ... 现有武器
    ["standardMortar", "options/mortarRound10.png"],
    ["M121", "options/mortarRound10.png"],
    ["technicalMortar", "options/mortarRound10.png"],
    ["ub32", "options/s5rocket2.png"],
    ["hellCannon", "options/mortarRound10.png"],
    ["bm21", "options/s5rocket2.png"],
    ["MK19", "options/s5rocket2.png"],
    ["newWeapon", "options/newWeapon.png"], // 添加新武器选项
];
```

### 6. 添加武器图标

在`public/options/`目录下添加新武器的图标文件（例如`newWeapon.png`），确保图标尺寸和风格与其他武器图标保持一致。

## 高级功能实现

### 自定义弹道计算

如果新武器需要特殊的弹道计算，可以在渲染器中实现：

```typescript
export class NewWeaponRenderer extends WeaponRenderer {
    // 自定义弹道计算方法
    calculateTrajectory(startPos: vec3, targetPos: vec3): vec3[] {
        // 实现武器特定的弹道计算逻辑
        const trajectory: vec3[] = [];
        // ... 计算轨迹点
        return trajectory;
    }

    // 绘制弹道轨迹
    drawTrajectory(ctx: CanvasRenderingContext2D, trajectory: vec3[], screenTransform: (pos: vec3) => vec3 | null): void {
        // 实现轨迹绘制逻辑
    }
}
```

### 特殊视觉效果

可以为武器添加特殊视觉效果：

```typescript
export class NewWeaponRenderer extends WeaponRenderer {
    drawSpecialEffects(ctx: CanvasRenderingContext2D, weapon: Weapon, screenTransform: (pos: vec3) => vec3 | null): void {
        const screenPos = this.getWorldPos(weapon, screenTransform);
        if (!screenPos) return;

        // 实现特殊视觉效果，如发光、动画等
        ctx.save();
        ctx.translate(screenPos[0], screenPos[1]);
        
        // 绘制特殊效果
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        // ... 绘制代码
        
        ctx.restore();
    }
}
```

## 测试和验证

### 1. 编译测试
```bash
cd templates/map
npm run build-dev
```

### 2. 功能测试
- 验证新武器在武器选择器中正确显示
- 检查武器图标和射程圆正确渲染
- 测试折叠/展开功能是否正常
- 验证国际化文本正确显示

### 3. 性能测试
- 确保新武器渲染不会影响整体性能
- 检查大量武器同时渲染时的性能表现

## 最佳实践

### 1. 代码组织
- 保持渲染器类职责单一
- 重用现有方法和工具函数
- 遵循现有代码风格和命名约定

### 2. 性能优化
- 避免在渲染循环中进行复杂计算
- 使用缓存机制存储计算结果
- 及时释放不需要的资源

### 3. 可维护性
- 添加详细的代码注释
- 编写清晰的方法名称
- 保持代码结构清晰

### 4. 兼容性
- 确保在不同分辨率下正常显示
- 测试各种浏览器兼容性
- 验证与现有功能的集成

通过遵循以上步骤和最佳实践，您可以成功地向武器渲染器系统中添加新武器，并确保其稳定性和可维护性。