import {
  newSession,
  newUser,
  ReplicationActionType as RAT,
  ReplicationMessage,
  ReplicationMessageType, Session,
  SessionActionType as SAT
} from "./types"
import {actionMessage, addUser, removeUser, sessionStarted, userChangedName} from "./actions";
import {EntityActionType, EntityId, HasTransform, TransformActionType} from "../world/types";
import {MinimapActionType} from "../minimap/types";
import {UserSettingsActionType} from "../ui/types";
import {Store0, StoreAction, StoreState} from "../store";
import {DirDataActionType, IconActionType, moveEntityTo, setAllEntities} from "../world/actions";
import {mat4, vec3} from "gl-matrix";
import {getComponent} from "../world/world";
import {Connection} from "./connection";
import {notification} from "antd";
import produce from "immer";
import {remove_all} from "../api/standard";


let $connection: Connection | null = null; // the alternative is creating an "app state" and having "resources"... If that becomes necessary, it will be added.

// listen on SAT, do stuff, pass on SAT
export const replicationMiddleware = (store: any) => (next:any) => (action: any) => {
  const replacementAction = handler(store, action);
  return next(replacementAction || action);
}

//  - preventing circles is a dev responsibility.
//    in general: return or dispatch, but not both.
//  - side effects go here...
const handler = (store: Store0, action: StoreAction) => {
  const dispatch = store.dispatch

  switch(action.type){
    case SAT.create:
      // debugger
      resetTaintlog();
      if($connection) $connection.terminate();
      $connection = Connection.create(dispatch, action.payload.serverAddress, action.payload.serializableState);
      return null;
    case SAT.join:
      resetTaintlog();
      if($connection) $connection.terminate();
      $connection = Connection.join(dispatch, action.payload.serverAddress, action.payload.sessionId);
      return null;
    case SAT.leave:
      resetTaintlog();
      if($connection) $connection.terminate();
      return null
    case SAT.changeUserName:
        resetTaintlog();
        if($connection) $connection.changeName(action.payload.newName);
        return null;
    case RAT.receiveMessage:
      //console.log("receiveMessage", action.payload.message)
      return handleServerMessage(dispatch, action.payload.message);

    case TransformActionType.moveBy:
    case TransformActionType.moveTo:
      if($connection) taint($connection, action.payload.entityId, store.getState, dispatch);
      return null;
    case EntityActionType.add:
      if (!store.getState().session){ // this leaves a sync gap when server is slow to create session.
        return null;
      } else {
        $connection?.send(actionMessage(action))
        return null;
      }
    case IconActionType.remove:
    case IconActionType.add:
      if(!store.getState().session)
        return null
      $connection?.send(actionMessage(action))
      return null
    case IconActionType.remove_all:
    case EntityActionType.removeAllTargets:
    // case EntityActionType.selectAdd:
    // case EntityActionType.selectUpdate:
    // case EntityActionType.selectRemove:
    case DirDataActionType.add:
    case DirDataActionType.update:
    case DirDataActionType.remove:
    case EntityActionType.remove:
      if (!store.getState().session){
        return null;
      } else {
        $connection?.send(actionMessage(action))
        return null;
      }
    case MinimapActionType.set:
    case UserSettingsActionType.write:
      return null;
    default:
      return null;
  }
}

const handleServerMessage = (dispatch: Function, message: ReplicationMessage) => {
  // the RAT -> SAT mapping might seem redundant, but helps keeping a separation between network protocol and UI state(redux) protocol
  switch (message.command) {
    case ReplicationMessageType.action:
      return message.payload
    case ReplicationMessageType.joined:
      remove_all().then(()=>{
        dispatch(setAllEntities(message.payload.state))
        dispatch(sessionStarted(message.payload.sessionId, message.payload.userId,  message.payload.users));
      })

      return null
    case ReplicationMessageType.userJoined:
      dispatch(addUser(newUser(message.payload.id, message.payload.name)));
      return null
    case ReplicationMessageType.userChangedName:
      dispatch(userChangedName(message.payload.userId, message.payload.name))
      return null
    case ReplicationMessageType.userLeft:
      dispatch(removeUser(message.payload.userId));
      return null
    case ReplicationMessageType.error:
      notification.error({
        message: '警告',
        description: message.payload.msg,
      });
      return null
    default:
      return null
  }
}


const sendEntityUpdates = (conn: Connection, getState: () => StoreState, dispatch: Function): void => {
  const world = getState().world;
  for (const entityId of taintlog.taintedEntityIds.values()){
    const maybeTransform = getComponent<HasTransform>(world, entityId, "transform")?.transform
    if (maybeTransform) {
      let action = moveEntityTo(entityId, mat4.getTranslation(vec3.create(), maybeTransform));
      conn.send(actionMessage(action));
    }
  }
}

const newTaintlog = () => ({
  clearF: sendEntityUpdates,
  tainted: false,
  updateTime: 300,
  timer: null as ReturnType<typeof setTimeout> | null,
  taintedEntityIds: new Set<EntityId>(),
})
let taintlog = newTaintlog();
const resetTaintlog = () => {
  if (taintlog.timer) clearTimeout(taintlog.timer);
  taintlog = newTaintlog();
}
const taint = (conn: Connection, entityId: EntityId, getState: () => StoreState, dispatch: Function) => {
  if (!taintlog.tainted) {
    taintlog.tainted = true;
    taintlog.timer = setTimeout(() => {
      taintlog.clearF(conn, getState, dispatch);
      taintlog.tainted = false;
    }, taintlog.updateTime);
  }
  taintlog.taintedEntityIds.add(entityId);
}
