/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/replication_ws/types.ts":
/*!*************************************!*\
  !*** ./src/replication_ws/types.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClientRequestType: () => (/* binding */ ClientRequestType),
/* harmony export */   ReplicationActionType: () => (/* binding */ ReplicationActionType),
/* harmony export */   ReplicationMessageType: () => (/* binding */ ReplicationMessageType),
/* harmony export */   SessionActionType: () => (/* binding */ SessionActionType),
/* harmony export */   newReplicationState: () => (/* binding */ newReplicationState),
/* harmony export */   newSession: () => (/* binding */ newSession),
/* harmony export */   newUser: () => (/* binding */ newUser)
/* harmony export */ });
const newSession = () => ({
    sessionId: "",
    userId: "",
    users: new Map(),
});
const newReplicationState = () => ({
    connectionState: "closed",
    sessionId: null,
});
var ReplicationActionType;
(function (ReplicationActionType) {
    ReplicationActionType["creatingSession"] = "REPLICATION_CREATING_SESSION";
    ReplicationActionType["connectionReady"] = "REPLICATION_CONNECTION_READY";
    ReplicationActionType["connectionClosed"] = "REPLICATION_CONNECTION_CLOSED";
    ReplicationActionType["connectionError"] = "REPLICATION_CONNECTION_ERROR";
    ReplicationActionType["receiveMessage"] = "REPLICATION_RECEIVE_MESSAGE";
    ReplicationActionType["sendPing"] = "REPLICATION_SEND_PING";
    ReplicationActionType["noop"] = "REPLICATION_NOOP";
})(ReplicationActionType || (ReplicationActionType = {}));
;
var SessionActionType;
(function (SessionActionType) {
    SessionActionType["create"] = "SESSION_CREATE";
    SessionActionType["started"] = "SESSION_STARTED";
    SessionActionType["ended"] = "SESSION_ENDED";
    SessionActionType["join"] = "SESSION_JOIN";
    SessionActionType["leave"] = "SESSION_LEAVE";
    SessionActionType["addUser"] = "SESSION_ADD_USER";
    SessionActionType["removeUser"] = "SESSION_REMOVE_USER";
    SessionActionType["changeUserName"] = "SESSION_CHANGE_USER_NAME";
    SessionActionType["userNameChanged"] = "SESSION_USER_NAME_CHANGED";
    SessionActionType["sendMessage"] = "REPLICATION_SEND_MESSAGE";
})(SessionActionType || (SessionActionType = {}));
;
const newUser = (id, name) => ({
    id,
    name
});
var ReplicationMessageType;
(function (ReplicationMessageType) {
    ReplicationMessageType["action"] = "ACTION";
    //created = "CREATED", // server does not tell you that
    ReplicationMessageType["joined"] = "JOINED";
    ReplicationMessageType["userJoined"] = "USER_JOINED";
    ReplicationMessageType["userLeft"] = "USER_LEFT";
    ReplicationMessageType["userChangedName"] = "USER_CHANGED_NAME";
    ReplicationMessageType["error"] = "ERROR";
})(ReplicationMessageType || (ReplicationMessageType = {}));
var ClientRequestType;
(function (ClientRequestType) {
    ClientRequestType["action"] = "ACTION";
    ClientRequestType["create"] = "CREATE";
    ClientRequestType["join"] = "JOIN";
    ClientRequestType["ping"] = "PING";
    ClientRequestType["changeName"] = "CHANGE_NAME";
    ClientRequestType["leave"] = "LEAVE";
})(ClientRequestType || (ClientRequestType = {}));


/***/ }),

/***/ "./src/replication_ws/websocketPrimitives.ts":
/*!***************************************************!*\
  !*** ./src/replication_ws/websocketPrimitives.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   changeName: () => (/* binding */ changeName),
/* harmony export */   createSession: () => (/* binding */ createSession),
/* harmony export */   joinSession: () => (/* binding */ joinSession),
/* harmony export */   leaveSession: () => (/* binding */ leaveSession),
/* harmony export */   send: () => (/* binding */ send),
/* harmony export */   sendPing: () => (/* binding */ sendPing)
/* harmony export */ });
/* harmony import */ var _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../replication_ws/types */ "./src/replication_ws/types.ts");

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
const send = (ws, message) => {
    ws.send(JSON.stringify(message));
};
const sendPing = (ws) => {
    //console.log("sending ping")
    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.ping }));
};
const createSession = (ws, serizableState) => {
    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.create, payload: { state: serizableState } }));
};
const joinSession = (ws, sessionId) => {
    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.join, payload: { sessionId } }));
};
const changeName = (ws, name) => {
    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.changeName, payload: { name } }));
};
const leaveSession = (ws) => {
    ws.send(JSON.stringify({ command: _replication_ws_types__WEBPACK_IMPORTED_MODULE_0__.ClientRequestType.leave }));
    ws.close();
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************************************!*\
  !*** ./src/replication_ws/connectionWorker.ts ***!
  \************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/replication_ws/types.ts");
/* harmony import */ var _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./websocketPrimitives */ "./src/replication_ws/websocketPrimitives.ts");


//console.log("webworker running")
let ws = null;
let sessionId = null;
let pingTimer = null;
let wsClosed = false;
// Worker 'IO'
onmessage = (e) => {
    let message = e.data;
    switch (message.func) {
        case "CREATE":
            ws = create(message.payload.serverAddress, message.payload.serializableState);
            return null;
        case "JOIN":
            ws = join(message.payload.serverAddress, message.payload.sessionId);
            return null;
        case "CHANGE_NAME":
            if (ws && sessionId)
                _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.changeName(ws, message.payload.newName);
            return null;
        case "TERMINATE":
            if (ws)
                terminate(ws);
            return null;
        case "SEND":
            if (ws && sessionId)
                _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.send(ws, message.payload.message);
        default:
            return null;
    }
};
const sendToMain = (message) => {
    postMessage(message);
};
const dispatch = (action) => {
    sendToMain({ event: "DISPATCH", payload: { action } });
};
// Connection setup
const constructor = (serverAddress) => {
    let ws = new WebSocket(serverAddress);
    ws.onmessage = (ev) => onMessage(ev);
    ws.onclose = (ev) => onClose(ev);
    ws.onerror = (ev) => onError(ev);
    return ws;
};
const create = (serverAddress, serializableState) => {
    let ws = constructor(serverAddress);
    startPingTimer(ws);
    ws.onopen = (ev) => {
        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.createSession(ws, serializableState);
    };
    return ws;
};
const join = (serverAddress, sessionId) => {
    let ws = constructor(serverAddress);
    startPingTimer(ws);
    ws.onopen = (ev) => {
        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.joinSession(ws, sessionId);
    };
    return ws;
};
const startPingTimer = (ws) => {
    pingTimer = setInterval(() => {
        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.sendPing(ws);
    }, 1000);
};
// teardown
const terminate = (ws) => {
    wsClosed = true;
    sessionId = null;
    if (pingTimer !== null)
        clearInterval(pingTimer);
    try {
        _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__.leaveSession(ws);
        ws.close();
    }
    catch (error) {
        console.log(error);
        // nothing to do here.
    }
};
// Websocket behavior
const onMessage = (ev) => {
    let message = JSON.parse(ev.data);
    if (message.command == _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationMessageType.error) {
        dispatch({ type: _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationActionType.receiveMessage, payload: { message, sessionId: "" } });
    }
    if (message.command == _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationMessageType.joined) {
        sessionId = message.payload.sessionId;
        sendToMain({ event: "SESSION_ID", payload: message.payload });
    }
    if (sessionId !== null) {
        dispatch({ type: _types__WEBPACK_IMPORTED_MODULE_0__.ReplicationActionType.receiveMessage, payload: { message, sessionId: sessionId } });
    }
};
const onClose = (ev) => {
    if (ws)
        terminate(ws);
    sendToMain({ event: "CLOSE" });
};
const onError = (ev) => {
    if (ws)
        terminate(ws);
    sendToMain({ event: "ERROR" });
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlcGxpY2F0aW9uX3dzX2Nvbm5lY3Rpb25Xb3JrZXJfdHMuYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ007QUFDUDtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsc0RBQXNEO0FBQ3ZEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyw4Q0FBOEM7QUFDL0M7QUFDTztBQUNQO0FBQ0E7QUFDQSxDQUFDO0FBQ007QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyx3REFBd0Q7QUFDbEQ7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsOENBQThDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RGE7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ087QUFDUDtBQUNBLDZCQUE2QixTQUFTLG9FQUFpQixPQUFPO0FBQzlEO0FBQ087QUFDUCw2QkFBNkIsU0FBUyxvRUFBaUIsb0JBQW9CLHlCQUF5QjtBQUNwRztBQUNPO0FBQ1AsNkJBQTZCLFNBQVMsb0VBQWlCLGtCQUFrQixhQUFhO0FBQ3RGO0FBQ087QUFDUCw2QkFBNkIsU0FBUyxvRUFBaUIsd0JBQXdCLFFBQVE7QUFDdkY7QUFDTztBQUNQLDZCQUE2QixTQUFTLG9FQUFpQixRQUFRO0FBQy9EO0FBQ0E7Ozs7Ozs7VUN6Q0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7QUNOK0U7QUFDbkM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiw0REFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixzREFBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLDhCQUE4QixVQUFVO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSwrREFBZ0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDZEQUFjO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDBEQUFXO0FBQ25CLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4REFBZTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiwwREFBc0I7QUFDakQsbUJBQW1CLE1BQU0seURBQUcsNEJBQTRCLDBCQUEwQjtBQUNsRjtBQUNBLDJCQUEyQiwwREFBc0I7QUFDakQ7QUFDQSxxQkFBcUIsK0NBQStDO0FBQ3BFO0FBQ0E7QUFDQSxtQkFBbUIsTUFBTSx5REFBRyw0QkFBNEIsaUNBQWlDO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZ0JBQWdCO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLGdCQUFnQjtBQUNqQyIsInNvdXJjZXMiOlsid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3MvdHlwZXMudHMiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC8uL3NyYy9yZXBsaWNhdGlvbl93cy93ZWJzb2NrZXRQcmltaXRpdmVzLnRzIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlcGxpY2F0aW9uX3dzL2Nvbm5lY3Rpb25Xb3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IG5ld1Nlc3Npb24gPSAoKSA9PiAoe1xyXG4gICAgc2Vzc2lvbklkOiBcIlwiLFxyXG4gICAgdXNlcklkOiBcIlwiLFxyXG4gICAgdXNlcnM6IG5ldyBNYXAoKSxcclxufSk7XHJcbmV4cG9ydCBjb25zdCBuZXdSZXBsaWNhdGlvblN0YXRlID0gKCkgPT4gKHtcclxuICAgIGNvbm5lY3Rpb25TdGF0ZTogXCJjbG9zZWRcIixcclxuICAgIHNlc3Npb25JZDogbnVsbCxcclxufSk7XHJcbmV4cG9ydCB2YXIgUmVwbGljYXRpb25BY3Rpb25UeXBlO1xyXG4oZnVuY3Rpb24gKFJlcGxpY2F0aW9uQWN0aW9uVHlwZSkge1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wiY3JlYXRpbmdTZXNzaW9uXCJdID0gXCJSRVBMSUNBVElPTl9DUkVBVElOR19TRVNTSU9OXCI7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjb25uZWN0aW9uUmVhZHlcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fUkVBRFlcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25DbG9zZWRcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fQ0xPU0VEXCI7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjb25uZWN0aW9uRXJyb3JcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fRVJST1JcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcInJlY2VpdmVNZXNzYWdlXCJdID0gXCJSRVBMSUNBVElPTl9SRUNFSVZFX01FU1NBR0VcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcInNlbmRQaW5nXCJdID0gXCJSRVBMSUNBVElPTl9TRU5EX1BJTkdcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcIm5vb3BcIl0gPSBcIlJFUExJQ0FUSU9OX05PT1BcIjtcclxufSkoUmVwbGljYXRpb25BY3Rpb25UeXBlIHx8IChSZXBsaWNhdGlvbkFjdGlvblR5cGUgPSB7fSkpO1xyXG47XHJcbmV4cG9ydCB2YXIgU2Vzc2lvbkFjdGlvblR5cGU7XHJcbihmdW5jdGlvbiAoU2Vzc2lvbkFjdGlvblR5cGUpIHtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiY3JlYXRlXCJdID0gXCJTRVNTSU9OX0NSRUFURVwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJzdGFydGVkXCJdID0gXCJTRVNTSU9OX1NUQVJURURcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiZW5kZWRcIl0gPSBcIlNFU1NJT05fRU5ERURcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiam9pblwiXSA9IFwiU0VTU0lPTl9KT0lOXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImxlYXZlXCJdID0gXCJTRVNTSU9OX0xFQVZFXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImFkZFVzZXJcIl0gPSBcIlNFU1NJT05fQUREX1VTRVJcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wicmVtb3ZlVXNlclwiXSA9IFwiU0VTU0lPTl9SRU1PVkVfVVNFUlwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJjaGFuZ2VVc2VyTmFtZVwiXSA9IFwiU0VTU0lPTl9DSEFOR0VfVVNFUl9OQU1FXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInVzZXJOYW1lQ2hhbmdlZFwiXSA9IFwiU0VTU0lPTl9VU0VSX05BTUVfQ0hBTkdFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJzZW5kTWVzc2FnZVwiXSA9IFwiUkVQTElDQVRJT05fU0VORF9NRVNTQUdFXCI7XHJcbn0pKFNlc3Npb25BY3Rpb25UeXBlIHx8IChTZXNzaW9uQWN0aW9uVHlwZSA9IHt9KSk7XHJcbjtcclxuZXhwb3J0IGNvbnN0IG5ld1VzZXIgPSAoaWQsIG5hbWUpID0+ICh7XHJcbiAgICBpZCxcclxuICAgIG5hbWVcclxufSk7XHJcbmV4cG9ydCB2YXIgUmVwbGljYXRpb25NZXNzYWdlVHlwZTtcclxuKGZ1bmN0aW9uIChSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlKSB7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1wiYWN0aW9uXCJdID0gXCJBQ1RJT05cIjtcclxuICAgIC8vY3JlYXRlZCA9IFwiQ1JFQVRFRFwiLCAvLyBzZXJ2ZXIgZG9lcyBub3QgdGVsbCB5b3UgdGhhdFxyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcImpvaW5lZFwiXSA9IFwiSk9JTkVEXCI7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1widXNlckpvaW5lZFwiXSA9IFwiVVNFUl9KT0lORURcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VyTGVmdFwiXSA9IFwiVVNFUl9MRUZUXCI7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1widXNlckNoYW5nZWROYW1lXCJdID0gXCJVU0VSX0NIQU5HRURfTkFNRVwiO1xyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcImVycm9yXCJdID0gXCJFUlJPUlwiO1xyXG59KShSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlIHx8IChSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlID0ge30pKTtcclxuZXhwb3J0IHZhciBDbGllbnRSZXF1ZXN0VHlwZTtcclxuKGZ1bmN0aW9uIChDbGllbnRSZXF1ZXN0VHlwZSkge1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJhY3Rpb25cIl0gPSBcIkFDVElPTlwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJjcmVhdGVcIl0gPSBcIkNSRUFURVwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJqb2luXCJdID0gXCJKT0lOXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcInBpbmdcIl0gPSBcIlBJTkdcIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wiY2hhbmdlTmFtZVwiXSA9IFwiQ0hBTkdFX05BTUVcIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wibGVhdmVcIl0gPSBcIkxFQVZFXCI7XHJcbn0pKENsaWVudFJlcXVlc3RUeXBlIHx8IChDbGllbnRSZXF1ZXN0VHlwZSA9IHt9KSk7XHJcbiIsImltcG9ydCB7IENsaWVudFJlcXVlc3RUeXBlIH0gZnJvbSBcIi4uL3JlcGxpY2F0aW9uX3dzL3R5cGVzXCI7XHJcbi8qIGZvciByZWZlcmVuY2Ugb25seVxyXG5jb25zdCBuZXdDb25uZWN0aW9uID0gKFxyXG4gIHVyaTogc3RyaW5nLFxyXG4gIG9uT3BlbjogKGV2OiBFdmVudCkgPT4gYW55LFxyXG4gIG9uTWVzc2FnZTogKGV2OiBNZXNzYWdlRXZlbnQpID0+IGFueSxcclxuICBvbkNsb3NlOiAoZXY6IENsb3NlRXZlbnQpID0+IGFueSxcclxuICBvbkVycm9yOiAoZXY6IEV2ZW50KSA9PiBhbnlcclxuKTogV2ViU29ja2V0ID0+IHtcclxuICBsZXQgd3MgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgd3Mub25vcGVuID0gb25PcGVuO1xyXG4gIHdzLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50KTogYW55ID0+IHtcclxuICAgIC8vY29uc29sZS5sb2coXCJtZXNzYWdlOiBcIiwgZXYuZGF0YSk7XHJcbiAgICBvbk1lc3NhZ2UoZXYpO1xyXG4gIH07XHJcbiAgd3Mub25jbG9zZSA9IChldjogQ2xvc2VFdmVudCk6IGFueSA9PiB7XHJcbiAgICBvbkNsb3NlKGV2KTtcclxuICB9O1xyXG4gIHdzLm9uZXJyb3IgPSBvbkVycm9yO1xyXG4gIHJldHVybiB3cztcclxufVxyXG4qL1xyXG5leHBvcnQgY29uc3Qgc2VuZCA9ICh3cywgbWVzc2FnZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzZW5kUGluZyA9ICh3cykgPT4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInNlbmRpbmcgcGluZ1wiKVxyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLnBpbmcgfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9ICh3cywgc2VyaXphYmxlU3RhdGUpID0+IHtcclxuICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBjb21tYW5kOiBDbGllbnRSZXF1ZXN0VHlwZS5jcmVhdGUsIHBheWxvYWQ6IHsgc3RhdGU6IHNlcml6YWJsZVN0YXRlIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgam9pblNlc3Npb24gPSAod3MsIHNlc3Npb25JZCkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmpvaW4sIHBheWxvYWQ6IHsgc2Vzc2lvbklkIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY2hhbmdlTmFtZSA9ICh3cywgbmFtZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmNoYW5nZU5hbWUsIHBheWxvYWQ6IHsgbmFtZSB9IH0pKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGxlYXZlU2Vzc2lvbiA9ICh3cykgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmxlYXZlIH0pKTtcclxuICAgIHdzLmNsb3NlKCk7XHJcbn07XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgUmVwbGljYXRpb25BY3Rpb25UeXBlIGFzIFJBVCwgUmVwbGljYXRpb25NZXNzYWdlVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XHJcbmltcG9ydCAqIGFzIFdTIGZyb20gXCIuL3dlYnNvY2tldFByaW1pdGl2ZXNcIjtcclxuLy9jb25zb2xlLmxvZyhcIndlYndvcmtlciBydW5uaW5nXCIpXHJcbmxldCB3cyA9IG51bGw7XHJcbmxldCBzZXNzaW9uSWQgPSBudWxsO1xyXG5sZXQgcGluZ1RpbWVyID0gbnVsbDtcclxubGV0IHdzQ2xvc2VkID0gZmFsc2U7XHJcbi8vIFdvcmtlciAnSU8nXHJcbm9ubWVzc2FnZSA9IChlKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZSA9IGUuZGF0YTtcclxuICAgIHN3aXRjaCAobWVzc2FnZS5mdW5jKSB7XHJcbiAgICAgICAgY2FzZSBcIkNSRUFURVwiOlxyXG4gICAgICAgICAgICB3cyA9IGNyZWF0ZShtZXNzYWdlLnBheWxvYWQuc2VydmVyQWRkcmVzcywgbWVzc2FnZS5wYXlsb2FkLnNlcmlhbGl6YWJsZVN0YXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIkpPSU5cIjpcclxuICAgICAgICAgICAgd3MgPSBqb2luKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJBZGRyZXNzLCBtZXNzYWdlLnBheWxvYWQuc2Vzc2lvbklkKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIkNIQU5HRV9OQU1FXCI6XHJcbiAgICAgICAgICAgIGlmICh3cyAmJiBzZXNzaW9uSWQpXHJcbiAgICAgICAgICAgICAgICBXUy5jaGFuZ2VOYW1lKHdzLCBtZXNzYWdlLnBheWxvYWQubmV3TmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNhc2UgXCJURVJNSU5BVEVcIjpcclxuICAgICAgICAgICAgaWYgKHdzKVxyXG4gICAgICAgICAgICAgICAgdGVybWluYXRlKHdzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIlNFTkRcIjpcclxuICAgICAgICAgICAgaWYgKHdzICYmIHNlc3Npb25JZClcclxuICAgICAgICAgICAgICAgIFdTLnNlbmQod3MsIG1lc3NhZ2UucGF5bG9hZC5tZXNzYWdlKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufTtcclxuY29uc3Qgc2VuZFRvTWFpbiA9IChtZXNzYWdlKSA9PiB7XHJcbiAgICBwb3N0TWVzc2FnZShtZXNzYWdlKTtcclxufTtcclxuY29uc3QgZGlzcGF0Y2ggPSAoYWN0aW9uKSA9PiB7XHJcbiAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiRElTUEFUQ0hcIiwgcGF5bG9hZDogeyBhY3Rpb24gfSB9KTtcclxufTtcclxuLy8gQ29ubmVjdGlvbiBzZXR1cFxyXG5jb25zdCBjb25zdHJ1Y3RvciA9IChzZXJ2ZXJBZGRyZXNzKSA9PiB7XHJcbiAgICBsZXQgd3MgPSBuZXcgV2ViU29ja2V0KHNlcnZlckFkZHJlc3MpO1xyXG4gICAgd3Mub25tZXNzYWdlID0gKGV2KSA9PiBvbk1lc3NhZ2UoZXYpO1xyXG4gICAgd3Mub25jbG9zZSA9IChldikgPT4gb25DbG9zZShldik7XHJcbiAgICB3cy5vbmVycm9yID0gKGV2KSA9PiBvbkVycm9yKGV2KTtcclxuICAgIHJldHVybiB3cztcclxufTtcclxuY29uc3QgY3JlYXRlID0gKHNlcnZlckFkZHJlc3MsIHNlcmlhbGl6YWJsZVN0YXRlKSA9PiB7XHJcbiAgICBsZXQgd3MgPSBjb25zdHJ1Y3RvcihzZXJ2ZXJBZGRyZXNzKTtcclxuICAgIHN0YXJ0UGluZ1RpbWVyKHdzKTtcclxuICAgIHdzLm9ub3BlbiA9IChldikgPT4ge1xyXG4gICAgICAgIFdTLmNyZWF0ZVNlc3Npb24od3MsIHNlcmlhbGl6YWJsZVN0YXRlKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gd3M7XHJcbn07XHJcbmNvbnN0IGpvaW4gPSAoc2VydmVyQWRkcmVzcywgc2Vzc2lvbklkKSA9PiB7XHJcbiAgICBsZXQgd3MgPSBjb25zdHJ1Y3RvcihzZXJ2ZXJBZGRyZXNzKTtcclxuICAgIHN0YXJ0UGluZ1RpbWVyKHdzKTtcclxuICAgIHdzLm9ub3BlbiA9IChldikgPT4ge1xyXG4gICAgICAgIFdTLmpvaW5TZXNzaW9uKHdzLCBzZXNzaW9uSWQpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB3cztcclxufTtcclxuY29uc3Qgc3RhcnRQaW5nVGltZXIgPSAod3MpID0+IHtcclxuICAgIHBpbmdUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBXUy5zZW5kUGluZyh3cyk7XHJcbiAgICB9LCAxMDAwKTtcclxufTtcclxuLy8gdGVhcmRvd25cclxuY29uc3QgdGVybWluYXRlID0gKHdzKSA9PiB7XHJcbiAgICB3c0Nsb3NlZCA9IHRydWU7XHJcbiAgICBzZXNzaW9uSWQgPSBudWxsO1xyXG4gICAgaWYgKHBpbmdUaW1lciAhPT0gbnVsbClcclxuICAgICAgICBjbGVhckludGVydmFsKHBpbmdUaW1lcik7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIFdTLmxlYXZlU2Vzc2lvbih3cyk7XHJcbiAgICAgICAgd3MuY2xvc2UoKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAvLyBub3RoaW5nIHRvIGRvIGhlcmUuXHJcbiAgICB9XHJcbn07XHJcbi8vIFdlYnNvY2tldCBiZWhhdmlvclxyXG5jb25zdCBvbk1lc3NhZ2UgPSAoZXYpID0+IHtcclxuICAgIGxldCBtZXNzYWdlID0gSlNPTi5wYXJzZShldi5kYXRhKTtcclxuICAgIGlmIChtZXNzYWdlLmNvbW1hbmQgPT0gUmVwbGljYXRpb25NZXNzYWdlVHlwZS5lcnJvcikge1xyXG4gICAgICAgIGRpc3BhdGNoKHsgdHlwZTogUkFULnJlY2VpdmVNZXNzYWdlLCBwYXlsb2FkOiB7IG1lc3NhZ2UsIHNlc3Npb25JZDogXCJcIiB9IH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKG1lc3NhZ2UuY29tbWFuZCA9PSBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlLmpvaW5lZCkge1xyXG4gICAgICAgIHNlc3Npb25JZCA9IG1lc3NhZ2UucGF5bG9hZC5zZXNzaW9uSWQ7XHJcbiAgICAgICAgc2VuZFRvTWFpbih7IGV2ZW50OiBcIlNFU1NJT05fSURcIiwgcGF5bG9hZDogbWVzc2FnZS5wYXlsb2FkIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHNlc3Npb25JZCAhPT0gbnVsbCkge1xyXG4gICAgICAgIGRpc3BhdGNoKHsgdHlwZTogUkFULnJlY2VpdmVNZXNzYWdlLCBwYXlsb2FkOiB7IG1lc3NhZ2UsIHNlc3Npb25JZDogc2Vzc2lvbklkIH0gfSk7XHJcbiAgICB9XHJcbn07XHJcbmNvbnN0IG9uQ2xvc2UgPSAoZXYpID0+IHtcclxuICAgIGlmICh3cylcclxuICAgICAgICB0ZXJtaW5hdGUod3MpO1xyXG4gICAgc2VuZFRvTWFpbih7IGV2ZW50OiBcIkNMT1NFXCIgfSk7XHJcbn07XHJcbmNvbnN0IG9uRXJyb3IgPSAoZXYpID0+IHtcclxuICAgIGlmICh3cylcclxuICAgICAgICB0ZXJtaW5hdGUod3MpO1xyXG4gICAgc2VuZFRvTWFpbih7IGV2ZW50OiBcIkVSUk9SXCIgfSk7XHJcbn07XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==