import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getM121FiringSolution, angle2groundDistance } from "../../world/projectilePhysics";
import { UserSettings } from "../../ui/types";
import { DirDataComponent } from "../../world/components/dirData";
import { User } from "../../replication_ws/types";
import { 
  drawSpreadEllipse, 
  outlineText,
  drawLine 
} from "../canvas";
import { applyTransform } from "../../world/transformations";
import { getTranslation, newTranslation } from "../../world/transformations";
import { canonicalEntitySort } from "../../world/world";
import { TEXT_RED, TEXT_WHITE } from "../constants";

// 导入通用常量
import { GRAVITY as WORLD_GRAVITY, US_MIL as WORLD_US_MIL, MAPSCALE as WORLD_MAPSCALE } from "../../world/constants";

// M121 120mm迫击炮特有常量
export const MORTAR_VELOCITY = 10989; // cm/s - 用于网格计算
export const MOA = 40;
export const DRAG = 0;
export const VELOCITY = 14200; // cm/s
export const M121_GRAVITY = WORLD_GRAVITY; // cm/s^2
export const MIN_RANGE = 30000; // cm
export const MAX_RANGE = 200000; // cm
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const DAMAGE_100_RANGE = 600; // cm
export const DAMAGE_25_RANGE = 4200; // cm

/**
 * 绘制迫击炮网格线（M121使用与标准迫击炮相同的网格系统）
 */
function drawMortarGridLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, r0: number, r1: number, dir: number) {
  const phi = dir * Math.PI / 180;
  const [kx, ky] = [Math.sin(phi), -Math.cos(phi)];
  drawLine(ctx, x0 + kx * r0, y0 + ky * r0, x0 + kx * r1, y0 + ky * r1);
}

/**
 * 绘制迫击炮网格弧线
 */
function drawMortarGridArc(ctx: CanvasRenderingContext2D, x0: number, y0: number, r: number, dir: number) {
  if (r >= 0) {
    const alpha = Math.PI / 180;
    const phi = (dir - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(x0, y0, r, phi - 2 * alpha, phi + 3 * alpha);
    ctx.stroke();
  }
}

/**
 * M121 120mm迫击炮武器渲染器
 * 重型迫击炮，具有更大的射程和威力
 */
export class M121WeaponRenderer extends BaseWeaponRenderer {
  weaponType = "M121";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return M121_GRAVITY; }
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return MIN_RANGE; }
  getMaxRange(): number { return MAX_RANGE; }
  getDrag(): number { return DRAG; }
  get100DamageRange(): number { return DAMAGE_100_RANGE; }
  get25DamageRange(): number { return DAMAGE_25_RANGE; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getM121FiringSolution(weaponTranslation, targetTranslation).highArc;
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    ctx.lineWidth = 1 * lineWidthFactor;
    ctx.strokeStyle = '#f00';
    
    // 绘制100%伤害范围
    ctx.beginPath();
    ctx.arc(0, 0, DAMAGE_100_RANGE, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 绘制25%伤害范围
    ctx.beginPath();
    ctx.arc(0, 0, DAMAGE_25_RANGE, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: FiringSolution, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    ctx.beginPath();
    ctx.save();
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
    
    if (withSplash) {
      ctx.strokeStyle = '#f00';
      
      // 绘制100%伤害范围椭圆
      drawSpreadEllipse(
        ctx,
        firingSolution.weaponToTargetVec,
        firingSolution.horizontalSpread + DAMAGE_100_RANGE,
        firingSolution.closeSpread + DAMAGE_100_RANGE,
        firingSolution.closeSpread + DAMAGE_100_RANGE
      );
      
      // 绘制25%伤害范围椭圆
      drawSpreadEllipse(
        ctx,
        firingSolution.weaponToTargetVec,
        firingSolution.horizontalSpread + DAMAGE_25_RANGE,
        firingSolution.closeSpread + DAMAGE_25_RANGE,
        firingSolution.closeSpread + DAMAGE_25_RANGE
      );
    }
    ctx.restore();
  }
  
  getAngleValue(solution: any, userSettings: UserSettings): number {
    return solution.angle / Math.PI * 180 + 0.1;
  }
  
  getAngleText(angleValue: number, solution: any): string {
    return solution.angle ? `${(angleValue.toFixed(2))}` : "-----";
  }
  
  getAnglePrecision(userSettings: UserSettings): number {
    return 2;
  }
  
  supportsGrid(): boolean {
    return true;
  }
  
  drawTargetGrid(ctx: any, lineWidthFactor: number, weaponTransform: Transform, firingSolution: FiringSolution): void {
    ctx.save();
    applyTransform(ctx, weaponTransform);
    const gridDir = Math.floor(firingSolution.dir);
    const mil5 = Math.floor(firingSolution.angle * WORLD_US_MIL / 5) * 5;
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1 * lineWidthFactor;

    const arcRadii = [-10, -5, 0, 5, 10, 15].map(
      x => angle2groundDistance((mil5 + x)/WORLD_US_MIL, firingSolution.startHeightOffset, MORTAR_VELOCITY, WORLD_GRAVITY)
    );
    const [ra, r0, r1, r2, r3, rb] = arcRadii;
    
    // 绘制径向网格线
    [-2, -1, 0, 1, 2, 3].forEach(
      gridOffset => drawMortarGridLine(ctx, 0, 0, ra, rb, gridDir + gridOffset)
    );
    
    // 绘制弧线网格
    arcRadii.forEach(
      arcRadius => drawMortarGridArc(ctx, 0, 0, arcRadius, gridDir)
    );
    
    ctx.restore();
  }

  drawTarget(ctx: any, camera: Camera, userSettings: UserSettings, heightmap: Heightmap, weapons: Array<Weapon>, target: Target, dirdatas?: Map<number, DirDataComponent>, userId?: User['id']): void {
    // 动态导入canvasScaleTransform以避免循环依赖
    const { canvasScaleTransform } = require("../canvas");
    const canvasSizeFactor = mat4.getScaling(vec3.create(), canvasScaleTransform(camera))[0];
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
      
      const solution = this.getFiringSolution(weaponTranslation, targetTranslation);
      const lineHeight = userSettings.fontSize * (userSettings.targetCompactMode ? 1 : 1.7);

      if (userSettings.targetGrid && this.supportsGrid()) {
        this.drawTargetGrid(ctx, canvasSizeFactor, weapon.transform, solution);
      }
      
      ctx.save();
      applyTransform(ctx, target.transform);
      
      if (userSettings.targetSpread) {
        if (dirdatas && dirdatas.get(target.entityId)?.userIds?.includes(userId || '')) {
          ctx.strokeStyle = '#ff004d';
          ctx.fillStyle = 'rgba(231, 76, 60,0.5)';
        } else if (dirdatas && !dirdatas.get(target.entityId)?.userIds?.includes(userId || '')) {
          ctx.strokeStyle = '#AAB7B8';
          ctx.fillStyle = 'rgba(131, 145, 146,0.5)';
        }
        this.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash, dirdatas?.has(target.entityId));
      } else if (userSettings.targetSplash) {
        this.drawSplash(ctx, canvasSizeFactor);
      }
      
            // 动态导入canvasScaleTransform以避免循环依赖
      const { canvasScaleTransform } = require("../canvas");
      applyTransform(ctx, canvasScaleTransform(camera));
      const angleValue = this.getAngleValue(solution, userSettings);
      applyTransform(ctx, newTranslation(10, activeWeaponIndex * lineHeight, 0));
      
      if (userSettings.targetCompactMode) {
        let angleText = "-----";
        const precision = this.getAnglePrecision(userSettings);
        if (solution.angle && angleValue >= 1000) {
          angleText = angleValue.toFixed(precision).toString().substr(1, 4 + precision);
        } else if (solution.angle) {
          angleText = angleValue.toFixed(precision).toString().substr(0, 3 + precision);
        }
        if (activeWeapons.length > 1) {
          angleText = (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + angleText;
        }
        outlineText(ctx, angleText, "middle", TEXT_RED, TEXT_WHITE, userSettings.fontSize, true);
      } else {
        let angleText = this.getAngleText(angleValue, solution);
        if (activeWeapons.length > 1) {
          angleText = (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + angleText;
        }
        outlineText(ctx, angleText, "bottom", TEXT_RED, TEXT_WHITE, userSettings.fontSize, true);
        const bottomText = userSettings.targetDistance ? 
          `${solution.dir.toFixed(1)}° ${(solution.dist * WORLD_MAPSCALE).toFixed(0)}m` : 
          `${solution.dir.toFixed(1)}°`;
        outlineText(ctx, bottomText, "top", TEXT_RED, TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
      }
      ctx.restore();
    });
    
    this.drawTargetIcon(ctx, camera, target.transform);
  }
}