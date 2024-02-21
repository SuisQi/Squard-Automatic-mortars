import {vec3} from "gl-matrix";
import {WeaponType} from "./components/weapon";
import {
    EntityAction,
    EntityActionType,
    EntityId,
    SerializableComponents,
    Target,
    TransformAction,
    TransformActionType,
    WeaponAction,
    WeaponActionType
} from "./types";


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



export const addTarget: (location: vec3) => EntityAction =
  (location) => ({
    type: EntityActionType.add,
    payload: {location, entityType: "Target"}
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

export const addWeapon: (location: vec3, weaponType: WeaponType) => EntityAction =
  (location, weaponType) => ({
    type: EntityActionType.add,
    payload: {location, entityType: "Weapon"}
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

export const addCamera = (location: vec3): EntityAction => ({
  type: EntityActionType.add,
  payload: {location, entityType: "Camera"}
})
