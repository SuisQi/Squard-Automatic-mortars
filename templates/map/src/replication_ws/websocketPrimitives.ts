import { Maybe } from "../common/types";
import { ClientRequestType, ReplicationMessage } from "../replication_ws/types";
import { SerializableComponents } from "../world/types";

/* for reference only
const newConnection = (
  uri: string, 
  onOpen: (ev: Event) => any, 
  onMessage: (ev: MessageEvent) => any, 
  onClose: (ev: CloseEvent) => any, 
  onError: (ev: Event) => any
): WebSocket => {
  let ws = new WebSocket(uri);
  ws.onopen = onOpen;
  ws.onmessage = (ev: MessageEvent): any => {
    //console.log("message: ", ev.data);
    onMessage(ev);
  };
  ws.onclose = (ev: CloseEvent): any => {
    onClose(ev);
  };
  ws.onerror = onError;
  return ws;
}
*/

export const send = (ws: WebSocket, message: ReplicationMessage): void => {
  ws.send(JSON.stringify(message));
}
export const sendPing = (ws: WebSocket): void => {
  //console.log("sending ping")
  ws.send(JSON.stringify({command: ClientRequestType.ping}));
}

export const createSession = (ws: WebSocket, serizableState: SerializableComponents): void => {
  ws.send(JSON.stringify({command: ClientRequestType.create, payload: {state: serizableState}}));
}

export const joinSession = (ws: WebSocket, sessionId: string): void => {
  ws.send(JSON.stringify({command: ClientRequestType.join, payload: {sessionId}}));
}

export const changeName = (ws: WebSocket, name: string): void => {
  ws.send(JSON.stringify({command: ClientRequestType.changeName, payload: {name}}));
}

export const leaveSession = (ws: WebSocket): void => {
  ws.send(JSON.stringify({command: ClientRequestType.leave}));
  ws.close();
}