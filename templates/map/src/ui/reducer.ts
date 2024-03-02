import {
    UserSettings,
    UserSettingsActionType as USAT,
    IconToolActionType as IS,
    UIStateActionType as UIAT,
    UserSettingsAction,
    UIState,
    TouchInfo,
    UIStateAction,
    ICONToolState, IconToolAction,
} from './types';
import { basicReducer, newSingleActionReducer, immerUpdateTransition } from '../common/reducer';
import { vec3 } from 'gl-matrix';
import { Reducer } from 'redux';
import produce from 'immer';

const defaultUserSettings = (): UserSettings => ({
    mapId: "albasrah",
    mapGrid: true,
    contourmap: false,

    weaponType: "standardMortar",
    weaponPlacementHelper: false,
    weaponPlacementLabel: false,

    fontSize: 16,
    targetSpread: true,
    targetSplash: false,
    targetGrid: false,
    targetDistance: false,
    targetPlacementHelper: true,
    targetPlacementLabel: true,

    extraButtonsAlwaysShown: false,
    deleteMode: false,

    targetCompactMode: false,
    leftPanelCollapsed: false,
});


export const userSettings: Reducer<UserSettings, UserSettingsAction> = newSingleActionReducer(USAT.write, defaultUserSettings, immerUpdateTransition) as any;

const defaultUIState = (): UIState => ({
  dragEntityId: null,
  dragStartPosition: vec3.fromValues(0, 0, 0),
  mousePosition: vec3.fromValues(0, 0, 0),
  mouseDown: false,
  touches: new Map<any, TouchInfo>(),
  weaponCreationMode: false,
})

export const uiState: Reducer<UIState, UIStateAction> = basicReducer(defaultUIState, (state: UIState, action: any) => {
  switch (action.type) {
    case UIAT.write:
      return immerUpdateTransition(state, action.payload);
    case UIAT.updateTouch:
      return produce(state, (draft: UIState) => {
        draft.touches.set(action.payload.identifier, action.payload)
      })
    case UIAT.removeTouch:
      return produce(state, (draft: UIState) => {
        draft.touches.delete(action.payload.identifier)
      })
    default:
      return state

  }
}) as any;

const defaultIconToolState=():ICONToolState=>({
    display:false,
    x:0,
    y:0,
    c_name:"",
    location:vec3.fromValues(0,0,0)
})

export const iconToolState:Reducer<ICONToolState,IconToolAction> = newSingleActionReducer(IS.write,defaultIconToolState,immerUpdateTransition) as any;
