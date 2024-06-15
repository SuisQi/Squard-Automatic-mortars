import { combineReducers, Store, createStore, applyMiddleware, compose, CombinedState, StateFromReducersMapObject } from 'redux';
import {UserSettingsAction, UIStateAction, IconToolAction} from './ui/types';
import {userSettings, uiState, iconToolState, ImageReducer} from './ui/reducer';
import { MinimapAction } from './minimap/types';
import { minimap } from './minimap/reducer';
import { ContourmapAction } from './contourmap/types';
import { contourmap } from './contourmap/reducer';
//const thunk = require('redux-thunk').default
import { CameraAction } from './camera/types';
import { camera } from './camera/reducer';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import {ThunkAction} from 'redux-thunk';
import { world } from './world/reducer';
import { replicationMiddleware } from './replication_ws/middleware';
import { replicationReducer, sessionReducer } from './replication_ws/reducer';
import { ReplicationAction, SessionAction } from './replication_ws/types';
import { heightmap } from './heightmap/reducer';
import { EntityAction, TransformAction, WeaponAction } from './world/types';
import {DirDataAction, DirDataActionType, IconAction, IconActionType, SquareSelectionAction} from "./world/actions";
import {iconReducer} from "./world/components/icon";
import {terrainmap} from "./terrainmap/reducer";
import {TerrainmapAction} from "./terrainmap/types";

// https://github.com/reduxjs/redux-thunk/blob/master/test/typescript.ts
const reducerObject = {
  world,
  userSettings,
  iconToolState,
  uiState,
  minimap,
    terrainmap,
  contourmap,
  camera,
  counter: (state=0, action: any) => (action.type === "COUNTER_INCREMENT" ? state + 1 : state),
  //replication: replicationReducer,
  session: sessionReducer,
  heightmap,
    images:ImageReducer
}
//type StoreAction = ActionFromReducersMapObject<typeof reducerObject>
export type StoreAction
  = UserSettingsAction
  | UIStateAction
  | MinimapAction
    |TerrainmapAction
  | ContourmapAction
  | CameraAction
  | ReplicationAction
  | SessionAction
  //| ReplicationAction
    |IconAction
    |IconToolAction
  | EntityAction
  | TransformAction
  | WeaponAction
    |SquareSelectionAction
|DirDataAction



export type ThunkResult<R> = ThunkAction<R, any, undefined, StoreAction>;
export type StoreState = CombinedState<StateFromReducersMapObject<typeof reducerObject>>;
export type Store0 = Store<StoreState, StoreAction>

export const dispatch = (store: Store0, action: StoreAction | ThunkResult<any>) => store.dispatch(action as any);
const reducer = combineReducers(reducerObject);
const w = window as any;

export const newStore =
  () => {
    let devTools = process.env.NODE_ENV === "development" ? [w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__({serialize: true} /* needed to see content of Maps */)] : [];
      console.log(devTools)
    process.env.NODE_ENV === "development" ? console.log("NODE_ENV ", process.env.NODE_ENV) : null;
    return createStore(
    reducer,
    compose(
      applyMiddleware(
        thunk as ThunkMiddleware<any, StoreAction>, replicationMiddleware),
        ...devTools
    )
  )
}
