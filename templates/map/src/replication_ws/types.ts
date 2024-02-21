import { Component, ComponentKey, EntityId, SerializableComponents } from '../world/types';


export const newSession = () => ({
  sessionId: "",
  userId: "",
  users: new Map<string, User>(),
})
export type Session =  {
  sessionId: string;
  userId: User["id"];
  users: Map<string, User>;
};

export const newReplicationState = () => ({
  connectionState: "closed",
  sessionId: null,
})
export type ConnectionState = "closed" | "connecting" | "open"
export type ReplicationState = {
  sessionId: string | null;
  connectionState: ConnectionState;
};

export enum ReplicationActionType {
  creatingSession = "REPLICATION_CREATING_SESSION",
  connectionReady = "REPLICATION_CONNECTION_READY",
  connectionClosed = "REPLICATION_CONNECTION_CLOSED",
  connectionError = "REPLICATION_CONNECTION_ERROR",
  receiveMessage = "REPLICATION_RECEIVE_MESSAGE",
  sendPing = "REPLICATION_SEND_PING",
  noop = "REPLICATION_NOOP",
};

// primarily requests
export type ReplicationAction 
  = {type: ReplicationActionType.creatingSession, payload: {sessionId: string}}
  | {type: ReplicationActionType.connectionReady, payload: {sessionId: string}}
  | {type: ReplicationActionType.connectionClosed, payload: {sessionId: string}}
  | {type: ReplicationActionType.connectionError, payload: {sessionId: string}}
  | {type: ReplicationActionType.receiveMessage, payload: {message: ReplicationMessage, sessionId: string}}
  | {type: ReplicationActionType.noop, payload: {}}


export enum SessionActionType {
  create = "SESSION_CREATE",
  started = "SESSION_STARTED",
  ended = "SESSION_ENDED",
  join = "SESSION_JOIN",
  leave = "SESSION_LEAVE",
  addUser = "SESSION_ADD_USER",
  removeUser = "SESSION_REMOVE_USER",
  changeUserName = "SESSION_CHANGE_USER_NAME",
  userNameChanged = "SESSION_USER_NAME_CHANGED",
  sendMessage = "REPLICATION_SEND_MESSAGE",
};

export type SessionAction 
  = {type: SessionActionType.create, payload: {serverAddress: string, serializableState:  {[k in ComponentKey]: Array<[EntityId, Component]>}}} //}
  | {type: SessionActionType.started, payload: {sessionId: string, userId: string, users: Array<User>}}
  | {type: SessionActionType.ended, payload: {sessionId: Session["sessionId"]}}
  | {type: SessionActionType.join, payload: {serverAddress: string, sessionId: Session["sessionId"]}}
  | {type: SessionActionType.leave, payload: {}}
  | {type: SessionActionType.addUser, payload: {user: User}}
  | {type: SessionActionType.removeUser, payload: {userId: User["id"]}}
  | {type: SessionActionType.changeUserName, payload: {newName: string}}
  | {type: SessionActionType.userNameChanged, payload: {userId:  User["id"], newName: string}}
  | {type: SessionActionType.sendMessage, payload: {message: any, userId: string}}


export type User = {
  id: string,
  name: string
}
export const newUser = (id: string, name: string) => ({
  id,
  name
})

// this has different naming than redux messages to retain some sanity while inspecting logs
export type ReplicationMessage = 
    {command: ReplicationMessageType.action, payload: any}
  // | {command: ReplicationMessageType.created, payload: SessionPayload}
  | {command: ReplicationMessageType.joined, payload: SessionPayload}
  | {command: ReplicationMessageType.userJoined, payload: User}
  | {command: ReplicationMessageType.userLeft, payload: {userId: User["id"]}}
  | {command: ReplicationMessageType.userChangedName, payload: {userId: User["id"], name:string }}

export type SessionPayload = {
  sessionId: string, 
  userId: string, 
  users: Array<User>,
  state: SerializableComponents
}

export enum ReplicationMessageType {
  action = "ACTION",
  //created = "CREATED", // server does not tell you that
  joined = "JOINED",
  userJoined = "USER_JOINED",
  userLeft = "USER_LEFT",
  userChangedName = "USER_CHANGED_NAME",
}

export enum ClientRequestType {
  action = "ACTION",
  create = "CREATE",
  join = "JOIN",
  ping = "PING",
  changeName = "CHANGE_NAME",
  leave = "LEAVE"
}

export type SessionTagged<V> = {
  sessionId: string;
  value: V;
}