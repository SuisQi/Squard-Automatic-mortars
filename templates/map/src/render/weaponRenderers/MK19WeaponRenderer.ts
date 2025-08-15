import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getMK19FiringSolution } from "../../world/projectilePhysics";
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
import { GRAVITY as WORLD_GRAVITY, MAPSCALE as WORLD_MAPSCALE } from "../../world/constants";

// MK19 40mm榴弹发射器特有常量
export const MOA = 35;
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const VELOCITY = 23600; // cm/s
export const MAX_RANGE = 340000; // cm
export const MIN_RANGE = 3000; // cm
export const DAMAGE_100_RANGE = 100; // cm
export const DAMAGE_25_RANGE = 150; // cm
export const MK19_GRAVITY = WORLD_GRAVITY; // cm/s^2

/**
 * MK19 40mm自动榴弹发射器武器渲染器
 * 低弹道直射武器，具有高精度和快速射击能力
 */
export class MK19WeaponRenderer extends BaseWeaponRenderer {
  weaponType = "MK19";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return MK19_GRAVITY; }
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return MIN_RANGE; }
  getMaxRange(): number { return MAX_RANGE; }
  get100DamageRange(): number { return DAMAGE_100_RANGE; }
  get25DamageRange(): number { return DAMAGE_25_RANGE; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getMK19FiringSolution(weaponTranslation, targetTranslation).lowArc;
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    this.drawStandardSplash(ctx, lineWidthFactor);
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: FiringSolution, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    this.drawStandardSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected);
  }
  
  getAngleValue(solution: any, userSettings: UserSettings): number {
    return solution.angle / Math.PI * 180;
  }
  
  getAngleText(angleValue: number, solution: any): string {
    return solution.angle ? `${(angleValue.toFixed(2))}` : "-----";
  }
  
  getAnglePrecision(userSettings: UserSettings): number {
    return 2;
  }
  
  supportsGrid(): boolean {
    return false; // MK19不支持网格显示
  }

  drawTarget(ctx: any, camera: Camera, userSettings: UserSettings, heightmap: Heightmap, weapons: Array<Weapon>, target: Target, dirdatas?: Map<number, DirDataComponent>, userId?: User['id']): void {
    this.drawTargetWithConfig(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId);
  }
}