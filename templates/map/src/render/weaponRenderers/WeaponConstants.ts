/**
 * 武器系统常量管理器
 * 定义了所有武器共享的常量和工具函数
 */

// 基础物理常量
export const MAPSCALE = 0.01;
export const GRAVITY = 980; // cm/s^2
export const US_MIL = 1018.59;

// 最大距离限制
export const MAX_DISTANCE = 123200; // cm

/**
 * 从武器渲染器获取常量的工具函数
 */
export class WeaponConstants {
  /**
   * 获取武器的所有物理常量
   * @param weaponRenderer 武器渲染器实例
   * @returns 包含所有武器常量的对象
   */
  static getWeaponConstants(weaponRenderer: any) {
    return {
      velocity: weaponRenderer.getVelocity(),
      gravity: weaponRenderer.getGravity(),
      deviation: weaponRenderer.getDeviation(),
      minRange: weaponRenderer.getMinRange(),
      maxRange: weaponRenderer.getMaxRange(),
      drag: weaponRenderer.getDrag(),
      damage100Range: weaponRenderer.get100DamageRange(),
      damage25Range: weaponRenderer.get25DamageRange(),
    };
  }
  
  /**
   * 获取武器射程信息
   * @param weaponRenderer 武器渲染器实例
   * @returns 射程信息对象
   */
  static getWeaponRanges(weaponRenderer: any) {
    return {
      min: weaponRenderer.getMinRange(),
      max: weaponRenderer.getMaxRange(),
    };
  }
  
  /**
   * 获取武器伤害范围信息
   * @param weaponRenderer 武器渲染器实例
   * @returns 伤害范围信息对象
   */
  static getWeaponDamageRanges(weaponRenderer: any) {
    return {
      damage100: weaponRenderer.get100DamageRange(),
      damage25: weaponRenderer.get25DamageRange(),
    };
  }
}