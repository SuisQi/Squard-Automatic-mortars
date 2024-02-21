import { SerializableComponents } from "../world/types";
import {ReplicationActionType as RAT, SessionActionType as SAT, newUser, ReplicationMessage, User, ReplicationMessageType} from "./types"


export class Connection {
  sessionId: string | null = null;
  wsClosed: boolean = false;
  dispatch: Function;
  worker: Worker;
  
  constructor(dispatch: Function, serverAddress: string) {
    this.dispatch = dispatch;
    this.worker = new Worker(new URL('./connectionWorker.ts', import.meta.url));
    this.worker.onmessage = (e: any) => this.onWorkerMessage(e.data)
  }

  public static create(dispatch: Function, serverAddress: string, serializableState: SerializableComponents): Connection {
    let conn = new Connection(dispatch, serverAddress)
    conn.sendToWorker({func: "CREATE", payload: {serverAddress, serializableState}})
    return conn;
  }

  public static join(dispatch: Function, serverAddress: string, sessionId: string): Connection {
    let conn = new Connection(dispatch, serverAddress)
    conn.sendToWorker({func: "JOIN", payload: {serverAddress, sessionId}})
    return conn;
  }

  // connection events
  private onWorkerMessage(message: WorkerOutput){
    switch (message.event){
      case "DISPATCH":
        this.dispatch(message.payload.action);
        return;
      case "SESSION_ID":
        this.sessionId = message.payload.sessionId;
        return;
      case "CLOSE":
        this.dispatch({type: SAT.ended, payload: {sessionId: this.sessionId}})
        this.terminate();
        return null;
      case "ERROR":
        this.dispatch({type: SAT.ended, payload: {sessionId: this.sessionId}})
        this.terminate();
        return null;
      default:
        return null;
    }
  }

  // api
  changeName(newName: string){
    if (this.sessionId !== null){
      this.sendToWorker({func: "CHANGE_NAME", payload: {newName}})
    }
  }
  terminate(){
    this.wsClosed = true;
    this.sessionId = null;
    this.worker.terminate();
      // nothing to do here.
  }
  send(message: ReplicationMessage){
    if (this.sessionId !== null){
      this.sendToWorker({func: "SEND", payload: {message}})
    }
  }

  sendToWorker(message: WorkerInput){
    if(window.Worker){
      this.worker.postMessage(message);
    }
  }

}


export type WorkerInput  
  = {func: "CREATE", payload: {serverAddress: string, serializableState: SerializableComponents}}
  | {func: "JOIN", payload: {serverAddress: string, sessionId: string}}
  | {func: "CHANGE_NAME", payload: {newName: string}}
  | {func: "SEND", payload: {message: any}}
  | {func: "TERMINATE"}

export type WorkerOutput
  = {event: "CLOSE"}
  | {event: "ERROR"}
  | {event: "SESSION_ID", payload: {sessionId: string}}
  | {event: "DISPATCH", payload: {action: any}}
