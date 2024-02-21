import { StoreAction } from "../../store";
import { EntityId} from "../types";
import { SetAction } from "./types";

export const newEntity = (action: SetAction): EntityComponent => ({entityType: action.payload.entityType, entityId: action.payload.entityId,selected:false})

export type EntityType = "Camera" | "Weapon" | "Target"
export type EntityComponent = {entityType: EntityType, entityId: EntityId,selected:boolean}

type State = Map<EntityId, EntityComponent>;
export const entityReducer = (state: State, action: StoreAction) => {
  if (state === undefined){
    return new Map();
  }
  return state
}
