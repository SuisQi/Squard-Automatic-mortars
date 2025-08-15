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
    this.drawStandardSplash(ctx, lineWidthFactor);
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: FiringSolution, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    this.drawStandardSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected);
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
    this.drawTargetWithConfig(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId);
  }
}