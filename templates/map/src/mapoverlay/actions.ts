/**
 * 地图贴图 Action Creators
 */
import {
    MapOverlayActionType,
    SetOverlayAction,
    ClearOverlayAction,
    SetOpacityAction,
    ToggleEnabledAction
} from './types';

/**
 * 设置贴图数据 (新格式 - 已透视变换)
 */
export const setMapOverlay = (payload: {
    bounds: [number, number, number, number];
    warpedImage: HTMLImageElement;
    warpedSize: [number, number];
    matchCount: number;
    inliers: number;
}): SetOverlayAction => ({
    type: MapOverlayActionType.SET_OVERLAY,
    payload
});

/**
 * 清除贴图
 */
export const clearMapOverlay = (): ClearOverlayAction => ({
    type: MapOverlayActionType.CLEAR_OVERLAY
});

/**
 * 设置透明度
 */
export const setMapOverlayOpacity = (opacity: number): SetOpacityAction => ({
    type: MapOverlayActionType.SET_OPACITY,
    payload: opacity
});

/**
 * 切换启用状态
 */
export const toggleMapOverlayEnabled = (): ToggleEnabledAction => ({
    type: MapOverlayActionType.TOGGLE_ENABLED
});
