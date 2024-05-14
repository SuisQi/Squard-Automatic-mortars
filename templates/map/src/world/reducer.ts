//import { EntityActionType, EntityRegistry } from './types';
//import { setEntity, removeEntity, updateEntity } from './world';
import produce from "immer"
import {Reducer} from 'redux';
import {StoreAction} from "../store";
import {
  componentsReducer,
  getFilteredEntityIds,
  insertComponentsBulkMut,
  maxEntityId,
  newComponents,
  removeComponents,
  removeComponentsMut,
  setComponentsFromActionMut
} from './components/components';
import {EntityComponent} from "./components/entity";
import {SetAction} from "./components/types";
import {EntityActionType, EntityId, World} from './types';
import {remove, remove_all, save, update} from "../api/standard";
import {DirDataActionType, IconActionType, SelectionActionType} from "./actions";
import {newTransform} from "./components/transform";
import {newIcon} from "./components/icon";
import {DirDataComponent} from "./components/dirData";
import {LineSelectionComponent, SquareSelectionComponent} from "./components/selection";


const newWorld = (): World => ({
  nextId: 0,
  components: newComponents(),
})

export const world: Reducer<World, StoreAction> = (state, action) => {
  /*
    this reducer intercepts entity actions which require modification of across components,
    passing on the rest to a bundle of component-specific reducers
  */


  if (state === undefined){
    return newWorld();
  }

  switch(action.type){
    case SelectionActionType.gapX:
      return produce(state,(proxy:World)=>{
        let square = proxy.components.selection.get(0);
        if(square){
          square = square as SquareSelectionComponent
          if(square.gapX+action.payload<=600)
            return
          square.gapX+=action.payload
        }
      })
    case SelectionActionType.gapY:
      return produce(state,(proxy:World)=>{
        let square = proxy.components.selection.get(0);
        if(square){
          square = square as SquareSelectionComponent
          if(square.gapY+action.payload<=600)
            return
          square.gapY+=action.payload
        }
      })
    case SelectionActionType.gapXY:
      return produce(state,(proxy:World)=>{

        let square = proxy.components.selection.get(0);

        if(square){
          square = square as SquareSelectionComponent
          if(square.gapX+action.payload<=600||square.gapY+action.payload<=600)
            return
          square.gapX+=action.payload
          square.gapY+=action.payload
        }
      })
    case SelectionActionType.gap:
      return produce(state,(proxy:World)=>{

        let line = proxy.components.selection.get(1);

        if(line){
          line = line as LineSelectionComponent
          if(line.gap+action.payload<=600)
            return
          line.gap+=action.payload
        }
      })

    case SelectionActionType.SquareEndPos:
      return produce(state,(proxy:World)=>{

        let square = proxy.components.selection.get(0);
        if(square){
          square = square as SquareSelectionComponent
          square.location=newTransform(action.payload)
        }
      })
    case SelectionActionType.SquareStartPos:
      return produce(state,(proxy:World)=>{

        let square = proxy.components.selection.get(0);
        if(square){
          square = square as SquareSelectionComponent
          let upTransform = newTransform(action.payload).transform
          let downTransform = square.location.transform
          square.w=upTransform[12]-downTransform[12]
          square.h=upTransform[13]-downTransform[13]

        }
      })

    case SelectionActionType.LineEndtPos:
      return produce(state,(proxy:World)=>{
        let line = proxy.components.selection.get(1)
        if(line){
          line = line as LineSelectionComponent
          line.endLocation=newTransform(action.payload)
        }
      })
    case SelectionActionType.LineStartPos:
      return produce(state,(proxy:World)=>{
        let line = proxy.components.selection.get(1)
        if(line){
          line = line as LineSelectionComponent
          line.startLocation=newTransform(action.payload)
        }
      })
    case DirDataActionType.add:
      return produce(state,(proxy:World)=>{
        save(action.payload)
        proxy.components.dirData.set(action.payload.entityId,action.payload)
      })
    case DirDataActionType.update:
      return produce(state,(proxy:World)=>{

        let oldDirData:DirDataComponent = proxy.components.dirData.get(action.payload.entityId) as DirDataComponent;

        update(oldDirData)
        proxy.components.dirData.set(action.payload.entityId,oldDirData)
      })
    case DirDataActionType.left:
      return produce(state,(proxy:World)=>{
        for (let value of proxy.components.dirData.values()) {

          value.userIds=["0"]
          update(value)
        }
      })
    case DirDataActionType.remove:
      return produce(state,(proxy:World)=>{
        let oldDirData:DirDataComponent = proxy.components.dirData.get(action.payload.entityId) as DirDataComponent;
        if(action.payload.userIds?.length===0){
          remove({
            entityId: action.payload.entityId,
          })
          proxy.components.dirData.delete(action.payload.entityId)
        }else {
          oldDirData.userIds=action.payload.userIds
          update(oldDirData)

        }
      })
    // icon
    case IconActionType.add:
      return produce(state,(proxy:World)=>{
        const newId = proxy.nextId;
        proxy.nextId = proxy.nextId + 1;
        proxy.components.transform.set(newId,newTransform(action.payload.location))
        let icon = newIcon({src: action.payload.src, entityId: newId})
        proxy.components.icon.set(newId,icon)



      })
    case IconActionType.remove:

      return produce(state,(proxy:World)=>{
        proxy.components.icon.delete(action.payload)
        proxy.components.transform.delete(action.payload)

      })
    case IconActionType.remove_all:
      return produce(state,(proxy:World)=>{
        proxy.components.icon.forEach(f=>{
          proxy.components.transform.delete(f.entityId)
        })
        proxy.components.icon.clear()
      })
    case EntityActionType.add:

      return produce(state, (proxy: World) => {
        const newId =action.payload.entityId;
        proxy.nextId = newId + 1;
        let setAction: SetAction = produce(action, (action: any) => {
          action.type = EntityActionType.set;
          action.payload["entityId"] = newId;
        }) as any;
        proxy.components = setComponentsFromActionMut(proxy.components, newId, setAction);
      })

    case EntityActionType.selectAdd:

      return produce(state,(proxy:World)=>{
        proxy.components.entity.forEach(f=>{
          if (f.entityId === action.payload.entityId) {
            f.selected=true
          }
        })

      })
    case EntityActionType.selectRemove:

      return produce(state,(proxy:World)=>{
        proxy.components.entity.forEach((f,key)=>{
          remove({
            entityId: action.payload.entityId,
          })
          if (f.entityId === action.payload.entityId) {
            f.selected=false
            proxy.components.dirData.delete(f.entityId)
          }
        })
      })
    case EntityActionType.set:
      return produce(state, (proxy: World) => {
        proxy.nextId = Math.max(action.payload.entityId + 1, proxy.nextId);
        proxy.components = setComponentsFromActionMut(proxy.components, action.payload.entityId, action);
      })

    case EntityActionType.setAll:
      return produce(state, (proxy: World) => {
        proxy.nextId = maxEntityId(action.payload.components) + 1;
        proxy.components = insertComponentsBulkMut(newComponents(), action.payload.components);

      })
    case EntityActionType.remove:

      return produce(state, (proxy: World) => {
        remove({
          entityId: action.payload.entityId,
        })
        proxy.components = removeComponents(proxy.components, action.payload.entityId);
        proxy.components.dirData.delete(action.payload.entityId)
      })
    // for more cases, should generalize selection via entityId to some (serializable) filter function
    case EntityActionType.removeAllTargets:
        const targetIds = getFilteredEntityIds(state.components, (e: EntityComponent) => e.entityType === "Target");


        return produce(state, (proxy: World) => {
          remove_all()
          targetIds.forEach((v: EntityId) => {
            removeComponentsMut(proxy.components, v)
          })
        });

    default:
      return produce(state, (proxy: World) => {
        proxy.components = componentsReducer(proxy.components, action);
      });
  }
}
