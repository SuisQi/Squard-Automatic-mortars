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
import { GRAVITY as WORLD_GRAVITY, MAPSCALE as WORLD_MAPSCALE, US_MIL as WORLD_US_MIL } from "../../world/constants";

// BM21火箭炮特有常量
export const MOA = 200;
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const VELOCITY = 20000; // cm/s
export const BM21_GRAVITY = 2 * WORLD_GRAVITY; // cm/s^2
export const MIN_FLIGHT_TIME = 0.5; // s

// BM21火箭弹伤害参数
export const HIT_DAMAGE = 800;
export const EXPLOSIVE_BASE_DAMAGE = 140;
export const EXPLOSIVE_INNER_RADIUS = 100; // cm
export const EXPLOSIVE_OUTER_RADIUS = 3500; // cm
export const MIN_RANGE = 5000;
export const EXPLOSIVE_FALLOFF = 1;
export const REARM_TIME_PER_ROCKET = 3.8; // s

/**
 * BM21多管火箭炮武器渲染器
 * "喀秋莎"火箭炮系统，具有高弧和低弧两种射击模式
 */
export class BM21WeaponRenderer extends BaseWeaponRenderer {
  weaponType = "bm21";

  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return BM21_GRAVITY; }
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return MIN_RANGE; } // 5000cm，与原设计一致
  getMaxRange(): number { return 0; } // BM21不显示最大射程圆圈
  get100DamageRange(): number { return EXPLOSIVE_INNER_RADIUS; }
  get25DamageRange(): number { return EXPLOSIVE_OUTER_RADIUS; }

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
    // BM21火箭炮有特殊的高弧/低弧逻辑，使用通用配置
    this.drawTargetWithConfig(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId);
  }

  supportsGrid(): boolean {
    return false; // BM21火箭炮不支持网格显示
  }
}
