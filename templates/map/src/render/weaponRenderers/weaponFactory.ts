/**
 * 武器渲染器工厂
 * 使用回调函数完全避免模块导入时的循环依赖
 */

/**
 * 武器渲染器实例缓存
 */
const weaponRendererInstances: { [key: string]: any } = {};

/**
 * 武器渲染器映射表
 * 使用回调函数避免在模块加载时就创建循环依赖
 */
export const weaponRenderers = {
  "standardMortar": () => {
    if (!weaponRendererInstances["standardMortar"]) {
      // 延迟到调用时才进行模块导入
      const module = eval('require("./MortarWeaponRenderer")');
      weaponRendererInstances["standardMortar"] = new module.MortarWeaponRenderer();
    }
    return weaponRendererInstances["standardMortar"];
  },
  "technicalMortar": () => {
    if (!weaponRendererInstances["technicalMortar"]) {
      const module = eval('require("./MortarWeaponRenderer")');
      weaponRendererInstances["technicalMortar"] = new module.MortarWeaponRenderer();
    }
    return weaponRendererInstances["technicalMortar"];
  },
  "M121": () => {
    if (!weaponRendererInstances["M121"]) {
      const module = eval('require("./M121WeaponRenderer")');
      weaponRendererInstances["M121"] = new module.M121WeaponRenderer();
    }
    return weaponRendererInstances["M121"];
  },
  "MK19": () => {
    if (!weaponRendererInstances["MK19"]) {
      const module = eval('require("./MK19WeaponRenderer")');
      weaponRendererInstances["MK19"] = new module.MK19WeaponRenderer();
    }
    return weaponRendererInstances["MK19"];
  },
  "ub32": () => {
    if (!weaponRendererInstances["ub32"]) {
      const module = eval('require("./RocketPodWeaponRenderer")');
      weaponRendererInstances["ub32"] = new module.RocketPodWeaponRenderer();
    }
    return weaponRendererInstances["ub32"];
  },
  "hellCannon": () => {
    if (!weaponRendererInstances["hellCannon"]) {
      const module = eval('require("./HellCannonWeaponRenderer")');
      weaponRendererInstances["hellCannon"] = new module.HellCannonWeaponRenderer();
    }
    return weaponRendererInstances["hellCannon"];
  },
  "bm21": () => {
    if (!weaponRendererInstances["bm21"]) {
      const module = eval('require("./BM21WeaponRenderer")');
      weaponRendererInstances["bm21"] = new module.BM21WeaponRenderer();
    }
    return weaponRendererInstances["bm21"];
  }
} as const;

/**
 * 武器类型定义
 */
export type WeaponType = keyof typeof weaponRenderers;