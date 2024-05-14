import {vec3, mat4} from 'gl-matrix';
import {EntityComponent, EntityType} from './components/entity';
import {WeaponComponent, WeaponType} from './components/weapon';
import {IconComponent} from "./components/icon";
import {DirDataComponent} from "./components/dirData";
import {LineSelectionComponent, SelectionComponent, SquareSelectionComponent} from "./components/selection";

export type HasEntityId = { entityId: EntityId }
export type HasTransform = { transform: Transform }
export type Selected = {selected:boolean}
export type Transform = mat4 //HasLocation & HasRotation & HasScale;

export type HasLocation = { location: vec3 }
export type HasRotation = { rotation: vec3 }
export type HasScale = { scale: vec3 }
export type WorldArea = {}

export enum EntityActionType {
    add = "ENTITY_ADD",
    selectAdd = "SELECT_ADD",
    selectRemove = "SELECT_REMOVE",
    selectUpdate = "SELECT_UPDATE",
    set = "ENTITY_SET",
    setAll = "ENTITY_SET_ALL",
    remove = "ENTITY_REMOVE",
    removeAllTargets = "ENTITY_REMOVE_ALL_TARGETS",
}

export type EntityAction =
    { type: EntityActionType.add, payload: HasLocation & { entityType: EntityType }&{entityId:EntityId} }
    | { type: EntityActionType.set, payload: HasLocation & { entityType: EntityType, entityId: EntityId } }
    | { type: EntityActionType.setAll, payload: { components: SerializableComponents } }
    | { type: EntityActionType.remove, payload: HasEntityId }
    | { type: EntityActionType.selectRemove, payload: HasEntityId }
    | { type: EntityActionType.removeAllTargets, payload: {} }
    | { type: EntityActionType.selectAdd, payload: EntityComponent }
    | { type: EntityActionType.selectUpdate, payload: EntityComponent }



export enum TransformActionType {
    moveTo = "TRANSFORM_MOVE_TO",
    moveBy = "TRANSFORM_MOVE_BY"
}

export type TransformAction =
    { type: TransformActionType.moveTo, payload: { entityId: EntityId, location: vec3 } }
    | { type: TransformActionType.moveBy, payload: { entityId: EntityId, vector: vec3 } }

export type Component =
    HasTransform
    | WeaponComponent
    | EntityComponent
    | IconComponent
    |  DirDataComponent
    |SelectionComponent


export enum WeaponActionType {
    setActive = "WEAPON_SET_ACTIVE",
    toggleActive = "WEAPON_TOGGLE_ACTIVE",
    pickActive = "WEAPON_PICK_ACTIVE",
    setHeightOverGround = "WEAPON_SET_HEIGHT_OVER_GROUND",
    setWeaponType = "WEAPON_SET_TYPE",
}

export type WeaponAction =
    { type: WeaponActionType.setActive, payload: { entityId: EntityId, newState: boolean } }
    | { type: WeaponActionType.toggleActive, payload: { entityId: EntityId } }
    | { type: WeaponActionType.pickActive, payload: { entityId: EntityId } }
    | { type: WeaponActionType.setHeightOverGround, payload: { entityId: EntityId, newHeight: number } }
    | { type: WeaponActionType.setWeaponType, payload: { entityId: EntityId, newType: WeaponType } }

export type ComponentDefinition
    = { componentKey: "transform" } & HasTransform

export type Components = {
    transform: Map<EntityId, HasTransform>;
    weapon: Map<EntityId, WeaponComponent>;
    entity: Map<EntityId, EntityComponent>;
    icon: Map<EntityId, Icon>;
    dirData:Map<EntityId,DirData>
    selection:Map<EntityId,Selection>
}
export type ComponentKey = keyof Components
export type ComponentKeySet = Set<ComponentKey>

export type EntityId = number
export type World = {
    nextId: EntityId;
    components: Components
}

export type Target = EntityComponent & HasTransform &Selected
export type Weapon = EntityComponent & WeaponComponent & HasTransform
export type Icon = IconComponent &HasTransform
export type DirData = DirDataComponent
export type Selection =SquareSelectionComponent|LineSelectionComponent

export type SerializableComponents = { [k in ComponentKey]: Array<[EntityId, Component]> };
