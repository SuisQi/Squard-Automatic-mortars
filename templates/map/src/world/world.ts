import { mat4, vec3 } from "gl-matrix";
import produce from "immer"
import { Maybe } from "../common/types";
import { Store0 } from "../store";
import { UIState, UserSettings } from "../ui/types";
import { getFilteredEntityIds } from "./components/components";
import { EntityComponent, EntityType } from "./components/entity";
import { Component, ComponentKey, Components, EntityId, HasEntityId, HasLocation, HasTransform, Weapon, World, Target } from "./types";

/*
export const getEntitiesWithin = (world: World, worldLoc: vec3, radius: number): Array<HasEntityId & HasTransform> => {
  const entityInRange = (entity: HasTransform) => {
    const entityLoc = mat4.getTranslation(vec3.create(), entity.transform)
    return vec3.distance(worldLoc, entityLoc);
  }
  const allEntities = getEntitiesByEntityPredicate<Weapon | Target>(world, (entity: EntityComponent) => entity.entityType === "Weapon" || entity.entityType === "Target")
  //return allEntities.filter(entityInRange);
}
*/

export const getClosestEntity = (world: World, worldLoc: vec3, radius: number): Array<EntityComponent & HasTransform> => {
  let minDist = radius;
  let out: Array<EntityComponent & HasTransform> = [];
  const allEntities = getEntitiesByEntityPredicate<EntityComponent & HasTransform>(world, (entity: EntityComponent) => entity.entityType === "Weapon" || entity.entityType === "Target")
  allEntities.forEach(
    (entity: EntityComponent & HasTransform) => {
      const entityLoc = mat4.getTranslation(vec3.create(), entity.transform);
      const curDist = vec3.distance(worldLoc, entityLoc)
      if (curDist < minDist){
        minDist = curDist;
        out.push(entity)
      }
    })
  return out;
}

export const getEntity = <E>(world: World, entityId: EntityId): E | null =>  {
  // ^ this needs better type inference / a low maintenance type hack at some point
  // consider https://stackoverflow.com/questions/53662208/types-from-both-keys-and-values-of-object-in-typescript
  //          https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
  let components: Array<Component> = [];
  (Object.keys(world.components) as Array<ComponentKey>).forEach((componentKey: ComponentKey) => {
    const maybeComponent = world.components[componentKey].get(entityId)
    if(maybeComponent){
      components.push(maybeComponent);
    }
  })
  return Object.assign({}, ...components) as unknown as E;
}

export const getEntitiesByType = <E>(world: World, type: EntityType): Array<E> =>  {
  const entityIds = getFilteredEntityIds(world.components, (e: EntityComponent) => e.entityType === type);
  let out: Array<E> = [];
  entityIds.forEach((id: EntityId) => {
    const maybeEntity = getEntity<any>(world, id);
    if (maybeEntity) {
      out.push(maybeEntity)
    }
  })
  return out;
}

export const getEntitiesByEntityPredicate = <E>(world: World, predicate: (entity: EntityComponent) => boolean): Array<E> =>  {
  const entityIds = getFilteredEntityIds(world.components, (e: EntityComponent) => predicate(e));
  let out: Array<E> = [];
  entityIds.forEach((id: EntityId) => {
    const maybeEntity = getEntity<any>(world, id);
    if (maybeEntity) {
      out.push(maybeEntity)
    }
  })
  return out;
}

export const getComponent = <C>(world: World, entityId: EntityId, componentKey: ComponentKey): C | null =>  {
  // ^ this needs better type inference / a low maintenance type hack
  const maybeComponent = world.components[componentKey].get(entityId)
  return maybeComponent ? maybeComponent as unknown as C : null
}

export const canonicalEntitySort = (entities: Array<EntityComponent>): void => {
  entities.sort((a: EntityComponent, b: EntityComponent) => a.entityId - b.entityId);
}
