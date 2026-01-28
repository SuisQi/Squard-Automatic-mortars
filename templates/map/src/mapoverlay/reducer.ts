/**
 * 地图贴图状态管理 Reducer
 */
import {
    MapOverlayState,
    MapOverlayAction,
    MapOverlayActionType
} from './types';

/**
 * 默认状态
 */
export const defaultMapOverlayState: MapOverlayState = {
    enabled: true,
    bounds: null,
    warpedImage: null,
    warpedSize: null,
    opacity: 0.8,
    matchCount: 0,
    inliers: 0,
    lastUpdateTime: 0
};

/**
 * MapOverlay Reducer
 */
export const mapOverlayReducer = (
    state: MapOverlayState = defaultMapOverlayState,
    action: MapOverlayAction
): MapOverlayState => {
    switch (action.type) {
        case MapOverlayActionType.SET_OVERLAY:
            return {
                ...state,
                bounds: action.payload.bounds,
                warpedImage: action.payload.warpedImage,
                warpedSize: action.payload.warpedSize,
                matchCount: action.payload.matchCount,
                inliers: action.payload.inliers,
                lastUpdateTime: Date.now()
            };

        case MapOverlayActionType.CLEAR_OVERLAY:
            return {
                ...state,
                bounds: null,
                warpedImage: null,
                warpedSize: null,
                matchCount: 0,
                inliers: 0
            };

        case MapOverlayActionType.SET_OPACITY:
            return {
                ...state,
                opacity: Math.max(0, Math.min(1, action.payload))
            };

        case MapOverlayActionType.TOGGLE_ENABLED:
            return {
                ...state,
                enabled: !state.enabled
            };

        default:
            return state;
    }
};
