import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getBM21FiringSolution } from "../../world/projectilePhysics";
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

// BM21火箭炮相关常量
export const MAPSCALE = 0.01;
export const GRAVITY = 980; // cm/s^2

// BM21火箭炮特有常量
export const BM21_MOA = 200;
export const BM21_DEVIATION = BM21_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const BM21_VELOCITY = 20000; // cm/s
export const BM21_GRAVITY = 2 * GRAVITY; // cm/s^2
export const BM21_MIN_FLIGHT_TIME = 0.5; // s

// BM21火箭弹伤害参数
export const BM21_HIT_DAMAGE = 800;
export const BM21_EXPLOSIVE_BASE_DAMAGE = 140;
export const BM21_EXPLOSIVE_INNER_RADIUS = 100; // cm
export const BM21_EXPLOSIVE_OUTER_RADIUS = 3500; // cm
export const BM21_EXPLOSIVE_FALLOFF = 1;
export const BM21_REARM_TIME_PER_ROCKET = 3.8; // s

/**
 * BM21多管火箭炮武器渲染器
 * "喀秋莎"火箭炮系统，具有高弧和低弧两种射击模式
 */
export class BM21WeaponRenderer extends BaseWeaponRenderer {
  weaponType = "bm21";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return BM21_VELOCITY; }
  getGravity(): number { return BM21_GRAVITY; }
  getDeviation(): number { return BM21_DEVIATION; }
  getMinRange(): number { return 0; } // BM21无最小射程限制
  getMaxRange(): number { return 50000; } // 估计最大射程
  get100DamageRange(): number { return BM21_EXPLOSIVE_INNER_RADIUS; }
  get25DamageRange(): number { return BM21_EXPLOSIVE_OUTER_RADIUS; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getBM21FiringSolution(weaponTranslation, targetTranslation);
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    // BM21火箭弹的爆炸范围由爆炸参数定义，这里可以根据需要添加显示
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: any, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    const {highArc, lowArc} = firingSolution;
    if (lowArc.angle && lowArc.time) {
      ctx.lineWidth = 1 * lineWidthFactor;
      ctx.strokeStyle = '#00f';
      drawSpreadEllipse(
        ctx,
        lowArc.weaponToTargetVec,
        lowArc.horizontalSpread,
        lowArc.closeSpread,
        lowArc.farSpread
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
  
  getAnglePrecision(userSettings: UserSettings): number {
    return 1;
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
      }
      
            // 动态导入canvasScaleTransform以避免循环依赖
      const { canvasScaleTransform } = require("../canvas");
      applyTransform(ctx, canvasScaleTransform(camera));
      const angleValue = this.getAngleValue(solution, userSettings);
      const angleLowValue = solution.lowArc.angle / Math.PI * 180;
      applyTransform(ctx, newTranslation(10, activeWeaponIndex * lineHeight, 0));
      
      if (userSettings.targetCompactMode) {
        let angleText = "-----";
        const precision = this.getAnglePrecision(userSettings);
        if (solution.lowArc.angle && angleLowValue >= 1000) {
          angleText = angleLowValue.toFixed(precision).toString().substr(1, 4 + precision);
        } else if (solution.lowArc.angle) {
          angleText = angleLowValue.toFixed(precision).toString().substr(0, 3 + precision);
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
    return false; // BM21火箭炮不支持网格显示
  }
}