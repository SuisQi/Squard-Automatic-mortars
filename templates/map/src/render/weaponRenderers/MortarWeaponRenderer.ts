import { vec3, mat4 } from "gl-matrix";
import { BaseWeaponRenderer } from "./BaseWeaponRenderer";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { getHeight } from "../../heightmap/heightmap";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution, getMortarFiringSolution, angle2groundDistance } from "../../world/projectilePhysics";
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

// 迫击炮特有常量
export const VELOCITY = 10989; // cm/s
export const MOA = 50;
export const DEVIATION = MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
export const MIN_RANGE = 5000; // cm
export const MAX_RANGE = 123096.963; // cm
export const DAMAGE_100_RANGE = 650; // cm
export const DAMAGE_25_RANGE = 1200; // cm
export const DAMAGE_10_RANGE = 1500; // cm

/**
 * 绘制迫击炮网格线
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
 * 迫击炮武器渲染器
 * 处理标准迫击炮和技术迫击炮的渲染
 */
export class MortarWeaponRenderer extends BaseWeaponRenderer {
  weaponType = "standardMortar";
  
  // 实现基类抽象方法 - 武器常量
  getVelocity(): number { return VELOCITY; }
  getGravity(): number { return WORLD_GRAVITY; }
  getDeviation(): number { return DEVIATION; }
  getMinRange(): number { return MIN_RANGE; }
  getMaxRange(): number { return MAX_RANGE; }
  get100DamageRange(): number { return DAMAGE_100_RANGE; }
  get25DamageRange(): number { return DAMAGE_25_RANGE; }
  
  getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3) {
    return getMortarFiringSolution(weaponTranslation, targetTranslation).highArc;
  }
  
  drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    this.drawStandardSplash(ctx, lineWidthFactor);
  }
  
  drawSpread(ctx: CanvasRenderingContext2D, firingSolution: FiringSolution, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    this.drawStandardSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected);
  }
  
  getAngleValue(solution: any, userSettings: UserSettings): number {
    return userSettings.weaponType === "technicalMortar" ? 
      solution.angle / Math.PI * 180 : 
      solution.angle * WORLD_US_MIL;
  }
  
  getAngleText(angleValue: number, solution: any): string {
    return solution.angle ? `${(angleValue >> 0)}` : "-----";
  }
  
  getAnglePrecision(userSettings: UserSettings): number {
    return userSettings.weaponType === "technicalMortar" ? 1 : 0;
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
      x => angle2groundDistance((mil5 + x)/WORLD_US_MIL, firingSolution.startHeightOffset, VELOCITY, WORLD_GRAVITY)
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

