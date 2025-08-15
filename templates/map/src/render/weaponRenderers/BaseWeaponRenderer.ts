import { vec3 } from "gl-matrix";
import { Camera } from "../../camera/types";
import { Heightmap } from "../../heightmap/types";
import { Transform, Weapon, Target } from "../../world/types";
import { FiringSolution } from "../../world/projectilePhysics";
import { UserSettings } from "../../ui/types";
import { DirDataComponent } from "../../world/components/dirData";
import { User } from "../../replication_ws/types";
import { applyTransform } from "../../world/transformations";
import { 
  drawStandardSplash, 
  drawStandardSpread, 
  drawWeaponTarget, 
  getCanvasScaleTransform,
  WeaponTargetRenderConfig
} from "./WeaponRenderUtils";

/**
 * 武器渲染器基类
 * 定义了所有武器渲染器的通用接口和默认行为
 */
export abstract class BaseWeaponRenderer {
  /** 武器类型标识符 */
  abstract weaponType: string;
  
  // 武器基础物理常量
  abstract getVelocity(): number;
  abstract getGravity(): number;
  abstract getDeviation(): number;
  abstract getMinRange(): number;
  abstract getMaxRange(): number;
  
  // 可选的武器特定常量
  getDrag(): number { return 0; }
  get100DamageRange(): number { return 0; }
  get25DamageRange(): number { return 0; }
  
  constructor() {}
  
  /**
   * 获取射击解决方案
   * @param weaponTranslation 武器位置
   * @param targetTranslation 目标位置
   * @returns 射击解决方案或包含高弧/低弧的对象
   */
  abstract getFiringSolution(weaponTranslation: vec3, targetTranslation: vec3): FiringSolution | {highArc: FiringSolution, lowArc: FiringSolution};
  
  /**
   * 绘制爆炸伤害范围
   * @param ctx Canvas绘制上下文
   * @param lineWidthFactor 线宽因子
   */
  abstract drawSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void;
  
  /**
   * 绘制射击精度椭圆
   * @param ctx Canvas绘制上下文
   * @param firingSolution 射击解决方案
   * @param lineWidthFactor 线宽因子
   * @param withSplash 是否显示爆炸范围
   * @param selected 是否选中状态
   */
  abstract drawSpread(ctx: CanvasRenderingContext2D, firingSolution: any, lineWidthFactor: number, withSplash: boolean, selected?: boolean): void;
  
  /**
   * 获取角度数值
   * @param solution 射击解决方案
   * @param userSettings 用户设置
   * @returns 格式化后的角度值
   */
  abstract getAngleValue(solution: any, userSettings: UserSettings): number;
  
  /**
   * 获取角度显示文本
   * @param angleValue 角度值
   * @param solution 射击解决方案
   * @param precision 精度（可选）
   * @returns 格式化的角度文本
   */
  abstract getAngleText(angleValue: number, solution: any, precision?: number): string;

  /**
   * 绘制目标图标
   * @param ctx Canvas绘制上下文
   * @param camera 相机对象
   * @param targetTransform 目标变换
   */
  drawTargetIcon(ctx: CanvasRenderingContext2D, camera: Camera, targetTransform: Transform): void {
    ctx.save();
    applyTransform(ctx, targetTransform);
    applyTransform(ctx, getCanvasScaleTransform(camera));

    // 绘制黑色外边框
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    ctx.stroke();

    // 绘制红色内圈
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'red';
    ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  
  /**
   * 绘制标准爆炸伤害范围（通用实现）
   * @param ctx Canvas绘制上下文
   * @param lineWidthFactor 线宽因子
   */
  drawStandardSplash(ctx: CanvasRenderingContext2D, lineWidthFactor: number): void {
    drawStandardSplash(ctx, lineWidthFactor, this.get100DamageRange(), this.get25DamageRange());
  }

  /**
   * 绘制标准精度椭圆（通用实现）
   * @param ctx Canvas绘制上下文
   * @param firingSolution 射击解决方案
   * @param lineWidthFactor 线宽因子
   * @param withSplash 是否显示爆炸范围
   * @param selected 是否选中状态
   */
  drawStandardSpread(ctx: CanvasRenderingContext2D, firingSolution: any, lineWidthFactor: number, withSplash: boolean, selected: boolean = false): void {
    drawStandardSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected, this.get100DamageRange(), this.get25DamageRange());
  }

  /**
   * 通用目标绘制方法
   * 使用标准化的绘制流程，子类只需提供配置即可
   * @param ctx Canvas绘制上下文
   * @param camera 相机对象
   * @param userSettings 用户设置
   * @param heightmap 高度图
   * @param weapons 武器数组
   * @param target 目标对象
   * @param dirdatas 方向数据映射
   * @param userId 用户ID
   */
  drawTargetWithConfig(
    ctx: any,
    camera: Camera,
    userSettings: UserSettings,
    heightmap: Heightmap,
    weapons: Array<Weapon>,
    target: Target,
    dirdatas?: Map<number, DirDataComponent>,
    userId?: User['id']
  ): void {
    const config: WeaponTargetRenderConfig = {
      supportsGrid: this.supportsGrid(),
      getAngleValue: this.getAngleValue.bind(this),
      getAngleText: this.getAngleText.bind(this),
      getAnglePrecision: this.getAnglePrecision.bind(this),
      getFiringSolution: this.getFiringSolution.bind(this),
      drawSpread: this.drawSpread.bind(this),
      drawSplash: this.drawSplash.bind(this),
      drawTargetGrid: this.supportsGrid() ? this.drawTargetGrid.bind(this) : undefined
    };
    
    drawWeaponTarget(ctx, camera, userSettings, heightmap, weapons, target, config, dirdatas, userId);
    this.drawTargetIcon(ctx, camera, target.transform);
  }

  /**
   * 绘制目标（抽象方法，子类必须实现）
   * 子类可以选择使用 drawTargetWithConfig 或自定义实现
   * @param ctx Canvas绘制上下文
   * @param camera 相机对象
   * @param userSettings 用户设置
   * @param heightmap 高度图
   * @param weapons 武器数组
   * @param target 目标对象
   * @param dirdatas 方向数据映射
   * @param userId 用户ID
   */
  abstract drawTarget(ctx: any, camera: Camera, userSettings: UserSettings, heightmap: Heightmap, weapons: Array<Weapon>, target: Target, dirdatas?: Map<number, DirDataComponent>, userId?: User['id']): void;
  
  /**
   * 是否支持网格显示
   * @returns 默认返回false
   */
  supportsGrid(): boolean {
    return false;
  }
  
  /**
   * 绘制目标网格
   * @param ctx Canvas绘制上下文
   * @param lineWidthFactor 线宽因子
   * @param weaponTransform 武器变换
   * @param firingSolution 射击解决方案
   */
  drawTargetGrid(ctx: any, lineWidthFactor: number, weaponTransform: Transform, firingSolution: FiringSolution): void {
    // 默认实现为空，子类可以重写
  }
  
  /**
   * 获取角度精度
   * @param userSettings 用户设置
   * @returns 角度精度
   */
  getAnglePrecision(userSettings: UserSettings): number {
    return 1;
  }
}