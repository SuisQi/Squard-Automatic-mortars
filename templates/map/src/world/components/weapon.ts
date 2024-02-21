import produce from "immer";
import { StoreAction } from "../../store";
import { Components, EntityId, WeaponActionType } from "../types";
import { SetAction } from "./types"

const newWeaponComponent = (weaponType: WeaponType, isActive: boolean): WeaponComponent => ({
    weaponType,
    isActive,
    heightOverGround: 0,
  })

export const tryNewWeaponComponent = (components: Components, action: SetAction) => {
  if (action.payload.entityType === "Weapon"){
    return newWeaponComponent("standardMortar", components.weapon.size === 0 ? true : false);
  }
  return null
}

export type WeaponComponent = { 
  weaponType: WeaponType; 
  isActive: boolean;
  heightOverGround: number;
}
export type WeaponType = "standardMortar" | "technicalMortar" | "ub32" | "hellCannon" | "bm21"

type State = Map<EntityId, WeaponComponent>;
export const weaponReducer: (state: State, action: StoreAction) => State = 
  (state, action) => {
    if (state === undefined){
      return new Map();
    }
    switch(action.type){
      case WeaponActionType.setActive:
        return produce(state, (draft: State) => {
          let weapon = draft.get(action.payload.entityId) 
          if (weapon){
            weapon.isActive = action.payload.newState;
          }
        })
      case WeaponActionType.toggleActive:
        return produce(state, (draft: State) => {
          let weapon = draft.get(action.payload.entityId) 
          if (weapon){
            weapon.isActive = !weapon.isActive;
          }
        })
      case WeaponActionType.pickActive:
        return produce(state, (draft: State) => {
          draft.forEach((value: WeaponComponent, key: EntityId) => {
            value.isActive = key === action.payload.entityId ? true : false;
          })
        })
      case WeaponActionType.setHeightOverGround:
        return produce(state, (draft: State) => {
          draft.forEach((value: WeaponComponent, key: EntityId) => {
            value.heightOverGround = action.payload.newHeight;
          })
        })
      default:
        return state;
    }
  }

