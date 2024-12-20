import produce from 'immer';
import {Reducer} from 'redux';
import {
    ConnectionState,
    newReplicationState,
    ReplicationAction,
    ReplicationActionType as RAT,
    ReplicationState,
    Session,
    SessionAction,
    SessionActionType as SAT,
    SessionActionType,
    User
} from './types';
import {dispatch} from "../store";
import {set_session_userId, set_sessionId} from "../api/standard";


// "replication" is an implementation detail here
export const replicationReducer = (state: ReplicationState, action: ReplicationAction) => {
    if (state === undefined) {
        return newReplicationState();
    }
    switch (action.type) {
        case RAT.creatingSession:
            return setConnectionState(state, "connecting")
        case RAT.connectionReady:
            return setConnectionState(state, "open")
        case RAT.connectionClosed:
            return setConnectionState(state, "closed")
        default:
            return state;
    }
}

// "session" is a feature, i.e. visible to UI/user
export const sessionReducer: Reducer<Session | null, SessionAction> = (state, action) => {
    if (state === undefined) {

        return null;
    }
    switch (action.type) {
        case SAT.started:
            let user_map = new Map<User["id"], User>(action.payload.users.map((u: User) => [u.id, u]));
            set_session_userId(action.payload.userId)
            set_sessionId(action.payload.sessionId)
            return {sessionId: action.payload.sessionId, userId: action.payload.userId, users: user_map}
        case SAT.ended:
          set_session_userId("0")
            return null
        case SAT.addUser:
            return state ? addUser(state, action.payload.user) : state;
        case SAT.userNameChanged:
            return state ? updateUserName(state, action.payload.userId, action.payload.newName) : state;
        case SAT.removeUser:
            return state ? removeUser(state, action.payload.userId) : state;
        case SessionActionType.leave:
            return null
        default:
            return state;
    }
}

const cleanupSession = (s: ReplicationState) => {

}

const setConnectionState = (state: ReplicationState, newValue: ConnectionState) => {
    return produce(state, (draft: ReplicationState) => {
        draft.connectionState = newValue
    })
}
const addUser = (state: Session, user: User) => {
    return produce(state, (draft: Session) => {
        draft.users.set(user.id, user)
    })
}
const removeUser = (state: Session, userId: User["id"]) => {
    return produce(state, (draft: Session) => {
        draft.users.delete(userId)
    })
}

const updateUserName = (state: Session, userId: User["id"], newName: string) => {
    return produce(state, (draft: Session) => {
        let maybeUser = draft.users.get(userId);
        if (maybeUser) {
            maybeUser.name = newName;
        }
    })
}
