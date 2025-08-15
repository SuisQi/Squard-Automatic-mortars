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

// 导入通用常量
import { GRAVITY as WORLD_GRAVITY, MAPSCALE as WORLD_MAPSCALE } from "../../world/constants";

// 地狱火炮特有常量
export const VELOCITY = 9500; // cm/s
export const MOA = 100;
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const MAX_RANGE = 92400; // cm, approx
export const DAMAGE_100_RANGE = 1000; // cm
export const DAMAGE_25_RANGE = 4000; // cm

/**
 * 地狱火炮武器渲染器
 * 即兴爆炸装置(IED)炮，具有高弧和低弧两种射击模式
 */
export class HellCannonWeaponRenderer extends BaseWeaponRenderer {
  weaponType = "hellCannon";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return 980; } // 使用标准重力
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return 0; } // 地狱火炮无最小射程限制
  getMaxRange(): number { return MAX_RANGE; }
  get100DamageRange(): number { return DAMAGE_100_RANGE; }
  get25DamageRange(): number { return DAMAGE_25_RANGE; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getHellCannonFiringSolution(weaponTranslation, targetTranslation);
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    this.drawStandardSplash(ctx, lineWidthFactor);
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
        highArc.horizontalSpread + DAMAGE_100_RANGE,
        highArc.closeSpread + DAMAGE_100_RANGE,
        highArc.closeSpread + DAMAGE_100_RANGE
      );
      
      // 绘制高弧25%伤害范围椭圆
      drawSpreadEllipse(
        ctx,
        highArc.weaponToTargetVec,
        highArc.horizontalSpread + DAMAGE_25_RANGE,
        highArc.closeSpread + DAMAGE_25_RANGE,
        highArc.closeSpread + DAMAGE_25_RANGE
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
    // 地狱火炮有特殊的高弧/低弧逻辑，所以使用通用配置
    this.drawTargetWithConfig(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId);
  }
  
  supportsGrid(): boolean {
    return false; // 地狱火炮不支持网格显示
  }
}