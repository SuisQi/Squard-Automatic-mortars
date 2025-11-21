/**
 * 英文翻译
 */

import { LanguagePack } from '../types';
import { i18n } from '../i18n';

const enTranslations: LanguagePack = {
  maps: {
    albasrah: 'Al Basrah',
    anvil: 'Anvil',
    belaya: 'Belaya Pass',
    blackcoast: 'Black Coast',
    chora: 'Chora',
    fallujah: 'Fallujah',
    foolsroad: 'Fool\'s Road',
    goosebay: 'Goose Bay',
    gorodok: 'Gorodok',
    harju: 'Harju',
    jensensrange: 'Jensen\'s Range',
    kamdesh: 'Kamdesh Highlands',
    kohat: 'Kohat Toi',
    kokan: 'Kokan',
    logar: 'Logar Valley',
    lashkar: 'Lashkar Valley',
    manicouagan: 'Manicouagan',
    mestia: 'Mestia',
    mutaha: 'Mutaha',
    narva: 'Narva',
    skorpoFull: 'Skorpo',
    sumari: 'Sumari Bala',
    tallil: 'Tallil Outskirts',
    yehorivka: 'Yehorivka',
    sanxianislands: 'Sanxian Islands'
  },

  weapons: {
    standardMortar: 'Standard Mortar',
    M121: '120mm Mortar',
    technicalMortar: 'Technical Mortar',
    ub32: 'UB32/S5 Rockets',
    hellCannon: 'Hell Cannon',
    bm21: 'BM-21 Grad',
    MK19: 'MK19'
  },

  tooltips: {
    showMapGrid: 'Show map grid',
    gridSpacing: 'Grid spacing',
    showKeypadsWhileMovingWeapon: 'Show keypads while moving weapon',
    showKeypadLabelWhileMovingWeapon: 'Show keypad label while moving weapon',
    targetingGrid: 'Targeting grid: 5mil elevation arcs, 1° bearing lines',
    projectileSpread: 'Projectile spread',
    splashRadius: 'Splash radius for 100 and 25 damage',
    weaponTargetDistance: 'Weapon-target distance',
    compactTargetText: 'Compact target text: last three elevation digits',
    showKeypadsWhileMovingTarget: 'Show keypads while moving target',
    showKeypadLabelWhileMovingTarget: 'Show keypad label while moving target',
    fontSize: 'Font size',
    showExtraButtonsInCollapsedMode: 'Show extra buttons in collapsed mode',
    deleteItemsWithSingleClick: 'Delete items with single click/touch',
    placeTargetOrWeaponMarkers: 'Place target or weapon markers by default (shift + double click always places weapons)',
    showTerrainMap: 'Show terrain map',
    removeAllTargets: 'Remove all targets',
    activateThisWeapon: 'Activate only this weapon',
    activateDeactivateWeapon: 'Activate/deactivate weapon',
    weaponHeightOverGround: 'Weapon height over ground (tall buildings, bridges, ...)'
  },

  labels: {
    target: 'T',
    weapon: 'W'
  },

  buttons: {
    removeAllTargets: 'Remove all targets'
  },

  common: {
    noFiringSolution: 'No firing solution',
    checkTooltips: 'Check tooltips or the ReadMe on',
    gitlab: 'gitlab',
    language: 'Language:'
  }
};

// 注册英文语言包
i18n.registerLanguage('en', enTranslations);