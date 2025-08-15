import { vec3, mat4 } from "gl-matrix";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { UserSettings } from "../../ui/types";
import { DirDataComponent } from "../../world/components/dirData";
import { User } from "../../replication_ws/types";
import { 
  drawSpreadEllipse, 
  outlineText 
} from "../canvas";
import { applyTransform } from "../../world/transformations";
import { getTranslation, newTranslation } from "../../world/transformations";
import { canonicalEntitySort } from "../../world/world";
import { TEXT_RED, TEXT_WHITE } from "../constants";
import { MAPSCALE as WORLD_MAPSCALE } from "../../world/constants";

/**
 * 武器渲染通用工具函数
 * 提取重复的绘制逻辑，供所有武器渲染器使用
 */

/**
 * 获取Canvas缩放变换（统一的动态导入处理）
 * @param camera 相机对象
 * @returns Canvas缩放变换
 */
export function getCanvasScaleTransform(camera: Camera) {
  // 动态导入canvasScaleTransform以避免循环依赖
  const { canvasScaleTransform } = require("../canvas");
  return canvasScaleTransform(camera);
}

/**
 * 绘制标准伤害范围圆圈
 * @param ctx Canvas绘制上下文
 * @param lineWidthFactor 线宽因子
 * @param damage100Range 100%伤害范围
 * @param damage25Range 25%伤害范围（可选）
 */
export function drawStandardSplash(
  ctx: CanvasRenderingContext2D, 
  lineWidthFactor: number, 
  damage100Range: number, 
  damage25Range?: number
): void {
  ctx.lineWidth = 1 * lineWidthFactor;
  ctx.strokeStyle = '#f00';
  
  // 绘制100%伤害范围
  if (damage100Range > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, damage100Range, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  // 绘制25%伤害范围
  if (damage25Range && damage25Range > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, damage25Range, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/**
 * 绘制标准精度椭圆
 * @param ctx Canvas绘制上下文
 * @param firingSolution 射击解决方案
 * @param lineWidthFactor 线宽因子
 * @param withSplash 是否显示爆炸范围
 * @param selected 是否选中状态
 * @param damage100Range 100%伤害范围
 * @param damage25Range 25%伤害范围
 */
export function drawStandardSpread(
  ctx: CanvasRenderingContext2D,
  firingSolution: any,
  lineWidthFactor: number,
  withSplash: boolean,
  selected: boolean = false,
  damage100Range: number = 0,
  damage25Range: number = 0
): void {
  ctx.lineWidth = 1 * lineWidthFactor;
  
  if (!selected) {
    ctx.strokeStyle = '#00f';
  }
  
  // 绘制精度椭圆
  drawSpreadEllipse(
    ctx,
    firingSolution.weaponToTargetVec,
    firingSolution.horizontalSpread,
    firingSolution.closeSpread,
    firingSolution.closeSpread,
    selected
  );
  
  if (withSplash && (damage100Range > 0 || damage25Range > 0)) {
    ctx.strokeStyle = '#f00';
    
    // 绘制100%伤害范围椭圆
    if (damage100Range > 0) {
      drawSpreadEllipse(
        ctx,
        firingSolution.weaponToTargetVec,
        firingSolution.horizontalSpread + damage100Range,
        firingSolution.closeSpread + damage100Range,
        firingSolution.closeSpread + damage100Range
      );
    }
    
    // 绘制25%伤害范围椭圆
    if (damage25Range > 0) {
      drawSpreadEllipse(
        ctx,
        firingSolution.weaponToTargetVec,
        firingSolution.horizontalSpread + damage25Range,
        firingSolution.closeSpread + damage25Range,
        firingSolution.closeSpread + damage25Range
      );
    }
  }
}

/**
 * 格式化角度文本
 * @param angleValue 角度值
 * @param solution 射击解决方案
 * @param precision 精度
 * @param activeWeaponIndex 激活武器索引
 * @param allWeaponsIndex 所有武器索引映射
 * @param weaponEntityId 武器实体ID
 * @returns 格式化后的角度文本
 */
export function formatAngleText(
  angleValue: number,
  solution: any,
  precision: number,
  activeWeaponIndex: number,
  allWeaponsIndex: any,
  weaponEntityId: number,
  activeWeaponsLength: number
): string {
  let angleText = "-----";
  
  if (solution.angle && angleValue >= 1000) {
    angleText = angleValue.toFixed(precision).toString().substr(1, 4 + precision);
  } else if (solution.angle) {
    angleText = angleValue.toFixed(precision).toString().substr(0, 3 + precision);
  }
  
  if (activeWeaponsLength > 1) {
    angleText = (allWeaponsIndex[weaponEntityId] + 1).toString() + ": " + angleText;
  }
  
  return angleText;
}

/**
 * 武器目标绘制配置接口
 */
export interface WeaponTargetRenderConfig {
  /** 是否支持网格显示 */
  supportsGrid?: boolean;
  /** 获取角度值的函数 */
  getAngleValue: (solution: any, userSettings: UserSettings) => number;
  /** 获取角度文本的函数 */
  getAngleText: (angleValue: number, solution: any) => string;
  /** 获取角度精度的函数 */
  getAnglePrecision: (userSettings: UserSettings) => number;
  /** 获取射击解决方案的函数 */
  getFiringSolution: (weaponTranslation: vec3, targetTranslation: vec3) => any;
  /** 绘制精度椭圆的函数 */
  drawSpread: (ctx: CanvasRenderingContext2D, firingSolution: any, lineWidthFactor: number, withSplash: boolean, selected?: boolean) => void;
  /** 绘制爆炸范围的函数 */
  drawSplash: (ctx: CanvasRenderingContext2D, lineWidthFactor: number) => void;
  /** 绘制目标网格的函数（可选） */
  drawTargetGrid?: (ctx: any, lineWidthFactor: number, weaponTransform: Transform, firingSolution: any) => void;
}

/**
 * 通用武器目标绘制函数
 * 标准化所有武器的目标绘制逻辑，消除重复代码
 */
export function drawWeaponTarget(
  ctx: any,
  camera: Camera,
  userSettings: UserSettings,
  heightmap: Heightmap,
  weapons: Array<Weapon>,
  target: Target,
  config: WeaponTargetRenderConfig,
  dirdatas?: Map<number, DirDataComponent>,
  userId?: User['id']
): void {
  const canvasScaleTransform = getCanvasScaleTransform(camera);
  const canvasSizeFactor = mat4.getScaling(vec3.create(), canvasScaleTransform)[0];
  canonicalEntitySort(weapons);
  const activeWeapons = weapons.filter((w: Weapon) => w.isActive);
  const allWeaponsIndex: any = {};
  weapons.forEach((w: Weapon, index: number) => {
    if (w.isActive) {
      allWeaponsIndex[w.entityId] = index;
    }
  });
  
  activeWeapons.forEach((weapon: Weapon, activeWeaponIndex: number) => {
    const weaponTranslation = getTranslation(weapon.transform);
    const weaponHeight = getHeight(heightmap, weaponTranslation);
    weaponTranslation[2] = weaponHeight + weapon.heightOverGround;
    const targetTranslation = getTranslation(target.transform);
    const targetHeight = getHeight(heightmap, targetTranslation);
    targetTranslation[2] = targetHeight;
    
    const solution = config.getFiringSolution(weaponTranslation, targetTranslation);
    const lineHeight = userSettings.fontSize * (userSettings.targetCompactMode ? 1 : 1.7);

    // 绘制网格（如果支持）
    if (userSettings.targetGrid && config.supportsGrid && config.drawTargetGrid) {
      config.drawTargetGrid(ctx, canvasSizeFactor, weapon.transform, solution);
    }
    
    ctx.save();
    applyTransform(ctx, target.transform);
    
    // 绘制精度椭圆和爆炸范围
    if (userSettings.targetSpread) {
      if (dirdatas && dirdatas.get(target.entityId)?.userIds?.includes(userId || '')) {
        ctx.strokeStyle = '#ff004d';
        ctx.fillStyle = 'rgba(231, 76, 60,0.5)';
      } else if (dirdatas && !dirdatas.get(target.entityId)?.userIds?.includes(userId || '')) {
        ctx.strokeStyle = '#AAB7B8';
        ctx.fillStyle = 'rgba(131, 145, 146,0.5)';
      }
      config.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash, dirdatas?.has(target.entityId));
    } else if (userSettings.targetSplash) {
      config.drawSplash(ctx, canvasSizeFactor);
    }
    
    // 绘制角度文本
    applyTransform(ctx, canvasScaleTransform);
    const angleValue = config.getAngleValue(solution, userSettings);
    applyTransform(ctx, newTranslation(10, activeWeaponIndex * lineHeight, 0));
    
    if (userSettings.targetCompactMode) {
      const precision = config.getAnglePrecision(userSettings);
      const angleText = formatAngleText(
        angleValue,
        solution,
        precision,
        activeWeaponIndex,
        allWeaponsIndex,
        weapon.entityId,
        activeWeapons.length
      );
      outlineText(ctx, angleText, "middle", TEXT_RED, TEXT_WHITE, userSettings.fontSize, true);
    } else {
      let angleText = config.getAngleText(angleValue, solution);
      if (activeWeapons.length > 1) {
        angleText = (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + angleText;
      }
      outlineText(ctx, angleText, "bottom", TEXT_RED, TEXT_WHITE, userSettings.fontSize, true);
      
      // 绘制底部信息（方向、时间、距离）
      const bottomTextComponents = [];
      
      // 方向信息
      if (solution.dir !== undefined) {
        bottomTextComponents.push(`${solution.dir.toFixed(1)}°`);
      } else if (solution.highArc?.dir !== undefined) {
        bottomTextComponents.push(`${solution.highArc.dir.toFixed(1)}°`);
      }
      
      // 时间信息
      if (solution.time !== undefined) {
        bottomTextComponents.push(`${solution.time.toFixed(1)}s`);
      } else if (solution.highArc?.time !== undefined && solution.lowArc?.time !== undefined) {
        bottomTextComponents.push(`${solution.highArc.time ? solution.highArc.time.toFixed(1) : "-"}s | ${solution.lowArc.time ? solution.lowArc.time.toFixed(1) : "-"}s`);
      }
      
      // 距离信息
      if (userSettings.targetDistance) {
        if (solution.dist !== undefined) {
          bottomTextComponents.push(`${(solution.dist * WORLD_MAPSCALE).toFixed(0)}m`);
        } else if (solution.highArc?.dist !== undefined) {
          bottomTextComponents.push(`${(solution.highArc.dist * WORLD_MAPSCALE).toFixed(0)}m`);
        }
      }
      
      const bottomText = bottomTextComponents.join(' ');
      if (bottomText) {
        outlineText(ctx, bottomText, "top", TEXT_RED, TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
      }
    }
    ctx.restore();
  });
}