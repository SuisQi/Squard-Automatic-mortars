import { StoreAction } from "../store";
import { SerializableComponents } from "../world/types";
import { WorkerInput, WorkerOutput } from "./connection";
import {ReplicationActionType as RAT, SessionActionType as SAT, ReplicationMessage, ReplicationMessageType} from "./types";
import * as WS from "./websocketPrimitives";

//console.log("webworker running")

let ws: WebSocket | null = null;
let sessionId: string | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let wsClosed: boolean = false;


// Worker 'IO'
onmessage = (e: {data: WorkerInput}) => {
  let message = e.data;
  switch (message.func){
    case "CREATE":
      ws = create(message.payload.serverAddress, message.payload.serializableState);
      return null;
    case "JOIN":
      ws = join(message.payload.serverAddress, message.payload.sessionId);
      return null;
    case "CHANGE_NAME":
      if(ws && sessionId) WS.changeName(ws, message.payload.newName);
      return null;
    case "TERMINATE":
      if(ws) terminate(ws);
      return null;
    case "SEND":
      if(ws && sessionId) WS.send(ws, message.payload.message);
    default:
      return null;
  }
}

const sendToMain = (message: WorkerOutput) => {
  postMessage(message);
}
const dispatch = (action: StoreAction) => {
  sendToMain({event: "DISPATCH", payload: {action}})
}

// Connection setup
const constructor = (serverAddress: string): WebSocket => {
  let ws = new WebSocket(serverAddress);
  ws.onmessage = (ev: MessageEvent) => onMessage(ev)
  ws.onclose = (ev: CloseEvent) => onClose(ev)
  ws.onerror = (ev: Event) => onError(ev)
  return ws
}

const create = (serverAddress: string, serializableState: SerializableComponents): WebSocket => {
  let ws = constructor(serverAddress)
  startPingTimer(ws);
  ws.onopen = (ev: Event) => {
    WS.createSession(ws, serializableState);
  };
  return ws;
}

const join = (serverAddress: string, sessionId: string): WebSocket => {
  let ws = constructor(serverAddress);
  startPingTimer(ws);
  ws.onopen = (ev: Event) => {
    WS.joinSession(ws, sessionId);
  };
  return ws;
}

const startPingTimer = (ws: WebSocket) => {
  pingTimer = setInterval(() => { 
      WS.sendPing(ws);
  }, 1000);
}

// teardown
const terminate = (ws: WebSocket) => {
  wsClosed = true;
  sessionId = null;
  if (pingTimer !== null) clearInterval(pingTimer);
  try{
    WS.leaveSession(ws)
    ws.close();
  } catch(error){
    // nothing to do here.
  }
}

// Websocket behavior
const onMessage = (ev: MessageEvent) => {
  let message: ReplicationMessage = JSON.parse(ev.data);
  if (message.command == ReplicationMessageType.joined){
    sessionId = message.payload.sessionId;
    sendToMain({event: "SESSION_ID", payload: message.payload});
  }
  if (sessionId !== null) {
    dispatch({type: RAT.receiveMessage, payload: {message, sessionId: sessionId}});
  }
}
const onClose = (ev: CloseEvent) => {
  if (ws) terminate(ws);
  sendToMain({event: "CLOSE"})
}
const onError = (ev: Event) => {
  if (ws) terminate(ws);
  sendToMain({event: "ERROR"})
}

