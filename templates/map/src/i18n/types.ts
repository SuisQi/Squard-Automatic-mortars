/**
 * 国际化系统类型定义
 */

// 支持的语言类型
export type Language = 'zh' | 'en';

// 语言选项
export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

// 翻译键的命名空间
export interface TranslationKeys {
  // 地图相关
  maps: {
    [mapId: string]: string;
  };
  
  // 武器相关
  weapons: {
    [weaponType: string]: string;
  };
  
  // 工具提示
  tooltips: {
    showMapGrid: string;
    gridSpacing: string;
    showKeypadsWhileMovingWeapon: string;
    showKeypadLabelWhileMovingWeapon: string;
    targetingGrid: string;
    projectileSpread: string;
    splashRadius: string;
    weaponTargetDistance: string;
    compactTargetText: string;
    showKeypadsWhileMovingTarget: string;
    showKeypadLabelWhileMovingTarget: string;
    fontSize: string;
    showExtraButtonsInCollapsedMode: string;
    deleteItemsWithSingleClick: string;
    placeTargetOrWeaponMarkers: string;
    showTerrainMap: string;
    removeAllTargets: string;
    activateThisWeapon: string;
    activateDeactivateWeapon: string;
    weaponHeightOverGround: string;
  };
  
  // 界面标签
  labels: {
    target: string;
    weapon: string;
  };
  
  // 按钮文本
  buttons: {
    removeAllTargets: string;
  };
  
  // 通用文本
  common: {
    noFiringSolution: string;
    checkTooltips: string;
    gitlab: string;
    language: string;
  };
}

// 语言包类型
export type LanguagePack = TranslationKeys;