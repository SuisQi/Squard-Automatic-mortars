/**
 * 中文翻译
 */

import { LanguagePack } from '../types';
import { i18n } from '../i18n';

const zhTranslations: LanguagePack = {
  maps: {
    albasrah: '巴士拉',
    anvil: '铁砧行动',
    belaya: '贝拉亚关隘',
    blackcoast: '黑色海岸',
    chora: '乔拉',
    fallujah: '费卢杰',
    foolsroad: '愚者之路',
    goosebay: '鹅湾',
    gorodok: '格罗多克',
    harju: '哈留',
    jensensrange: '训练营',
    kamdesh: '卡姆德什高地',
    kohat: '科哈特',
    kokan: '寇坎',
    logar: '洛加尔山谷',
    lashkar: '拉什卡河谷',
    manicouagan: '曼尼古根',
    mestia: '梅斯蒂亚',
    mutaha: '穆塔哈',
    narva: '纳尔瓦',
    skorpoFull: '斯科普',
    sumari: '苏玛瑞',
    tallil: '塔利尔',
    yehorivka: '叶城',
    sanxianislands: '三仙岛'
  },

  weapons: {
    standardMortar: '标准迫击炮',
    M121: '120毫米迫击炮',
    technicalMortar: '技术型迫击炮',
    ub32: 'UB32火箭弹',
    hellCannon: '地狱火炮',
    bm21: 'BM-21火箭炮',
    MK19: 'MK19榴弹发射器'
  },

  tooltips: {
    showMapGrid: '显示地图网格',
    showKeypadsWhileMovingWeapon: '移动武器时显示坐标',
    showKeypadLabelWhileMovingWeapon: '移动武器时显示坐标标签',
    targetingGrid: '瞄准网格：5密位仰角弧线，1°方位线',
    projectileSpread: '弹丸散布',
    splashRadius: '100和25伤害爆炸半径',
    weaponTargetDistance: '武器-目标距离',
    compactTargetText: '紧凑目标文本：仰角最后三位数',
    showKeypadsWhileMovingTarget: '移动目标时显示坐标',
    showKeypadLabelWhileMovingTarget: '移动目标时显示坐标标签',
    fontSize: '字体大小',
    showExtraButtonsInCollapsedMode: '在折叠模式下显示额外按钮',
    deleteItemsWithSingleClick: '单击删除项目',
    placeTargetOrWeaponMarkers: '默认放置目标或武器标记（shift+双击总是放置武器）',
    showTerrainMap: '是否显示地形地图',
    removeAllTargets: '移除所有目标',
    activateThisWeapon: '仅激活此武器',
    activateDeactivateWeapon: '激活/取消 武器',
    weaponHeightOverGround: '武器离地高度（高楼、桥梁等）'
  },

  labels: {
    target: 'T',
    weapon: 'W'
  },

  buttons: {
    removeAllTargets: '移除所有目标'
  },

  common: {
    noFiringSolution: '无射击解算',
    checkTooltips: '查看工具提示或ReadMe在',
    gitlab: 'gitlab',
    language: '语言:'
  }
};

// 注册中文语言包
i18n.registerLanguage('zh', zhTranslations);