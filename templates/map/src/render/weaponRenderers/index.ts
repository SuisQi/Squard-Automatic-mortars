/**
 * 武器渲染器模块索引文件
 * 使用延迟require()避免循环依赖
 */

// 武器渲染器实例缓存
const weaponRendererInstances: { [key: string]: any } = {};

export const weaponRenderers = {
  "standardMortar": () => {
    if (!weaponRendererInstances["standardMortar"]) {
      const { MortarWeaponRenderer } = require('./MortarWeaponRenderer');
      weaponRendererInstances["standardMortar"] = new MortarWeaponRenderer();
    }
    return weaponRendererInstances["standardMortar"];
  },
  "technicalMortar": () => {
    if (!weaponRendererInstances["technicalMortar"]) {
      const { MortarWeaponRenderer } = require('./MortarWeaponRenderer');
      weaponRendererInstances["technicalMortar"] = new MortarWeaponRenderer();
    }
    return weaponRendererInstances["technicalMortar"];
  },
  "M121": () => {
    if (!weaponRendererInstances["M121"]) {
      const { M121WeaponRenderer } = require('./M121WeaponRenderer');
      weaponRendererInstances["M121"] = new M121WeaponRenderer();
    }
    return weaponRendererInstances["M121"];
  },
  "MK19": () => {
    if (!weaponRendererInstances["MK19"]) {
      const { MK19WeaponRenderer } = require('./MK19WeaponRenderer');
      weaponRendererInstances["MK19"] = new MK19WeaponRenderer();
    }
    return weaponRendererInstances["MK19"];
  },
  "ub32": () => {
    if (!weaponRendererInstances["ub32"]) {
      const { RocketPodWeaponRenderer } = require('./RocketPodWeaponRenderer');
      weaponRendererInstances["ub32"] = new RocketPodWeaponRenderer();
    }
    return weaponRendererInstances["ub32"];
  },
  "hellCannon": () => {
    if (!weaponRendererInstances["hellCannon"]) {
      const { HellCannonWeaponRenderer } = require('./HellCannonWeaponRenderer');
      weaponRendererInstances["hellCannon"] = new HellCannonWeaponRenderer();
    }
    return weaponRendererInstances["hellCannon"];
  },
  "bm21": () => {
    if (!weaponRendererInstances["bm21"]) {
      const { BM21WeaponRenderer } = require('./BM21WeaponRenderer');
      weaponRendererInstances["bm21"] = new BM21WeaponRenderer();
    }
    return weaponRendererInstances["bm21"];
  }
} as const;

export type WeaponType = keyof typeof weaponRenderers;