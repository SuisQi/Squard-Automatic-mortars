import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getHellCannonFiringSolution } from "../../world/projectilePhysics";
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

// 地狱火炮相关常量
export const MAPSCALE = 0.01;

// 地狱火炮特有常量
export const HELL_CANNON_VELOCITY = 9500; // cm/s
export const HELL_CANNON_MOA = 100;
export const HELL_CANNON_DEVIATION = HELL_CANNON_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const HELL_CANNON_MAX_RANGE = 92400; // cm, approx
export const HELL_CANNON_100_DAMAGE_RANGE = 1000; // cm
export const HELL_CANNON_25_DAMAGE_RANGE = 4000; // cm

/**
 * 地狱火炮武器渲染器
 * 即兴爆炸装置(IED)炮，具有高弧和低弧两种射击模式
 */
export class HellCannonWeaponRenderer extends BaseWeaponRenderer {
  weaponType = "hellCannon";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return HELL_CANNON_VELOCITY; }
  getGravity(): number { return 980; } // 使用标准重力
  getDeviation(): number { return HELL_CANNON_DEVIATION; }
  getMinRange(): number { return 0; } // 地狱火炮无最小射程限制
  getMaxRange(): number { return HELL_CANNON_MAX_RANGE; }
  get100DamageRange(): number { return HELL_CANNON_100_DAMAGE_RANGE; }
  get25DamageRange(): number { return HELL_CANNON_25_DAMAGE_RANGE; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getHellCannonFiringSolution(weaponTranslation, targetTranslation);
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    ctx.lineWidth = 1 * lineWidthFactor;
    ctx.strokeStyle = '#f00';
    
    // 绘制100%伤害范围
    ctx.beginPath();
    ctx.arc(0, 0, HELL_CANNON_100_DAMAGE_RANGE, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 绘制25%伤害范围
    ctx.beginPath();
    ctx.arc(0, 0, HELL_CANNON_25_DAMAGE_RANGE, 0, 2 * Math.PI);
    ctx.stroke();
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: any, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    const {highArc, lowArc} = firingSolution;
    ctx.lineWidth = 1 * lineWidthFactor;
    ctx.strokeStyle = '#00f';
    
    // 绘制高弧精度椭圆
    drawSpreadEllipse(
      ctx,
      highArc.weaponToTargetVec,
      highArc.horizontalSpread,
      highArc.closeSpread,
      highArc.closeSpread
    );
    
    // 绘制低弧精度椭圆
    drawSpreadEllipse(
      ctx,
      lowArc.weaponToTargetVec,
      lowArc.horizontalSpread,
      lowArc.closeSpread,
      lowArc.closeSpread
    );
    
    if (withSplash) {
      ctx.strokeStyle = '#f00';
      
      // 绘制高弧100%伤害范围椭圆
      drawSpreadEllipse(
        ctx,
        highArc.weaponToTargetVec,
        highArc.horizontalSpread + HELL_CANNON_100_DAMAGE_RANGE,
        highArc.closeSpread + HELL_CANNON_100_DAMAGE_RANGE,
        highArc.closeSpread + HELL_CANNON_100_DAMAGE_RANGE
      );
      
      // 绘制高弧25%伤害范围椭圆
      drawSpreadEllipse(
        ctx,
        highArc.weaponToTargetVec,
        highArc.horizontalSpread + HELL_CANNON_25_DAMAGE_RANGE,
        highArc.closeSpread + HELL_CANNON_25_DAMAGE_RANGE,
        highArc.closeSpread + HELL_CANNON_25_DAMAGE_RANGE
      );
    }
  }
  
  getAngleValue(solution: any, userSettings: UserSettings): number {
    return solution.highArc.angle / Math.PI * 180;
  }
  
  getAngleText(angleValue: number, solution: any): string {
    const {highArc, lowArc} = solution;
    const angleLowValue = lowArc.angle / Math.PI * 180;
    return highArc.angle ? `${angleValue.toFixed(1)} | ${angleLowValue.toFixed(1)}` : "-----";
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

      ctx.save();
      applyTransform(ctx, target.transform);
      if (userSettings.targetSpread) {
        this.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash);
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
        const precision = 1;
        if (solution.highArc.angle && angleValue >= 1000) {
          angleText = angleValue.toFixed(precision).toString().substr(1, 4 + precision);
        } else if (solution.highArc.angle) {
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
        const bottomTextComponents = [
          `${solution.highArc.dir.toFixed(1)}°`,
          `${solution.highArc.time ? solution.highArc.time.toFixed(1) : "-"}s | ${solution.lowArc.time ? solution.lowArc.time.toFixed(1) : "-"}s`,
          userSettings.targetDistance ? `${(solution.highArc.dist * MAPSCALE).toFixed(0)}m` : "",
        ];
        const bottomText = bottomTextComponents.join(' ');
        outlineText(ctx, bottomText, "top", TEXT_RED, TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
      }
      ctx.restore();
    });
    
    this.drawTargetIcon(ctx, camera, target.transform);
  }
  
  supportsGrid(): boolean {
    return false; // 地狱火炮不支持网格显示
  }
}