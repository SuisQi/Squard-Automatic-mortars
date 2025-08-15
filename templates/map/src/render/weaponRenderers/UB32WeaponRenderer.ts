import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getS5FiringSolution } from "../../world/projectilePhysics";
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

// 导入通用常量
import {  GRAVITY, MAPSCALE, US_MIL } from "../../world/constants";

// UB32火箭弹吊舱特有常量
export const MOA = 300;
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const VELOCITY = 30000; // cm/s

// S5火箭弹特有常量
export const S5_GRAVITY = 2 * GRAVITY; // cm/s^2
export const ACCELERATION = -5000;  // cm/s^2
export const ACCELERATION_TIME = 2;  // s

// S5火箭弹伤害参数
export const HIT_DAMAGE = 250;
export const HIT_PENETRATION = 130; // or 250 ?
export const EXPLOSIVE_BASE_DAMAGE = 115;
export const EXPLOSIVE_INNER_RADIUS = 500; // cm
export const EXPLOSIVE_OUTER_RADIUS = 1800; // cm
export const EXPLOSIVE_FALLOFF = 1;
export const MIN_RANGE = 5000;
/**
 * UB32火箭弹吊舱武器渲染器
 * 空对地火箭弹系统，具有大范围杀伤力
 */
export class UB32WeaponRenderer extends BaseWeaponRenderer {
  weaponType = "ub32";

  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return S5_GRAVITY; }
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return MIN_RANGE; } // 5000cm，与原设计一致
  getMaxRange(): number { return 0; } // UB32不显示最大射程圆圈
  get100DamageRange(): number { return EXPLOSIVE_INNER_RADIUS; }
  get25DamageRange(): number { return EXPLOSIVE_OUTER_RADIUS; }

  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getS5FiringSolution(weaponTranslation, targetTranslation);
  }

  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    // UB32火箭弹没有固定的爆炸圈，使用爆炸半径参数
    // 这里可以根据需要添加爆炸范围显示
  }

  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: FiringSolution, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    if (firingSolution.angle && firingSolution.time) {
      ctx.strokeStyle = '#00f';
      ctx.lineWidth = 1 * lineWidthFactor;
      drawSpreadEllipse(
        ctx,
        firingSolution.weaponToTargetVec,
        firingSolution.horizontalSpread,
        firingSolution.closeSpread,
        firingSolution.farSpread
      );
    }
  }

  getAngleValue(solution: any, userSettings: UserSettings): number {
    return solution.angle * 180 / Math.PI;
  }

  getAngleText(angleValue: number, solution: any): string {
    if (solution.angle && solution.time) {
      return `${angleValue.toFixed(1)}°  ${solution.time.toFixed(1)}s`;
    } else {
      return `No firing solution`;
    }
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
      const lineHeight = userSettings.fontSize * 1.7;

      ctx.save();
      applyTransform(ctx, target.transform);
      if (userSettings.targetSpread && solution.angle && solution.time) {
        this.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash);
      }

            // 动态导入canvasScaleTransform以避免循环依赖
      const { canvasScaleTransform } = require("../canvas");
      applyTransform(ctx, canvasScaleTransform(camera));
      applyTransform(ctx, newTranslation(10, activeWeaponIndex * lineHeight, 0));

      const angleText = activeWeapons.length > 1 ?
        (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + this.getAngleText(this.getAngleValue(solution, userSettings), solution) :
        this.getAngleText(this.getAngleValue(solution, userSettings), solution);

      outlineText(ctx, angleText, "bottom", TEXT_RED, TEXT_WHITE, userSettings.fontSize, true);

      const bottomText = userSettings.targetDistance ?
        `${solution.dir.toFixed(1)}° ${(solution.dist * MAPSCALE).toFixed(0)}m` :
        `${solution.dir.toFixed(1)}°`;
      outlineText(ctx, bottomText, "top", TEXT_RED, TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
      ctx.restore();

      this.drawTargetIcon(ctx, camera, target.transform);
    });
  }

  supportsGrid(): boolean {
    return false; // 火箭弹不支持网格显示
  }
}
