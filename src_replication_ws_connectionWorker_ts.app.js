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
        // nothing to do here.
    }
};
// Websocket behavior
const onMessage = (ev) => {
    let message = JSON.parse(ev.data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlcGxpY2F0aW9uX3dzX2Nvbm5lY3Rpb25Xb3JrZXJfdHMuYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ007QUFDUDtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsc0RBQXNEO0FBQ3ZEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyw4Q0FBOEM7QUFDL0M7QUFDTztBQUNQO0FBQ0E7QUFDQSxDQUFDO0FBQ007QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsd0RBQXdEO0FBQ2xEO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLDhDQUE4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkRhO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNPO0FBQ1A7QUFDQSw2QkFBNkIsU0FBUyxvRUFBaUIsT0FBTztBQUM5RDtBQUNPO0FBQ1AsNkJBQTZCLFNBQVMsb0VBQWlCLG9CQUFvQix5QkFBeUI7QUFDcEc7QUFDTztBQUNQLDZCQUE2QixTQUFTLG9FQUFpQixrQkFBa0IsYUFBYTtBQUN0RjtBQUNPO0FBQ1AsNkJBQTZCLFNBQVMsb0VBQWlCLHdCQUF3QixRQUFRO0FBQ3ZGO0FBQ087QUFDUCw2QkFBNkIsU0FBUyxvRUFBaUIsUUFBUTtBQUMvRDtBQUNBOzs7Ozs7O1VDekNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7O0FDTitFO0FBQ25DO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsNERBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isc0RBQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQiw4QkFBOEIsVUFBVTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsK0RBQWdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw2REFBYztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSwwREFBVztBQUNuQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOERBQWU7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLDBEQUFzQjtBQUNqRDtBQUNBLHFCQUFxQiwrQ0FBK0M7QUFDcEU7QUFDQTtBQUNBLG1CQUFtQixNQUFNLHlEQUFHLDRCQUE0QixpQ0FBaUM7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZ0JBQWdCO0FBQ2pDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC8uL3NyYy9yZXBsaWNhdGlvbl93cy90eXBlcy50cyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlcGxpY2F0aW9uX3dzL3dlYnNvY2tldFByaW1pdGl2ZXMudHMiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3MvY29ubmVjdGlvbldvcmtlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgbmV3U2Vzc2lvbiA9ICgpID0+ICh7XHJcbiAgICBzZXNzaW9uSWQ6IFwiXCIsXHJcbiAgICB1c2VySWQ6IFwiXCIsXHJcbiAgICB1c2VyczogbmV3IE1hcCgpLFxyXG59KTtcclxuZXhwb3J0IGNvbnN0IG5ld1JlcGxpY2F0aW9uU3RhdGUgPSAoKSA9PiAoe1xyXG4gICAgY29ubmVjdGlvblN0YXRlOiBcImNsb3NlZFwiLFxyXG4gICAgc2Vzc2lvbklkOiBudWxsLFxyXG59KTtcclxuZXhwb3J0IHZhciBSZXBsaWNhdGlvbkFjdGlvblR5cGU7XHJcbihmdW5jdGlvbiAoUmVwbGljYXRpb25BY3Rpb25UeXBlKSB7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjcmVhdGluZ1Nlc3Npb25cIl0gPSBcIlJFUExJQ0FUSU9OX0NSRUFUSU5HX1NFU1NJT05cIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25SZWFkeVwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9SRUFEWVwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wiY29ubmVjdGlvbkNsb3NlZFwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9DTE9TRURcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25FcnJvclwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9FUlJPUlwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wicmVjZWl2ZU1lc3NhZ2VcIl0gPSBcIlJFUExJQ0FUSU9OX1JFQ0VJVkVfTUVTU0FHRVwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wic2VuZFBpbmdcIl0gPSBcIlJFUExJQ0FUSU9OX1NFTkRfUElOR1wiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wibm9vcFwiXSA9IFwiUkVQTElDQVRJT05fTk9PUFwiO1xyXG59KShSZXBsaWNhdGlvbkFjdGlvblR5cGUgfHwgKFJlcGxpY2F0aW9uQWN0aW9uVHlwZSA9IHt9KSk7XHJcbjtcclxuZXhwb3J0IHZhciBTZXNzaW9uQWN0aW9uVHlwZTtcclxuKGZ1bmN0aW9uIChTZXNzaW9uQWN0aW9uVHlwZSkge1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJjcmVhdGVcIl0gPSBcIlNFU1NJT05fQ1JFQVRFXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInN0YXJ0ZWRcIl0gPSBcIlNFU1NJT05fU1RBUlRFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJlbmRlZFwiXSA9IFwiU0VTU0lPTl9FTkRFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJqb2luXCJdID0gXCJTRVNTSU9OX0pPSU5cIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wibGVhdmVcIl0gPSBcIlNFU1NJT05fTEVBVkVcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiYWRkVXNlclwiXSA9IFwiU0VTU0lPTl9BRERfVVNFUlwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJyZW1vdmVVc2VyXCJdID0gXCJTRVNTSU9OX1JFTU9WRV9VU0VSXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImNoYW5nZVVzZXJOYW1lXCJdID0gXCJTRVNTSU9OX0NIQU5HRV9VU0VSX05BTUVcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1widXNlck5hbWVDaGFuZ2VkXCJdID0gXCJTRVNTSU9OX1VTRVJfTkFNRV9DSEFOR0VEXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInNlbmRNZXNzYWdlXCJdID0gXCJSRVBMSUNBVElPTl9TRU5EX01FU1NBR0VcIjtcclxufSkoU2Vzc2lvbkFjdGlvblR5cGUgfHwgKFNlc3Npb25BY3Rpb25UeXBlID0ge30pKTtcclxuO1xyXG5leHBvcnQgY29uc3QgbmV3VXNlciA9IChpZCwgbmFtZSkgPT4gKHtcclxuICAgIGlkLFxyXG4gICAgbmFtZVxyXG59KTtcclxuZXhwb3J0IHZhciBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlO1xyXG4oZnVuY3Rpb24gKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUpIHtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJhY3Rpb25cIl0gPSBcIkFDVElPTlwiO1xyXG4gICAgLy9jcmVhdGVkID0gXCJDUkVBVEVEXCIsIC8vIHNlcnZlciBkb2VzIG5vdCB0ZWxsIHlvdSB0aGF0XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1wiam9pbmVkXCJdID0gXCJKT0lORURcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VySm9pbmVkXCJdID0gXCJVU0VSX0pPSU5FRFwiO1xyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcInVzZXJMZWZ0XCJdID0gXCJVU0VSX0xFRlRcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VyQ2hhbmdlZE5hbWVcIl0gPSBcIlVTRVJfQ0hBTkdFRF9OQU1FXCI7XHJcbn0pKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUgfHwgKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUgPSB7fSkpO1xyXG5leHBvcnQgdmFyIENsaWVudFJlcXVlc3RUeXBlO1xyXG4oZnVuY3Rpb24gKENsaWVudFJlcXVlc3RUeXBlKSB7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImFjdGlvblwiXSA9IFwiQUNUSU9OXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImNyZWF0ZVwiXSA9IFwiQ1JFQVRFXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImpvaW5cIl0gPSBcIkpPSU5cIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wicGluZ1wiXSA9IFwiUElOR1wiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJjaGFuZ2VOYW1lXCJdID0gXCJDSEFOR0VfTkFNRVwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJsZWF2ZVwiXSA9IFwiTEVBVkVcIjtcclxufSkoQ2xpZW50UmVxdWVzdFR5cGUgfHwgKENsaWVudFJlcXVlc3RUeXBlID0ge30pKTtcclxuIiwiaW1wb3J0IHsgQ2xpZW50UmVxdWVzdFR5cGUgfSBmcm9tIFwiLi4vcmVwbGljYXRpb25fd3MvdHlwZXNcIjtcclxuLyogZm9yIHJlZmVyZW5jZSBvbmx5XHJcbmNvbnN0IG5ld0Nvbm5lY3Rpb24gPSAoXHJcbiAgdXJpOiBzdHJpbmcsXHJcbiAgb25PcGVuOiAoZXY6IEV2ZW50KSA9PiBhbnksXHJcbiAgb25NZXNzYWdlOiAoZXY6IE1lc3NhZ2VFdmVudCkgPT4gYW55LFxyXG4gIG9uQ2xvc2U6IChldjogQ2xvc2VFdmVudCkgPT4gYW55LFxyXG4gIG9uRXJyb3I6IChldjogRXZlbnQpID0+IGFueVxyXG4pOiBXZWJTb2NrZXQgPT4ge1xyXG4gIGxldCB3cyA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICB3cy5vbm9wZW4gPSBvbk9wZW47XHJcbiAgd3Mub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQpOiBhbnkgPT4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIm1lc3NhZ2U6IFwiLCBldi5kYXRhKTtcclxuICAgIG9uTWVzc2FnZShldik7XHJcbiAgfTtcclxuICB3cy5vbmNsb3NlID0gKGV2OiBDbG9zZUV2ZW50KTogYW55ID0+IHtcclxuICAgIG9uQ2xvc2UoZXYpO1xyXG4gIH07XHJcbiAgd3Mub25lcnJvciA9IG9uRXJyb3I7XHJcbiAgcmV0dXJuIHdzO1xyXG59XHJcbiovXHJcbmV4cG9ydCBjb25zdCBzZW5kID0gKHdzLCBtZXNzYWdlKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNlbmRQaW5nID0gKHdzKSA9PiB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwic2VuZGluZyBwaW5nXCIpXHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUucGluZyB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gKHdzLCBzZXJpemFibGVTdGF0ZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmNyZWF0ZSwgcGF5bG9hZDogeyBzdGF0ZTogc2VyaXphYmxlU3RhdGUgfSB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBqb2luU2Vzc2lvbiA9ICh3cywgc2Vzc2lvbklkKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUuam9pbiwgcGF5bG9hZDogeyBzZXNzaW9uSWQgfSB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjaGFuZ2VOYW1lID0gKHdzLCBuYW1lKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUuY2hhbmdlTmFtZSwgcGF5bG9hZDogeyBuYW1lIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgbGVhdmVTZXNzaW9uID0gKHdzKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUubGVhdmUgfSkpO1xyXG4gICAgd3MuY2xvc2UoKTtcclxufTtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBSZXBsaWNhdGlvbkFjdGlvblR5cGUgYXMgUkFULCBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcclxuaW1wb3J0ICogYXMgV1MgZnJvbSBcIi4vd2Vic29ja2V0UHJpbWl0aXZlc1wiO1xyXG4vL2NvbnNvbGUubG9nKFwid2Vid29ya2VyIHJ1bm5pbmdcIilcclxubGV0IHdzID0gbnVsbDtcclxubGV0IHNlc3Npb25JZCA9IG51bGw7XHJcbmxldCBwaW5nVGltZXIgPSBudWxsO1xyXG5sZXQgd3NDbG9zZWQgPSBmYWxzZTtcclxuLy8gV29ya2VyICdJTydcclxub25tZXNzYWdlID0gKGUpID0+IHtcclxuICAgIGxldCBtZXNzYWdlID0gZS5kYXRhO1xyXG4gICAgc3dpdGNoIChtZXNzYWdlLmZ1bmMpIHtcclxuICAgICAgICBjYXNlIFwiQ1JFQVRFXCI6XHJcbiAgICAgICAgICAgIHdzID0gY3JlYXRlKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJBZGRyZXNzLCBtZXNzYWdlLnBheWxvYWQuc2VyaWFsaXphYmxlU3RhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiSk9JTlwiOlxyXG4gICAgICAgICAgICB3cyA9IGpvaW4obWVzc2FnZS5wYXlsb2FkLnNlcnZlckFkZHJlc3MsIG1lc3NhZ2UucGF5bG9hZC5zZXNzaW9uSWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiQ0hBTkdFX05BTUVcIjpcclxuICAgICAgICAgICAgaWYgKHdzICYmIHNlc3Npb25JZClcclxuICAgICAgICAgICAgICAgIFdTLmNoYW5nZU5hbWUod3MsIG1lc3NhZ2UucGF5bG9hZC5uZXdOYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIlRFUk1JTkFURVwiOlxyXG4gICAgICAgICAgICBpZiAod3MpXHJcbiAgICAgICAgICAgICAgICB0ZXJtaW5hdGUod3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiU0VORFwiOlxyXG4gICAgICAgICAgICBpZiAod3MgJiYgc2Vzc2lvbklkKVxyXG4gICAgICAgICAgICAgICAgV1Muc2VuZCh3cywgbWVzc2FnZS5wYXlsb2FkLm1lc3NhZ2UpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5jb25zdCBzZW5kVG9NYWluID0gKG1lc3NhZ2UpID0+IHtcclxuICAgIHBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xyXG59O1xyXG5jb25zdCBkaXNwYXRjaCA9IChhY3Rpb24pID0+IHtcclxuICAgIHNlbmRUb01haW4oeyBldmVudDogXCJESVNQQVRDSFwiLCBwYXlsb2FkOiB7IGFjdGlvbiB9IH0pO1xyXG59O1xyXG4vLyBDb25uZWN0aW9uIHNldHVwXHJcbmNvbnN0IGNvbnN0cnVjdG9yID0gKHNlcnZlckFkZHJlc3MpID0+IHtcclxuICAgIGxldCB3cyA9IG5ldyBXZWJTb2NrZXQoc2VydmVyQWRkcmVzcyk7XHJcbiAgICB3cy5vbm1lc3NhZ2UgPSAoZXYpID0+IG9uTWVzc2FnZShldik7XHJcbiAgICB3cy5vbmNsb3NlID0gKGV2KSA9PiBvbkNsb3NlKGV2KTtcclxuICAgIHdzLm9uZXJyb3IgPSAoZXYpID0+IG9uRXJyb3IoZXYpO1xyXG4gICAgcmV0dXJuIHdzO1xyXG59O1xyXG5jb25zdCBjcmVhdGUgPSAoc2VydmVyQWRkcmVzcywgc2VyaWFsaXphYmxlU3RhdGUpID0+IHtcclxuICAgIGxldCB3cyA9IGNvbnN0cnVjdG9yKHNlcnZlckFkZHJlc3MpO1xyXG4gICAgc3RhcnRQaW5nVGltZXIod3MpO1xyXG4gICAgd3Mub25vcGVuID0gKGV2KSA9PiB7XHJcbiAgICAgICAgV1MuY3JlYXRlU2Vzc2lvbih3cywgc2VyaWFsaXphYmxlU3RhdGUpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB3cztcclxufTtcclxuY29uc3Qgam9pbiA9IChzZXJ2ZXJBZGRyZXNzLCBzZXNzaW9uSWQpID0+IHtcclxuICAgIGxldCB3cyA9IGNvbnN0cnVjdG9yKHNlcnZlckFkZHJlc3MpO1xyXG4gICAgc3RhcnRQaW5nVGltZXIod3MpO1xyXG4gICAgd3Mub25vcGVuID0gKGV2KSA9PiB7XHJcbiAgICAgICAgV1Muam9pblNlc3Npb24od3MsIHNlc3Npb25JZCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHdzO1xyXG59O1xyXG5jb25zdCBzdGFydFBpbmdUaW1lciA9ICh3cykgPT4ge1xyXG4gICAgcGluZ1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIFdTLnNlbmRQaW5nKHdzKTtcclxuICAgIH0sIDEwMDApO1xyXG59O1xyXG4vLyB0ZWFyZG93blxyXG5jb25zdCB0ZXJtaW5hdGUgPSAod3MpID0+IHtcclxuICAgIHdzQ2xvc2VkID0gdHJ1ZTtcclxuICAgIHNlc3Npb25JZCA9IG51bGw7XHJcbiAgICBpZiAocGluZ1RpbWVyICE9PSBudWxsKVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwocGluZ1RpbWVyKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgV1MubGVhdmVTZXNzaW9uKHdzKTtcclxuICAgICAgICB3cy5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgLy8gbm90aGluZyB0byBkbyBoZXJlLlxyXG4gICAgfVxyXG59O1xyXG4vLyBXZWJzb2NrZXQgYmVoYXZpb3JcclxuY29uc3Qgb25NZXNzYWdlID0gKGV2KSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXYuZGF0YSk7XHJcbiAgICBpZiAobWVzc2FnZS5jb21tYW5kID09IFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUuam9pbmVkKSB7XHJcbiAgICAgICAgc2Vzc2lvbklkID0gbWVzc2FnZS5wYXlsb2FkLnNlc3Npb25JZDtcclxuICAgICAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiU0VTU0lPTl9JRFwiLCBwYXlsb2FkOiBtZXNzYWdlLnBheWxvYWQgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoc2Vzc2lvbklkICE9PSBudWxsKSB7XHJcbiAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBSQVQucmVjZWl2ZU1lc3NhZ2UsIHBheWxvYWQ6IHsgbWVzc2FnZSwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgfSB9KTtcclxuICAgIH1cclxufTtcclxuY29uc3Qgb25DbG9zZSA9IChldikgPT4ge1xyXG4gICAgaWYgKHdzKVxyXG4gICAgICAgIHRlcm1pbmF0ZSh3cyk7XHJcbiAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiQ0xPU0VcIiB9KTtcclxufTtcclxuY29uc3Qgb25FcnJvciA9IChldikgPT4ge1xyXG4gICAgaWYgKHdzKVxyXG4gICAgICAgIHRlcm1pbmF0ZSh3cyk7XHJcbiAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiRVJST1JcIiB9KTtcclxufTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9