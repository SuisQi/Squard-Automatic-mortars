/**
 * 网格系统常量
 * 定义Squad游戏中的网格间距相关参数
 *
 * 注意：这些值现在从地图配置中动态获取，每个地图可以有不同的网格间距
 */

import { maps } from '../common/mapData';

/**
 * 从用户设置或地图配置获取网格间距
 * @param mapId 地图ID
 * @param userGridSpacing 用户设置的网格间距（可选），如果提供则优先使用
 * @returns 网格间距常量对象
 */
export function getGridConstants(mapId: string, userGridSpacing?: number) {
  // 优先使用用户设置的值
  let gridSpacing: number;

  if (userGridSpacing !== undefined && userGridSpacing > 0) {
    gridSpacing = userGridSpacing;
  } else {
    // 否则从地图配置获取
    const mapConfig = maps[mapId];
    if (!mapConfig) {
      console.warn(`未找到地图配置: ${mapId}，使用默认值`);
      return getDefaultGridConstants();
    }
    gridSpacing = mapConfig.grid_spacing || 10000 / 3;
  }

  return {
    /**
     * 基础网格间距（游戏单位）
     * 对应Squad游戏中的keypad小格（sub-keypad）
     */
    GRID_SPACING: gridSpacing,

    /**
     * 大网格间距（游戏单位）
     * 对应Squad游戏中的主keypad格
     * 等于 GRID_SPACING * 3，保持3x3结构
     */
    LARGE_GRID_SPACING: gridSpacing * 3,

    /**
     * 超大网格间距（游戏单位）
     * 对应Squad游戏中的象限
     * 等于 LARGE_GRID_SPACING * 3，保持3x3结构
     */
    QUADRANT_SIZE: gridSpacing * 3 * 3
  };
}

/**
 * 获取默认网格常量
 */
export function getDefaultGridConstants() {
  const defaultGridSpacing = 10000 / 3;
  return {
    GRID_SPACING: defaultGridSpacing,
    LARGE_GRID_SPACING: defaultGridSpacing * 3,
    QUADRANT_SIZE: defaultGridSpacing * 3 * 3
  };
}

// 导出默认值（向后兼容）
const defaultConstants = getDefaultGridConstants();
export const GRID_SPACING = defaultConstants.GRID_SPACING;
export const LARGE_GRID_SPACING = defaultConstants.LARGE_GRID_SPACING;
export const QUADRANT_SIZE = defaultConstants.QUADRANT_SIZE;
