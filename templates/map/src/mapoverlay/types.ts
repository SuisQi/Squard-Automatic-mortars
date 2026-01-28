/**
 * 地图贴图模块类型定义
 */

/**
 * 地图贴图状态
 */
export interface MapOverlayState {
    /** 是否启用贴图显示 */
    enabled: boolean;
    /** 3x3 透视变换矩阵 (行优先) */
    homography: number[][] | null;
    /** 截图在底图上的四角坐标 [左上, 右上, 右下, 左下] */
    corners: [number, number][] | null;
    /** 截图原始尺寸 [宽, 高] */
    screenshotSize: [number, number] | null;
    /** 截图 Image 对象 */
    screenshotImage: HTMLImageElement | null;
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
 * 后端发送的贴图数据
 */
export interface MapOverlayPayload {
    /** 3x3 透视变换矩阵 */
    homography: number[][];
    /** 截图在底图上的四角坐标 */
    corners: [number, number][];
    /** 截图尺寸 */
    screenshotSize: [number, number];
    /** 匹配点数量 */
    matchCount: number;
    /** RANSAC 内点数 */
    inliers: number;
    /** Base64 编码的截图 (不含 data:image/jpeg;base64, 前缀) */
    screenshotBase64: string;
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
        homography: number[][];
        corners: [number, number][];
        screenshotSize: [number, number];
        screenshotImage: HTMLImageElement;
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
