import {mat4, vec3} from "gl-matrix";
import {WeaponType} from "./components/weapon";
import {
    DirData,
    EntityAction,
    EntityActionType,
    EntityId, HasLocation, HasTransform,
    SerializableComponents,
    Target,
    TransformAction,
    TransformActionType,
    WeaponAction,
    WeaponActionType
} from "./types";
import {IconComponent} from "./components/icon";
import {DirDataComponent} from "./components/dirData";
import {SquareSelectionComponent} from "./components/selection";

export const downSquareSelection=(pos:vec3):SquareSelectionAction=>({
    type:SelectionActionType.SquareEndPos,
    payload:pos
})
export const upSquareSelection=(pos:vec3):SquareSelectionAction=>({
    type:SelectionActionType.SquareStartPos,
    payload:pos
})
export const setAllEntities = (components: SerializableComponents): EntityAction => ({
  type: EntityActionType.setAll,
  payload: {components}
})
export const removeEntity: (entityId: EntityId) => EntityAction =
(entityId) => ({
  type: EntityActionType.remove,
  payload: {entityId}
})

export const moveEntityBy: (entityId: EntityId, vector: vec3) => TransformAction =
(entityId, vector) => ({
  type: TransformActionType.moveBy,
  payload: {entityId, vector}
})

export const moveEntityTo: (entityId: EntityId, location: vec3) => TransformAction =
(entityId, location) => ({
  type: TransformActionType.moveTo,
  payload: {entityId, location}
})

// export const addSelected:(locations:vec3)=>EntityActionType=
//     (location)=>({
//         type:EntityActionType.add,
//         payload:{
//             location,
//             entityType:"Selected"
//         }
//     })
export const addSelected: (entity: Target) => EntityAction =
    (entity) => ({
        type: EntityActionType.selectAdd,
        payload: entity
    })



export const addTarget: (location: vec3,entityId:EntityId) => EntityAction =
  (location,entityId) => ({
    type: EntityActionType.add,
    payload: {location, entityType: "Target",entityId:entityId}
})

export const removeTarget: (entityId: EntityId) => EntityAction =
  (entityId) => ({
    type: EntityActionType.remove,
    payload: {entityId}
})
export const removeSelect:(entityId:EntityId)=>EntityAction=(entityId)=>({
    type:EntityActionType.selectRemove,
    payload:{entityId}
})
export const removeAllTargets: () => EntityAction =
  () => ({
    type: EntityActionType.removeAllTargets,
    payload: {}
})

export const addWeapon: (location: vec3, weaponType: WeaponType,entityId:EntityId) => EntityAction =
  (location, weaponType,entityId) => ({
    type: EntityActionType.add,
    payload: {location, entityType: "Weapon",entityId}
  })

export const setWeaponActive = (entityId: EntityId, newState: boolean): WeaponAction  => ({
    type: WeaponActionType.setActive,
    payload: {entityId, newState}
  })

export const toggleWeaponActive = (entityId: EntityId): WeaponAction  => ({
    type: WeaponActionType.toggleActive,
    payload: {entityId}
  })

export const pickActiveWeapon = (entityId: EntityId): WeaponAction  => ({
  type: WeaponActionType.pickActive,
  payload: {entityId}
})

export const setWeaponHeightOverGround = (entityId: EntityId, newHeight: number): WeaponAction  => ({
  type: WeaponActionType.setHeightOverGround,
  payload: {entityId, newHeight: newHeight * 100}
})

export const addCamera = (location: vec3,entityId:EntityId): EntityAction => ({
  type: EntityActionType.add,
  payload: {location, entityType: "Camera",entityId}
})

export const addDirData=(dirdata:DirData):DirDataAction=>({
    type:DirDataActionType.add,
    payload:dirdata
})
export const removeDirData=(dirdata:DirData):DirDataAction=>({
    type:DirDataActionType.remove,
    payload:dirdata
})
export const updateDirData=(dirdata:DirData):DirDataAction=>({
    type:DirDataActionType.update,
    payload:dirdata
})

export const leftDirData = ():DirDataAction=>({
    type:DirDataActionType.left,
    payload: {}
})
export enum IconActionType{
    add="ICON_ADD",
    remove="ICON_REMOVE",
    remove_all="ICON_REMOVE_ALL"
}

export enum SelectionActionType{
    add="SELECTION_ADD",
    SquareEndPos="SQUARE_END_POS",
    SquareStartPos="SQUARE_START_POS",
    LineStartPos="LINE_START_POS",
    LineEndtPos="LINE_END_POS",
    gap="SELECTION_GAP",
    gapX="SELECTION_Y",
    gapY="SELECTION_Y",
    gapXY="SELECTION_XY"
}
export type IconAction={
    type:IconActionType.add,payload:HasLocation&IconComponent
}|{
    type:IconActionType.remove,payload:EntityId
}|{type:IconActionType.remove_all}


export type SquareSelectionAction=
|{type:SelectionActionType.SquareEndPos,payload:vec3}
|{type:SelectionActionType.SquareStartPos,payload:vec3}
|{type:SelectionActionType.LineStartPos,payload:vec3}
|{type:SelectionActionType.LineEndtPos,payload:vec3}
|{type:SelectionActionType.gapX,payload:number}
|{type:SelectionActionType.gap,payload:number}
|{type:SelectionActionType.gapY,payload:number}
|{type:SelectionActionType.gapXY,payload:number}

export enum DirDataActionType {
    add="DIRDATA_ADD",
    remove="DIRDATA_REMOVE",
    update = "DIRDATA_UPDATE",
    left = "DIRDATA_LEFT"
}
export type DirDataAction={type:DirDataActionType.add,payload:DirDataComponent}
|{type:DirDataActionType.remove,payload:DirDataComponent}
|{type:DirDataActionType.update,payload:DirDataComponent}
|{type:DirDataActionType.left,payload:{}}
