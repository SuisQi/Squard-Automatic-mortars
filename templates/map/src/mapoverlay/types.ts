/**
 * 地图贴图模块类型定义
 */

/**
 * 地图贴图状态
 */
export interface MapOverlayState {
    /** 是否启用贴图显示 */
    enabled: boolean;
    /** 包围盒坐标 [minX, minY, maxX, maxY] (像素坐标) */
    bounds: [number, number, number, number] | null;
    /** 已透视变换的图像 */
    warpedImage: HTMLImageElement | null;
    /** 变换后图像尺寸 [宽, 高] */
    warpedSize: [number, number] | null;
    /** 贴图透明度 (0-1) */
    opacity: number;
    /** 匹配点数量 */
    matchCount: number;
    /** RANSAC 内点数 */
    inliers: number;
    /** 上次更新时间戳 */
    lastUpdateTime: number;
}

/**
 * 后端发送的贴图数据 (新格式 - 已透视变换)
 */
export interface MapOverlayPayload {
    /** 包围盒坐标 [minX, minY, maxX, maxY] (像素坐标) */
    bounds: [number, number, number, number];
    /** 已透视变换的图像 Base64 (JPEG) */
    warpedBase64: string;
    /** 变换后图像尺寸 [宽, 高] */
    warpedSize: [number, number];
    /** 匹配点数量 */
    matchCount: number;
    /** RANSAC 内点数 */
    inliers: number;
}

/**
 * Action 类型枚举
 */
export enum MapOverlayActionType {
    SET_OVERLAY = 'MAP_OVERLAY_SET',
    CLEAR_OVERLAY = 'MAP_OVERLAY_CLEAR',
    SET_OPACITY = 'MAP_OVERLAY_SET_OPACITY',
    TOGGLE_ENABLED = 'MAP_OVERLAY_TOGGLE'
}

/**
 * SET_OVERLAY Action
 */
export interface SetOverlayAction {
    type: MapOverlayActionType.SET_OVERLAY;
    payload: {
        bounds: [number, number, number, number];
        warpedImage: HTMLImageElement;
        warpedSize: [number, number];
        matchCount: number;
        inliers: number;
    };
}

/**
 * CLEAR_OVERLAY Action
 */
export interface ClearOverlayAction {
    type: MapOverlayActionType.CLEAR_OVERLAY;
}

/**
 * SET_OPACITY Action
 */
export interface SetOpacityAction {
    type: MapOverlayActionType.SET_OPACITY;
    payload: number;
}

/**
 * TOGGLE_ENABLED Action
 */
export interface ToggleEnabledAction {
    type: MapOverlayActionType.TOGGLE_ENABLED;
}

export type MapOverlayAction =
    | SetOverlayAction
    | ClearOverlayAction
    | SetOpacityAction
    | ToggleEnabledAction;
