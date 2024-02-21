import { serializableComponents } from '../world/components/components';
import { World } from '../world/types';
import {SessionActionType, SessionAction, Session, User, ReplicationAction, ReplicationActionType, ReplicationMessage, ReplicationMessageType } from './types';

export const createSession = (serverAddress: string, world: World): SessionAction => 
  ({type: SessionActionType.create, payload: {serverAddress, serializableState: serializableComponents(world.components)}});

export const sessionStarted: (sessionId: Session["sessionId"], userId: Session["userId"], users: Array<User>) => SessionAction = 
  (sessionId, userId, users) => ({type: SessionActionType.started, payload: {sessionId, userId, users}});

export const addUser: (user: User) => SessionAction = 
  (user) => ({type: SessionActionType.addUser, payload: {user}})

export const removeUser: (userId: User["id"]) => SessionAction = 
  (userId) => ({type: SessionActionType.removeUser, payload: {userId}})

export const changeUserName = (newName: string): SessionAction =>
  ({type: SessionActionType.changeUserName, payload: {newName}})

export const userChangedName = (userId: User["id"], newName: string): SessionAction =>
  ({type: SessionActionType.userNameChanged, payload: {userId, newName}})

export const join: (serverAddress: string, sessionId: Session["sessionId"]) => SessionAction = 
  (serverAddress, sessionId) => ({type: SessionActionType.join, payload: {serverAddress, sessionId}});

export const sendMessage: (userId: any, message: any) => SessionAction =
  (userId, message) => ({type: SessionActionType.sendMessage, payload: {userId, message}})

  export const leave: () => SessionAction =
  () => ({type: SessionActionType.leave, payload: {}})

export const actionMessage: (action: any) => ReplicationMessage = 
  (action) => ({command: ReplicationMessageType.action, payload: action}) 

export const noop: () => ReplicationAction = () => ({type: ReplicationActionType.noop, payload: {}});