/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/standard.ts":
/*!*****************************!*\
  !*** ./src/api/standard.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   remove_all: () => (/* binding */ remove_all),
/* harmony export */   save: () => (/* binding */ save),
/* harmony export */   set_server_ip: () => (/* binding */ set_server_ip),
/* harmony export */   set_sessionId: () => (/* binding */ set_sessionId),
/* harmony export */   set_session_userId: () => (/* binding */ set_session_userId),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/notification/index.js");


axios__WEBPACK_IMPORTED_MODULE_0__["default"].interceptors.response.use(res => {
    if (res.data.success !== 0) {
        antd__WEBPACK_IMPORTED_MODULE_1__["default"].error({
            message: '警告',
            description: res.data.message,
        });
        return Promise.reject(res);
    }
    // 对响应数据做点什么
    return res;
}, error => {
    // 对响应错误做点什么
    // if (error.response.status === 401) {
    //     // 处理未授权的情况
    //     // 例如重定向到登录页面
    // }
    return Promise.reject(error);
});
const baseURL = `http://${(typeof window !== "undefined") ? window.location.hostname : self.location.hostname}:8080/`;
const save = (data) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(baseURL + "save", data);
};
const remove = (data) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(baseURL + "remove", data);
};
const update = (data) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].post(baseURL + "update", data);
};
const remove_all = () => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(baseURL + "remove_all");
};
const set_session_userId = (userId) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(baseURL + "set_session_userId?userId=" + userId);
};
const set_sessionId = (sessionId) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(baseURL + "set_sessionId?sessionId=" + sessionId);
};
const set_server_ip = (address) => {
    return axios__WEBPACK_IMPORTED_MODULE_0__["default"].get(baseURL + "set_server_ip?address=" + address);
};


/***/ }),

/***/ "./src/replication_ws/connectionWorker.ts":
/*!************************************************!*\
  !*** ./src/replication_ws/connectionWorker.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/replication_ws/types.ts");
/* harmony import */ var _websocketPrimitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./websocketPrimitives */ "./src/replication_ws/websocketPrimitives.ts");
/* harmony import */ var _api_standard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../api/standard */ "./src/api/standard.ts");



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
            (0,_api_standard__WEBPACK_IMPORTED_MODULE_2__.set_server_ip)(message.payload.serverAddress);
            return null;
        case "JOIN":
            ws = join(message.payload.serverAddress, message.payload.sessionId);
            (0,_api_standard__WEBPACK_IMPORTED_MODULE_2__.set_server_ip)(message.payload.serverAddress);
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
    sendToMain({ event: "ERROR", payload: { msg: "" } });
};


/***/ }),

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
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_antd_es_notification_index_js-node_modules_axios_lib_axios_js"], () => (__webpack_require__("./src/replication_ws/connectionWorker.ts")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".app.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_replication_ws_connectionWorker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_antd_es_notification_index_js-node_modules_axios_lib_axios_js").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlcGxpY2F0aW9uX3dzX2Nvbm5lY3Rpb25Xb3JrZXJfdHMuYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEI7QUFDVTtBQUNwQyw2Q0FBSztBQUNMO0FBQ0EsUUFBUSw0Q0FBWTtBQUNwQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCwwQkFBMEIsb0ZBQW9GO0FBQ3ZHO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjs7Ozs7Ozs7Ozs7Ozs7O0FDekMrRTtBQUNuQztBQUNJO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDREQUFhO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFlBQVksNERBQWE7QUFDekI7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDREQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHNEQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsOEJBQThCLFVBQVU7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLCtEQUFnQjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNkRBQWM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7Ozs7O1dDUkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NKQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7Ozs7O1dDVkE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsYUFBYTtXQUNiO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7Ozs7V0NwQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1VFSEE7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvYXBpL3N0YW5kYXJkLnRzIiwid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3MvY29ubmVjdGlvbldvcmtlci50cyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlcGxpY2F0aW9uX3dzL3R5cGVzLnRzIiwid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3Mvd2Vic29ja2V0UHJpbWl0aXZlcy50cyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9oYXJtb255IG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2ltcG9ydFNjcmlwdHMgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9zdGFydHVwIGNodW5rIGRlcGVuZGVuY2llcyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgeyBub3RpZmljYXRpb24gfSBmcm9tICdhbnRkJztcclxuYXhpb3MuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZShyZXMgPT4ge1xyXG4gICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MgIT09IDApIHtcclxuICAgICAgICBub3RpZmljYXRpb24uZXJyb3Ioe1xyXG4gICAgICAgICAgICBtZXNzYWdlOiAn6K2m5ZGKJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlcy5kYXRhLm1lc3NhZ2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlcyk7XHJcbiAgICB9XHJcbiAgICAvLyDlr7nlk43lupTmlbDmja7lgZrngrnku4DkuYhcclxuICAgIHJldHVybiByZXM7XHJcbn0sIGVycm9yID0+IHtcclxuICAgIC8vIOWvueWTjeW6lOmUmeivr+WBmueCueS7gOS5iFxyXG4gICAgLy8gaWYgKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAvLyAgICAgLy8g5aSE55CG5pyq5o6I5p2D55qE5oOF5Ya1XHJcbiAgICAvLyAgICAgLy8g5L6L5aaC6YeN5a6a5ZCR5Yiw55m75b2V6aG16Z2iXHJcbiAgICAvLyB9XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG59KTtcclxuY29uc3QgYmFzZVVSTCA9IGBodHRwOi8vJHsodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikgPyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgOiBzZWxmLmxvY2F0aW9uLmhvc3RuYW1lfTo4MDgwL2A7XHJcbmV4cG9ydCBjb25zdCBzYXZlID0gKGRhdGEpID0+IHtcclxuICAgIHJldHVybiBheGlvcy5wb3N0KGJhc2VVUkwgKyBcInNhdmVcIiwgZGF0YSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCByZW1vdmUgPSAoZGF0YSkgPT4ge1xyXG4gICAgcmV0dXJuIGF4aW9zLnBvc3QoYmFzZVVSTCArIFwicmVtb3ZlXCIsIGRhdGEpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgdXBkYXRlID0gKGRhdGEpID0+IHtcclxuICAgIHJldHVybiBheGlvcy5wb3N0KGJhc2VVUkwgKyBcInVwZGF0ZVwiLCBkYXRhKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHJlbW92ZV9hbGwgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KGJhc2VVUkwgKyBcInJlbW92ZV9hbGxcIik7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzZXRfc2Vzc2lvbl91c2VySWQgPSAodXNlcklkKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KGJhc2VVUkwgKyBcInNldF9zZXNzaW9uX3VzZXJJZD91c2VySWQ9XCIgKyB1c2VySWQpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2V0X3Nlc3Npb25JZCA9IChzZXNzaW9uSWQpID0+IHtcclxuICAgIHJldHVybiBheGlvcy5nZXQoYmFzZVVSTCArIFwic2V0X3Nlc3Npb25JZD9zZXNzaW9uSWQ9XCIgKyBzZXNzaW9uSWQpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2V0X3NlcnZlcl9pcCA9IChhZGRyZXNzKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KGJhc2VVUkwgKyBcInNldF9zZXJ2ZXJfaXA/YWRkcmVzcz1cIiArIGFkZHJlc3MpO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBSZXBsaWNhdGlvbkFjdGlvblR5cGUgYXMgUkFULCBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcclxuaW1wb3J0ICogYXMgV1MgZnJvbSBcIi4vd2Vic29ja2V0UHJpbWl0aXZlc1wiO1xyXG5pbXBvcnQgeyBzZXRfc2VydmVyX2lwIH0gZnJvbSBcIi4uL2FwaS9zdGFuZGFyZFwiO1xyXG4vL2NvbnNvbGUubG9nKFwid2Vid29ya2VyIHJ1bm5pbmdcIilcclxubGV0IHdzID0gbnVsbDtcclxubGV0IHNlc3Npb25JZCA9IG51bGw7XHJcbmxldCBwaW5nVGltZXIgPSBudWxsO1xyXG5sZXQgd3NDbG9zZWQgPSBmYWxzZTtcclxuLy8gV29ya2VyICdJTydcclxub25tZXNzYWdlID0gKGUpID0+IHtcclxuICAgIGxldCBtZXNzYWdlID0gZS5kYXRhO1xyXG4gICAgc3dpdGNoIChtZXNzYWdlLmZ1bmMpIHtcclxuICAgICAgICBjYXNlIFwiQ1JFQVRFXCI6XHJcbiAgICAgICAgICAgIHdzID0gY3JlYXRlKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJBZGRyZXNzLCBtZXNzYWdlLnBheWxvYWQuc2VyaWFsaXphYmxlU3RhdGUpO1xyXG4gICAgICAgICAgICBzZXRfc2VydmVyX2lwKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJBZGRyZXNzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIkpPSU5cIjpcclxuICAgICAgICAgICAgd3MgPSBqb2luKG1lc3NhZ2UucGF5bG9hZC5zZXJ2ZXJBZGRyZXNzLCBtZXNzYWdlLnBheWxvYWQuc2Vzc2lvbklkKTtcclxuICAgICAgICAgICAgc2V0X3NlcnZlcl9pcChtZXNzYWdlLnBheWxvYWQuc2VydmVyQWRkcmVzcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNhc2UgXCJDSEFOR0VfTkFNRVwiOlxyXG4gICAgICAgICAgICBpZiAod3MgJiYgc2Vzc2lvbklkKVxyXG4gICAgICAgICAgICAgICAgV1MuY2hhbmdlTmFtZSh3cywgbWVzc2FnZS5wYXlsb2FkLm5ld05hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiVEVSTUlOQVRFXCI6XHJcbiAgICAgICAgICAgIGlmICh3cylcclxuICAgICAgICAgICAgICAgIHRlcm1pbmF0ZSh3cyk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNhc2UgXCJTRU5EXCI6XHJcbiAgICAgICAgICAgIGlmICh3cyAmJiBzZXNzaW9uSWQpXHJcbiAgICAgICAgICAgICAgICBXUy5zZW5kKHdzLCBtZXNzYWdlLnBheWxvYWQubWVzc2FnZSk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn07XHJcbmNvbnN0IHNlbmRUb01haW4gPSAobWVzc2FnZSkgPT4ge1xyXG4gICAgcG9zdE1lc3NhZ2UobWVzc2FnZSk7XHJcbn07XHJcbmNvbnN0IGRpc3BhdGNoID0gKGFjdGlvbikgPT4ge1xyXG4gICAgc2VuZFRvTWFpbih7IGV2ZW50OiBcIkRJU1BBVENIXCIsIHBheWxvYWQ6IHsgYWN0aW9uIH0gfSk7XHJcbn07XHJcbi8vIENvbm5lY3Rpb24gc2V0dXBcclxuY29uc3QgY29uc3RydWN0b3IgPSAoc2VydmVyQWRkcmVzcykgPT4ge1xyXG4gICAgbGV0IHdzID0gbmV3IFdlYlNvY2tldChzZXJ2ZXJBZGRyZXNzKTtcclxuICAgIHdzLm9ubWVzc2FnZSA9IChldikgPT4gb25NZXNzYWdlKGV2KTtcclxuICAgIHdzLm9uY2xvc2UgPSAoZXYpID0+IG9uQ2xvc2UoZXYpO1xyXG4gICAgd3Mub25lcnJvciA9IChldikgPT4gb25FcnJvcihldik7XHJcbiAgICByZXR1cm4gd3M7XHJcbn07XHJcbmNvbnN0IGNyZWF0ZSA9IChzZXJ2ZXJBZGRyZXNzLCBzZXJpYWxpemFibGVTdGF0ZSkgPT4ge1xyXG4gICAgbGV0IHdzID0gY29uc3RydWN0b3Ioc2VydmVyQWRkcmVzcyk7XHJcbiAgICBzdGFydFBpbmdUaW1lcih3cyk7XHJcbiAgICB3cy5vbm9wZW4gPSAoZXYpID0+IHtcclxuICAgICAgICBXUy5jcmVhdGVTZXNzaW9uKHdzLCBzZXJpYWxpemFibGVTdGF0ZSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHdzO1xyXG59O1xyXG5jb25zdCBqb2luID0gKHNlcnZlckFkZHJlc3MsIHNlc3Npb25JZCkgPT4ge1xyXG4gICAgbGV0IHdzID0gY29uc3RydWN0b3Ioc2VydmVyQWRkcmVzcyk7XHJcbiAgICBzdGFydFBpbmdUaW1lcih3cyk7XHJcbiAgICB3cy5vbm9wZW4gPSAoZXYpID0+IHtcclxuICAgICAgICBXUy5qb2luU2Vzc2lvbih3cywgc2Vzc2lvbklkKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gd3M7XHJcbn07XHJcbmNvbnN0IHN0YXJ0UGluZ1RpbWVyID0gKHdzKSA9PiB7XHJcbiAgICBwaW5nVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgV1Muc2VuZFBpbmcod3MpO1xyXG4gICAgfSwgMTAwMCk7XHJcbn07XHJcbi8vIHRlYXJkb3duXHJcbmNvbnN0IHRlcm1pbmF0ZSA9ICh3cykgPT4ge1xyXG4gICAgd3NDbG9zZWQgPSB0cnVlO1xyXG4gICAgc2Vzc2lvbklkID0gbnVsbDtcclxuICAgIGlmIChwaW5nVGltZXIgIT09IG51bGwpXHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChwaW5nVGltZXIpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBXUy5sZWF2ZVNlc3Npb24od3MpO1xyXG4gICAgICAgIHdzLmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgLy8gbm90aGluZyB0byBkbyBoZXJlLlxyXG4gICAgfVxyXG59O1xyXG4vLyBXZWJzb2NrZXQgYmVoYXZpb3JcclxuY29uc3Qgb25NZXNzYWdlID0gKGV2KSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXYuZGF0YSk7XHJcbiAgICBpZiAobWVzc2FnZS5jb21tYW5kID09IFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUuZXJyb3IpIHtcclxuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFJBVC5yZWNlaXZlTWVzc2FnZSwgcGF5bG9hZDogeyBtZXNzYWdlLCBzZXNzaW9uSWQ6IFwiXCIgfSB9KTtcclxuICAgIH1cclxuICAgIGlmIChtZXNzYWdlLmNvbW1hbmQgPT0gUmVwbGljYXRpb25NZXNzYWdlVHlwZS5qb2luZWQpIHtcclxuICAgICAgICBzZXNzaW9uSWQgPSBtZXNzYWdlLnBheWxvYWQuc2Vzc2lvbklkO1xyXG4gICAgICAgIHNlbmRUb01haW4oeyBldmVudDogXCJTRVNTSU9OX0lEXCIsIHBheWxvYWQ6IG1lc3NhZ2UucGF5bG9hZCB9KTtcclxuICAgIH1cclxuICAgIGlmIChzZXNzaW9uSWQgIT09IG51bGwpIHtcclxuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFJBVC5yZWNlaXZlTWVzc2FnZSwgcGF5bG9hZDogeyBtZXNzYWdlLCBzZXNzaW9uSWQ6IHNlc3Npb25JZCB9IH0pO1xyXG4gICAgfVxyXG59O1xyXG5jb25zdCBvbkNsb3NlID0gKGV2KSA9PiB7XHJcbiAgICBpZiAod3MpXHJcbiAgICAgICAgdGVybWluYXRlKHdzKTtcclxuICAgIHNlbmRUb01haW4oeyBldmVudDogXCJDTE9TRVwiIH0pO1xyXG59O1xyXG5jb25zdCBvbkVycm9yID0gKGV2KSA9PiB7XHJcbiAgICBpZiAod3MpXHJcbiAgICAgICAgdGVybWluYXRlKHdzKTtcclxuICAgIHNlbmRUb01haW4oeyBldmVudDogXCJFUlJPUlwiLCBwYXlsb2FkOiB7IG1zZzogXCJcIiB9IH0pO1xyXG59O1xyXG4iLCJleHBvcnQgY29uc3QgbmV3U2Vzc2lvbiA9ICgpID0+ICh7XHJcbiAgICBzZXNzaW9uSWQ6IFwiXCIsXHJcbiAgICB1c2VySWQ6IFwiXCIsXHJcbiAgICB1c2VyczogbmV3IE1hcCgpLFxyXG59KTtcclxuZXhwb3J0IGNvbnN0IG5ld1JlcGxpY2F0aW9uU3RhdGUgPSAoKSA9PiAoe1xyXG4gICAgY29ubmVjdGlvblN0YXRlOiBcImNsb3NlZFwiLFxyXG4gICAgc2Vzc2lvbklkOiBudWxsLFxyXG59KTtcclxuZXhwb3J0IHZhciBSZXBsaWNhdGlvbkFjdGlvblR5cGU7XHJcbihmdW5jdGlvbiAoUmVwbGljYXRpb25BY3Rpb25UeXBlKSB7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjcmVhdGluZ1Nlc3Npb25cIl0gPSBcIlJFUExJQ0FUSU9OX0NSRUFUSU5HX1NFU1NJT05cIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25SZWFkeVwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9SRUFEWVwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wiY29ubmVjdGlvbkNsb3NlZFwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9DTE9TRURcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25FcnJvclwiXSA9IFwiUkVQTElDQVRJT05fQ09OTkVDVElPTl9FUlJPUlwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wicmVjZWl2ZU1lc3NhZ2VcIl0gPSBcIlJFUExJQ0FUSU9OX1JFQ0VJVkVfTUVTU0FHRVwiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wic2VuZFBpbmdcIl0gPSBcIlJFUExJQ0FUSU9OX1NFTkRfUElOR1wiO1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wibm9vcFwiXSA9IFwiUkVQTElDQVRJT05fTk9PUFwiO1xyXG59KShSZXBsaWNhdGlvbkFjdGlvblR5cGUgfHwgKFJlcGxpY2F0aW9uQWN0aW9uVHlwZSA9IHt9KSk7XHJcbjtcclxuZXhwb3J0IHZhciBTZXNzaW9uQWN0aW9uVHlwZTtcclxuKGZ1bmN0aW9uIChTZXNzaW9uQWN0aW9uVHlwZSkge1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJjcmVhdGVcIl0gPSBcIlNFU1NJT05fQ1JFQVRFXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInN0YXJ0ZWRcIl0gPSBcIlNFU1NJT05fU1RBUlRFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJlbmRlZFwiXSA9IFwiU0VTU0lPTl9FTkRFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJqb2luXCJdID0gXCJTRVNTSU9OX0pPSU5cIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wibGVhdmVcIl0gPSBcIlNFU1NJT05fTEVBVkVcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiYWRkVXNlclwiXSA9IFwiU0VTU0lPTl9BRERfVVNFUlwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJyZW1vdmVVc2VyXCJdID0gXCJTRVNTSU9OX1JFTU9WRV9VU0VSXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImNoYW5nZVVzZXJOYW1lXCJdID0gXCJTRVNTSU9OX0NIQU5HRV9VU0VSX05BTUVcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1widXNlck5hbWVDaGFuZ2VkXCJdID0gXCJTRVNTSU9OX1VTRVJfTkFNRV9DSEFOR0VEXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInNlbmRNZXNzYWdlXCJdID0gXCJSRVBMSUNBVElPTl9TRU5EX01FU1NBR0VcIjtcclxufSkoU2Vzc2lvbkFjdGlvblR5cGUgfHwgKFNlc3Npb25BY3Rpb25UeXBlID0ge30pKTtcclxuO1xyXG5leHBvcnQgY29uc3QgbmV3VXNlciA9IChpZCwgbmFtZSkgPT4gKHtcclxuICAgIGlkLFxyXG4gICAgbmFtZVxyXG59KTtcclxuZXhwb3J0IHZhciBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlO1xyXG4oZnVuY3Rpb24gKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUpIHtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJhY3Rpb25cIl0gPSBcIkFDVElPTlwiO1xyXG4gICAgLy9jcmVhdGVkID0gXCJDUkVBVEVEXCIsIC8vIHNlcnZlciBkb2VzIG5vdCB0ZWxsIHlvdSB0aGF0XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1wiam9pbmVkXCJdID0gXCJKT0lORURcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VySm9pbmVkXCJdID0gXCJVU0VSX0pPSU5FRFwiO1xyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcInVzZXJMZWZ0XCJdID0gXCJVU0VSX0xFRlRcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VyQ2hhbmdlZE5hbWVcIl0gPSBcIlVTRVJfQ0hBTkdFRF9OQU1FXCI7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1wiZXJyb3JcIl0gPSBcIkVSUk9SXCI7XHJcbn0pKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUgfHwgKFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUgPSB7fSkpO1xyXG5leHBvcnQgdmFyIENsaWVudFJlcXVlc3RUeXBlO1xyXG4oZnVuY3Rpb24gKENsaWVudFJlcXVlc3RUeXBlKSB7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImFjdGlvblwiXSA9IFwiQUNUSU9OXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImNyZWF0ZVwiXSA9IFwiQ1JFQVRFXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcImpvaW5cIl0gPSBcIkpPSU5cIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wicGluZ1wiXSA9IFwiUElOR1wiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJjaGFuZ2VOYW1lXCJdID0gXCJDSEFOR0VfTkFNRVwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJsZWF2ZVwiXSA9IFwiTEVBVkVcIjtcclxufSkoQ2xpZW50UmVxdWVzdFR5cGUgfHwgKENsaWVudFJlcXVlc3RUeXBlID0ge30pKTtcclxuIiwiaW1wb3J0IHsgQ2xpZW50UmVxdWVzdFR5cGUgfSBmcm9tIFwiLi4vcmVwbGljYXRpb25fd3MvdHlwZXNcIjtcclxuLyogZm9yIHJlZmVyZW5jZSBvbmx5XHJcbmNvbnN0IG5ld0Nvbm5lY3Rpb24gPSAoXHJcbiAgdXJpOiBzdHJpbmcsXHJcbiAgb25PcGVuOiAoZXY6IEV2ZW50KSA9PiBhbnksXHJcbiAgb25NZXNzYWdlOiAoZXY6IE1lc3NhZ2VFdmVudCkgPT4gYW55LFxyXG4gIG9uQ2xvc2U6IChldjogQ2xvc2VFdmVudCkgPT4gYW55LFxyXG4gIG9uRXJyb3I6IChldjogRXZlbnQpID0+IGFueVxyXG4pOiBXZWJTb2NrZXQgPT4ge1xyXG4gIGxldCB3cyA9IG5ldyBXZWJTb2NrZXQodXJpKTtcclxuICB3cy5vbm9wZW4gPSBvbk9wZW47XHJcbiAgd3Mub25tZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQpOiBhbnkgPT4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcIm1lc3NhZ2U6IFwiLCBldi5kYXRhKTtcclxuICAgIG9uTWVzc2FnZShldik7XHJcbiAgfTtcclxuICB3cy5vbmNsb3NlID0gKGV2OiBDbG9zZUV2ZW50KTogYW55ID0+IHtcclxuICAgIG9uQ2xvc2UoZXYpO1xyXG4gIH07XHJcbiAgd3Mub25lcnJvciA9IG9uRXJyb3I7XHJcbiAgcmV0dXJuIHdzO1xyXG59XHJcbiovXHJcbmV4cG9ydCBjb25zdCBzZW5kID0gKHdzLCBtZXNzYWdlKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNlbmRQaW5nID0gKHdzKSA9PiB7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwic2VuZGluZyBwaW5nXCIpXHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUucGluZyB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gKHdzLCBzZXJpemFibGVTdGF0ZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmNyZWF0ZSwgcGF5bG9hZDogeyBzdGF0ZTogc2VyaXphYmxlU3RhdGUgfSB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBqb2luU2Vzc2lvbiA9ICh3cywgc2Vzc2lvbklkKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUuam9pbiwgcGF5bG9hZDogeyBzZXNzaW9uSWQgfSB9KSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjaGFuZ2VOYW1lID0gKHdzLCBuYW1lKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUuY2hhbmdlTmFtZSwgcGF5bG9hZDogeyBuYW1lIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgbGVhdmVTZXNzaW9uID0gKHdzKSA9PiB7XHJcbiAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogQ2xpZW50UmVxdWVzdFR5cGUubGVhdmUgfSkpO1xyXG4gICAgd3MuY2xvc2UoKTtcclxufTtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0bG9hZGVkOiBmYWxzZSxcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG5cdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbi8vIHRoZSBzdGFydHVwIGZ1bmN0aW9uXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnggPSAoKSA9PiB7XG5cdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuXHQvLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcblx0dmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19hbnRkX2VzX25vdGlmaWNhdGlvbl9pbmRleF9qcy1ub2RlX21vZHVsZXNfYXhpb3NfbGliX2F4aW9zX2pzXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3JlcGxpY2F0aW9uX3dzL2Nvbm5lY3Rpb25Xb3JrZXIudHNcIikpKVxuXHRfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuXHRyZXR1cm4gX193ZWJwYWNrX2V4cG9ydHNfXztcbn07XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyB0eXBlb2YgY3VycmVudCA9PSAnb2JqZWN0JyAmJiAhfmxlYWZQcm90b3R5cGVzLmluZGV4T2YoY3VycmVudCk7IGN1cnJlbnQgPSBnZXRQcm90byhjdXJyZW50KSkge1xuXHRcdE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGN1cnJlbnQpLmZvckVhY2goKGtleSkgPT4gKGRlZltrZXldID0gKCkgPT4gKHZhbHVlW2tleV0pKSk7XG5cdH1cblx0ZGVmWydkZWZhdWx0J10gPSAoKSA9PiAodmFsdWUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGRlZik7XG5cdHJldHVybiBucztcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5mID0ge307XG4vLyBUaGlzIGZpbGUgY29udGFpbnMgb25seSB0aGUgZW50cnkgY2h1bmsuXG4vLyBUaGUgY2h1bmsgbG9hZGluZyBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18uZSA9IChjaHVua0lkKSA9PiB7XG5cdHJldHVybiBQcm9taXNlLmFsbChPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLmYpLnJlZHVjZSgocHJvbWlzZXMsIGtleSkgPT4ge1xuXHRcdF9fd2VicGFja19yZXF1aXJlX18uZltrZXldKGNodW5rSWQsIHByb21pc2VzKTtcblx0XHRyZXR1cm4gcHJvbWlzZXM7XG5cdH0sIFtdKSk7XG59OyIsIi8vIFRoaXMgZnVuY3Rpb24gYWxsb3cgdG8gcmVmZXJlbmNlIGFzeW5jIGNodW5rcyBhbmQgc2libGluZyBjaHVua3MgZm9yIHRoZSBlbnRyeXBvaW50XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnUgPSAoY2h1bmtJZCkgPT4ge1xuXHQvLyByZXR1cm4gdXJsIGZvciBmaWxlbmFtZXMgYmFzZWQgb24gdGVtcGxhdGVcblx0cmV0dXJuIFwiXCIgKyBjaHVua0lkICsgXCIuYXBwLmpzXCI7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5obWQgPSAobW9kdWxlKSA9PiB7XG5cdG1vZHVsZSA9IE9iamVjdC5jcmVhdGUobW9kdWxlKTtcblx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdHNldDogKCkgPT4ge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFUyBNb2R1bGVzIG1heSBub3QgYXNzaWduIG1vZHVsZS5leHBvcnRzIG9yIGV4cG9ydHMuKiwgVXNlIEVTTSBleHBvcnQgc3ludGF4LCBpbnN0ZWFkOiAnICsgbW9kdWxlLmlkKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbW9kdWxlO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjO1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHtcblx0XHRcdHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxO1xuXHRcdFx0d2hpbGUgKGkgPiAtMSAmJiAoIXNjcmlwdFVybCB8fCAhL15odHRwKHM/KTovLnRlc3Qoc2NyaXB0VXJsKSkpIHNjcmlwdFVybCA9IHNjcmlwdHNbaS0tXS5zcmM7XG5cdFx0fVxuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgY2h1bmtzXG4vLyBcIjFcIiBtZWFucyBcImFscmVhZHkgbG9hZGVkXCJcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwic3JjX3JlcGxpY2F0aW9uX3dzX2Nvbm5lY3Rpb25Xb3JrZXJfdHNcIjogMVxufTtcblxuLy8gaW1wb3J0U2NyaXB0cyBjaHVuayBsb2FkaW5nXG52YXIgaW5zdGFsbENodW5rID0gKGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Zm9yKHZhciBtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdH1cblx0fVxuXHRpZihydW50aW1lKSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR3aGlsZShjaHVua0lkcy5sZW5ndGgpXG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRzLnBvcCgpXSA9IDE7XG5cdHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xufTtcbl9fd2VicGFja19yZXF1aXJlX18uZi5pID0gKGNodW5rSWQsIHByb21pc2VzKSA9PiB7XG5cdC8vIFwiMVwiIGlzIHRoZSBzaWduYWwgZm9yIFwiYWxyZWFkeSBsb2FkZWRcIlxuXHRpZighaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0aWYodHJ1ZSkgeyAvLyBhbGwgY2h1bmtzIGhhdmUgSlNcblx0XHRcdGltcG9ydFNjcmlwdHMoX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgX193ZWJwYWNrX3JlcXVpcmVfXy51KGNodW5rSWQpKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rc3F1YWRzdHJhdFwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtzcXVhZHN0cmF0XCJdIHx8IFtdO1xudmFyIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uID0gY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSBpbnN0YWxsQ2h1bms7XG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3QiLCJ2YXIgbmV4dCA9IF9fd2VicGFja19yZXF1aXJlX18ueDtcbl9fd2VicGFja19yZXF1aXJlX18ueCA9ICgpID0+IHtcblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uZShcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2FudGRfZXNfbm90aWZpY2F0aW9uX2luZGV4X2pzLW5vZGVfbW9kdWxlc19heGlvc19saWJfYXhpb3NfanNcIikudGhlbihuZXh0KTtcbn07IiwiIiwiLy8gcnVuIHN0YXJ0dXBcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy54KCk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=