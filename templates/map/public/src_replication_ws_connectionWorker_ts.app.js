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
const baseURL = "http://127.0.0.1:8080/";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlcGxpY2F0aW9uX3dzX2Nvbm5lY3Rpb25Xb3JrZXJfdHMuYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBMEI7QUFDVTtBQUNwQyw2Q0FBSztBQUNMO0FBQ0EsUUFBUSw0Q0FBWTtBQUNwQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjtBQUNPO0FBQ1AsV0FBVyw2Q0FBSztBQUNoQjs7Ozs7Ozs7Ozs7Ozs7O0FDekMrRTtBQUNuQztBQUNJO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDREQUFhO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFlBQVksNERBQWE7QUFDekI7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDREQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHNEQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsOEJBQThCLFVBQVU7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLCtEQUFnQjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNkRBQWM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsMERBQVc7QUFD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V0FDQSxFQUFFO1dBQ0Y7Ozs7O1dDUkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NKQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7Ozs7O1dDVkE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsYUFBYTtXQUNiO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7Ozs7V0NwQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1VFSEE7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvYXBpL3N0YW5kYXJkLnRzIiwid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3MvY29ubmVjdGlvbldvcmtlci50cyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlcGxpY2F0aW9uX3dzL3R5cGVzLnRzIiwid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVwbGljYXRpb25fd3Mvd2Vic29ja2V0UHJpbWl0aXZlcy50cyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9oYXJtb255IG1vZHVsZSBkZWNvcmF0b3IiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL3NxdWFkc3RyYXQvd2VicGFjay9ydW50aW1lL2ltcG9ydFNjcmlwdHMgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svcnVudGltZS9zdGFydHVwIGNodW5rIGRlcGVuZGVuY2llcyIsIndlYnBhY2s6Ly9zcXVhZHN0cmF0L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgeyBub3RpZmljYXRpb24gfSBmcm9tICdhbnRkJztcclxuYXhpb3MuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZShyZXMgPT4ge1xyXG4gICAgaWYgKHJlcy5kYXRhLnN1Y2Nlc3MgIT09IDApIHtcclxuICAgICAgICBub3RpZmljYXRpb24uZXJyb3Ioe1xyXG4gICAgICAgICAgICBtZXNzYWdlOiAn6K2m5ZGKJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlcy5kYXRhLm1lc3NhZ2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlcyk7XHJcbiAgICB9XHJcbiAgICAvLyDlr7nlk43lupTmlbDmja7lgZrngrnku4DkuYhcclxuICAgIHJldHVybiByZXM7XHJcbn0sIGVycm9yID0+IHtcclxuICAgIC8vIOWvueWTjeW6lOmUmeivr+WBmueCueS7gOS5iFxyXG4gICAgLy8gaWYgKGVycm9yLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAvLyAgICAgLy8g5aSE55CG5pyq5o6I5p2D55qE5oOF5Ya1XHJcbiAgICAvLyAgICAgLy8g5L6L5aaC6YeN5a6a5ZCR5Yiw55m75b2V6aG16Z2iXHJcbiAgICAvLyB9XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG59KTtcclxuY29uc3QgYmFzZVVSTCA9IFwiaHR0cDovLzEyNy4wLjAuMTo4MDgwL1wiO1xyXG5leHBvcnQgY29uc3Qgc2F2ZSA9IChkYXRhKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MucG9zdChiYXNlVVJMICsgXCJzYXZlXCIsIGRhdGEpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcmVtb3ZlID0gKGRhdGEpID0+IHtcclxuICAgIHJldHVybiBheGlvcy5wb3N0KGJhc2VVUkwgKyBcInJlbW92ZVwiLCBkYXRhKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHVwZGF0ZSA9IChkYXRhKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MucG9zdChiYXNlVVJMICsgXCJ1cGRhdGVcIiwgZGF0YSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCByZW1vdmVfYWxsID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIGF4aW9zLmdldChiYXNlVVJMICsgXCJyZW1vdmVfYWxsXCIpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2V0X3Nlc3Npb25fdXNlcklkID0gKHVzZXJJZCkgPT4ge1xyXG4gICAgcmV0dXJuIGF4aW9zLmdldChiYXNlVVJMICsgXCJzZXRfc2Vzc2lvbl91c2VySWQ/dXNlcklkPVwiICsgdXNlcklkKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNldF9zZXNzaW9uSWQgPSAoc2Vzc2lvbklkKSA9PiB7XHJcbiAgICByZXR1cm4gYXhpb3MuZ2V0KGJhc2VVUkwgKyBcInNldF9zZXNzaW9uSWQ/c2Vzc2lvbklkPVwiICsgc2Vzc2lvbklkKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNldF9zZXJ2ZXJfaXAgPSAoYWRkcmVzcykgPT4ge1xyXG4gICAgcmV0dXJuIGF4aW9zLmdldChiYXNlVVJMICsgXCJzZXRfc2VydmVyX2lwP2FkZHJlc3M9XCIgKyBhZGRyZXNzKTtcclxufTtcclxuIiwiaW1wb3J0IHsgUmVwbGljYXRpb25BY3Rpb25UeXBlIGFzIFJBVCwgUmVwbGljYXRpb25NZXNzYWdlVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XHJcbmltcG9ydCAqIGFzIFdTIGZyb20gXCIuL3dlYnNvY2tldFByaW1pdGl2ZXNcIjtcclxuaW1wb3J0IHsgc2V0X3NlcnZlcl9pcCB9IGZyb20gXCIuLi9hcGkvc3RhbmRhcmRcIjtcclxuLy9jb25zb2xlLmxvZyhcIndlYndvcmtlciBydW5uaW5nXCIpXHJcbmxldCB3cyA9IG51bGw7XHJcbmxldCBzZXNzaW9uSWQgPSBudWxsO1xyXG5sZXQgcGluZ1RpbWVyID0gbnVsbDtcclxubGV0IHdzQ2xvc2VkID0gZmFsc2U7XHJcbi8vIFdvcmtlciAnSU8nXHJcbm9ubWVzc2FnZSA9IChlKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZSA9IGUuZGF0YTtcclxuICAgIHN3aXRjaCAobWVzc2FnZS5mdW5jKSB7XHJcbiAgICAgICAgY2FzZSBcIkNSRUFURVwiOlxyXG4gICAgICAgICAgICB3cyA9IGNyZWF0ZShtZXNzYWdlLnBheWxvYWQuc2VydmVyQWRkcmVzcywgbWVzc2FnZS5wYXlsb2FkLnNlcmlhbGl6YWJsZVN0YXRlKTtcclxuICAgICAgICAgICAgc2V0X3NlcnZlcl9pcChtZXNzYWdlLnBheWxvYWQuc2VydmVyQWRkcmVzcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNhc2UgXCJKT0lOXCI6XHJcbiAgICAgICAgICAgIHdzID0gam9pbihtZXNzYWdlLnBheWxvYWQuc2VydmVyQWRkcmVzcywgbWVzc2FnZS5wYXlsb2FkLnNlc3Npb25JZCk7XHJcbiAgICAgICAgICAgIHNldF9zZXJ2ZXJfaXAobWVzc2FnZS5wYXlsb2FkLnNlcnZlckFkZHJlc3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiQ0hBTkdFX05BTUVcIjpcclxuICAgICAgICAgICAgaWYgKHdzICYmIHNlc3Npb25JZClcclxuICAgICAgICAgICAgICAgIFdTLmNoYW5nZU5hbWUod3MsIG1lc3NhZ2UucGF5bG9hZC5uZXdOYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY2FzZSBcIlRFUk1JTkFURVwiOlxyXG4gICAgICAgICAgICBpZiAod3MpXHJcbiAgICAgICAgICAgICAgICB0ZXJtaW5hdGUod3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICBjYXNlIFwiU0VORFwiOlxyXG4gICAgICAgICAgICBpZiAod3MgJiYgc2Vzc2lvbklkKVxyXG4gICAgICAgICAgICAgICAgV1Muc2VuZCh3cywgbWVzc2FnZS5wYXlsb2FkLm1lc3NhZ2UpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG5jb25zdCBzZW5kVG9NYWluID0gKG1lc3NhZ2UpID0+IHtcclxuICAgIHBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xyXG59O1xyXG5jb25zdCBkaXNwYXRjaCA9IChhY3Rpb24pID0+IHtcclxuICAgIHNlbmRUb01haW4oeyBldmVudDogXCJESVNQQVRDSFwiLCBwYXlsb2FkOiB7IGFjdGlvbiB9IH0pO1xyXG59O1xyXG4vLyBDb25uZWN0aW9uIHNldHVwXHJcbmNvbnN0IGNvbnN0cnVjdG9yID0gKHNlcnZlckFkZHJlc3MpID0+IHtcclxuICAgIGxldCB3cyA9IG5ldyBXZWJTb2NrZXQoc2VydmVyQWRkcmVzcyk7XHJcbiAgICB3cy5vbm1lc3NhZ2UgPSAoZXYpID0+IG9uTWVzc2FnZShldik7XHJcbiAgICB3cy5vbmNsb3NlID0gKGV2KSA9PiBvbkNsb3NlKGV2KTtcclxuICAgIHdzLm9uZXJyb3IgPSAoZXYpID0+IG9uRXJyb3IoZXYpO1xyXG4gICAgcmV0dXJuIHdzO1xyXG59O1xyXG5jb25zdCBjcmVhdGUgPSAoc2VydmVyQWRkcmVzcywgc2VyaWFsaXphYmxlU3RhdGUpID0+IHtcclxuICAgIGxldCB3cyA9IGNvbnN0cnVjdG9yKHNlcnZlckFkZHJlc3MpO1xyXG4gICAgc3RhcnRQaW5nVGltZXIod3MpO1xyXG4gICAgd3Mub25vcGVuID0gKGV2KSA9PiB7XHJcbiAgICAgICAgV1MuY3JlYXRlU2Vzc2lvbih3cywgc2VyaWFsaXphYmxlU3RhdGUpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB3cztcclxufTtcclxuY29uc3Qgam9pbiA9IChzZXJ2ZXJBZGRyZXNzLCBzZXNzaW9uSWQpID0+IHtcclxuICAgIGxldCB3cyA9IGNvbnN0cnVjdG9yKHNlcnZlckFkZHJlc3MpO1xyXG4gICAgc3RhcnRQaW5nVGltZXIod3MpO1xyXG4gICAgd3Mub25vcGVuID0gKGV2KSA9PiB7XHJcbiAgICAgICAgV1Muam9pblNlc3Npb24od3MsIHNlc3Npb25JZCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHdzO1xyXG59O1xyXG5jb25zdCBzdGFydFBpbmdUaW1lciA9ICh3cykgPT4ge1xyXG4gICAgcGluZ1RpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIFdTLnNlbmRQaW5nKHdzKTtcclxuICAgIH0sIDEwMDApO1xyXG59O1xyXG4vLyB0ZWFyZG93blxyXG5jb25zdCB0ZXJtaW5hdGUgPSAod3MpID0+IHtcclxuICAgIHdzQ2xvc2VkID0gdHJ1ZTtcclxuICAgIHNlc3Npb25JZCA9IG51bGw7XHJcbiAgICBpZiAocGluZ1RpbWVyICE9PSBudWxsKVxyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwocGluZ1RpbWVyKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgV1MubGVhdmVTZXNzaW9uKHdzKTtcclxuICAgICAgICB3cy5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgIC8vIG5vdGhpbmcgdG8gZG8gaGVyZS5cclxuICAgIH1cclxufTtcclxuLy8gV2Vic29ja2V0IGJlaGF2aW9yXHJcbmNvbnN0IG9uTWVzc2FnZSA9IChldikgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2LmRhdGEpO1xyXG4gICAgaWYgKG1lc3NhZ2UuY29tbWFuZCA9PSBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlLmVycm9yKSB7XHJcbiAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBSQVQucmVjZWl2ZU1lc3NhZ2UsIHBheWxvYWQ6IHsgbWVzc2FnZSwgc2Vzc2lvbklkOiBcIlwiIH0gfSk7XHJcbiAgICB9XHJcbiAgICBpZiAobWVzc2FnZS5jb21tYW5kID09IFJlcGxpY2F0aW9uTWVzc2FnZVR5cGUuam9pbmVkKSB7XHJcbiAgICAgICAgc2Vzc2lvbklkID0gbWVzc2FnZS5wYXlsb2FkLnNlc3Npb25JZDtcclxuICAgICAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiU0VTU0lPTl9JRFwiLCBwYXlsb2FkOiBtZXNzYWdlLnBheWxvYWQgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoc2Vzc2lvbklkICE9PSBudWxsKSB7XHJcbiAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBSQVQucmVjZWl2ZU1lc3NhZ2UsIHBheWxvYWQ6IHsgbWVzc2FnZSwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgfSB9KTtcclxuICAgIH1cclxufTtcclxuY29uc3Qgb25DbG9zZSA9IChldikgPT4ge1xyXG4gICAgaWYgKHdzKVxyXG4gICAgICAgIHRlcm1pbmF0ZSh3cyk7XHJcbiAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiQ0xPU0VcIiB9KTtcclxufTtcclxuY29uc3Qgb25FcnJvciA9IChldikgPT4ge1xyXG4gICAgaWYgKHdzKVxyXG4gICAgICAgIHRlcm1pbmF0ZSh3cyk7XHJcbiAgICBzZW5kVG9NYWluKHsgZXZlbnQ6IFwiRVJST1JcIiwgcGF5bG9hZDogeyBtc2c6IFwiXCIgfSB9KTtcclxufTtcclxuIiwiZXhwb3J0IGNvbnN0IG5ld1Nlc3Npb24gPSAoKSA9PiAoe1xyXG4gICAgc2Vzc2lvbklkOiBcIlwiLFxyXG4gICAgdXNlcklkOiBcIlwiLFxyXG4gICAgdXNlcnM6IG5ldyBNYXAoKSxcclxufSk7XHJcbmV4cG9ydCBjb25zdCBuZXdSZXBsaWNhdGlvblN0YXRlID0gKCkgPT4gKHtcclxuICAgIGNvbm5lY3Rpb25TdGF0ZTogXCJjbG9zZWRcIixcclxuICAgIHNlc3Npb25JZDogbnVsbCxcclxufSk7XHJcbmV4cG9ydCB2YXIgUmVwbGljYXRpb25BY3Rpb25UeXBlO1xyXG4oZnVuY3Rpb24gKFJlcGxpY2F0aW9uQWN0aW9uVHlwZSkge1xyXG4gICAgUmVwbGljYXRpb25BY3Rpb25UeXBlW1wiY3JlYXRpbmdTZXNzaW9uXCJdID0gXCJSRVBMSUNBVElPTl9DUkVBVElOR19TRVNTSU9OXCI7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjb25uZWN0aW9uUmVhZHlcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fUkVBRFlcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcImNvbm5lY3Rpb25DbG9zZWRcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fQ0xPU0VEXCI7XHJcbiAgICBSZXBsaWNhdGlvbkFjdGlvblR5cGVbXCJjb25uZWN0aW9uRXJyb3JcIl0gPSBcIlJFUExJQ0FUSU9OX0NPTk5FQ1RJT05fRVJST1JcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcInJlY2VpdmVNZXNzYWdlXCJdID0gXCJSRVBMSUNBVElPTl9SRUNFSVZFX01FU1NBR0VcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcInNlbmRQaW5nXCJdID0gXCJSRVBMSUNBVElPTl9TRU5EX1BJTkdcIjtcclxuICAgIFJlcGxpY2F0aW9uQWN0aW9uVHlwZVtcIm5vb3BcIl0gPSBcIlJFUExJQ0FUSU9OX05PT1BcIjtcclxufSkoUmVwbGljYXRpb25BY3Rpb25UeXBlIHx8IChSZXBsaWNhdGlvbkFjdGlvblR5cGUgPSB7fSkpO1xyXG47XHJcbmV4cG9ydCB2YXIgU2Vzc2lvbkFjdGlvblR5cGU7XHJcbihmdW5jdGlvbiAoU2Vzc2lvbkFjdGlvblR5cGUpIHtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiY3JlYXRlXCJdID0gXCJTRVNTSU9OX0NSRUFURVwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJzdGFydGVkXCJdID0gXCJTRVNTSU9OX1NUQVJURURcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiZW5kZWRcIl0gPSBcIlNFU1NJT05fRU5ERURcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wiam9pblwiXSA9IFwiU0VTU0lPTl9KT0lOXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImxlYXZlXCJdID0gXCJTRVNTSU9OX0xFQVZFXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcImFkZFVzZXJcIl0gPSBcIlNFU1NJT05fQUREX1VTRVJcIjtcclxuICAgIFNlc3Npb25BY3Rpb25UeXBlW1wicmVtb3ZlVXNlclwiXSA9IFwiU0VTU0lPTl9SRU1PVkVfVVNFUlwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJjaGFuZ2VVc2VyTmFtZVwiXSA9IFwiU0VTU0lPTl9DSEFOR0VfVVNFUl9OQU1FXCI7XHJcbiAgICBTZXNzaW9uQWN0aW9uVHlwZVtcInVzZXJOYW1lQ2hhbmdlZFwiXSA9IFwiU0VTU0lPTl9VU0VSX05BTUVfQ0hBTkdFRFwiO1xyXG4gICAgU2Vzc2lvbkFjdGlvblR5cGVbXCJzZW5kTWVzc2FnZVwiXSA9IFwiUkVQTElDQVRJT05fU0VORF9NRVNTQUdFXCI7XHJcbn0pKFNlc3Npb25BY3Rpb25UeXBlIHx8IChTZXNzaW9uQWN0aW9uVHlwZSA9IHt9KSk7XHJcbjtcclxuZXhwb3J0IGNvbnN0IG5ld1VzZXIgPSAoaWQsIG5hbWUpID0+ICh7XHJcbiAgICBpZCxcclxuICAgIG5hbWVcclxufSk7XHJcbmV4cG9ydCB2YXIgUmVwbGljYXRpb25NZXNzYWdlVHlwZTtcclxuKGZ1bmN0aW9uIChSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlKSB7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1wiYWN0aW9uXCJdID0gXCJBQ1RJT05cIjtcclxuICAgIC8vY3JlYXRlZCA9IFwiQ1JFQVRFRFwiLCAvLyBzZXJ2ZXIgZG9lcyBub3QgdGVsbCB5b3UgdGhhdFxyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcImpvaW5lZFwiXSA9IFwiSk9JTkVEXCI7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1widXNlckpvaW5lZFwiXSA9IFwiVVNFUl9KT0lORURcIjtcclxuICAgIFJlcGxpY2F0aW9uTWVzc2FnZVR5cGVbXCJ1c2VyTGVmdFwiXSA9IFwiVVNFUl9MRUZUXCI7XHJcbiAgICBSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlW1widXNlckNoYW5nZWROYW1lXCJdID0gXCJVU0VSX0NIQU5HRURfTkFNRVwiO1xyXG4gICAgUmVwbGljYXRpb25NZXNzYWdlVHlwZVtcImVycm9yXCJdID0gXCJFUlJPUlwiO1xyXG59KShSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlIHx8IChSZXBsaWNhdGlvbk1lc3NhZ2VUeXBlID0ge30pKTtcclxuZXhwb3J0IHZhciBDbGllbnRSZXF1ZXN0VHlwZTtcclxuKGZ1bmN0aW9uIChDbGllbnRSZXF1ZXN0VHlwZSkge1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJhY3Rpb25cIl0gPSBcIkFDVElPTlwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJjcmVhdGVcIl0gPSBcIkNSRUFURVwiO1xyXG4gICAgQ2xpZW50UmVxdWVzdFR5cGVbXCJqb2luXCJdID0gXCJKT0lOXCI7XHJcbiAgICBDbGllbnRSZXF1ZXN0VHlwZVtcInBpbmdcIl0gPSBcIlBJTkdcIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wiY2hhbmdlTmFtZVwiXSA9IFwiQ0hBTkdFX05BTUVcIjtcclxuICAgIENsaWVudFJlcXVlc3RUeXBlW1wibGVhdmVcIl0gPSBcIkxFQVZFXCI7XHJcbn0pKENsaWVudFJlcXVlc3RUeXBlIHx8IChDbGllbnRSZXF1ZXN0VHlwZSA9IHt9KSk7XHJcbiIsImltcG9ydCB7IENsaWVudFJlcXVlc3RUeXBlIH0gZnJvbSBcIi4uL3JlcGxpY2F0aW9uX3dzL3R5cGVzXCI7XHJcbi8qIGZvciByZWZlcmVuY2Ugb25seVxyXG5jb25zdCBuZXdDb25uZWN0aW9uID0gKFxyXG4gIHVyaTogc3RyaW5nLFxyXG4gIG9uT3BlbjogKGV2OiBFdmVudCkgPT4gYW55LFxyXG4gIG9uTWVzc2FnZTogKGV2OiBNZXNzYWdlRXZlbnQpID0+IGFueSxcclxuICBvbkNsb3NlOiAoZXY6IENsb3NlRXZlbnQpID0+IGFueSxcclxuICBvbkVycm9yOiAoZXY6IEV2ZW50KSA9PiBhbnlcclxuKTogV2ViU29ja2V0ID0+IHtcclxuICBsZXQgd3MgPSBuZXcgV2ViU29ja2V0KHVyaSk7XHJcbiAgd3Mub25vcGVuID0gb25PcGVuO1xyXG4gIHdzLm9ubWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50KTogYW55ID0+IHtcclxuICAgIC8vY29uc29sZS5sb2coXCJtZXNzYWdlOiBcIiwgZXYuZGF0YSk7XHJcbiAgICBvbk1lc3NhZ2UoZXYpO1xyXG4gIH07XHJcbiAgd3Mub25jbG9zZSA9IChldjogQ2xvc2VFdmVudCk6IGFueSA9PiB7XHJcbiAgICBvbkNsb3NlKGV2KTtcclxuICB9O1xyXG4gIHdzLm9uZXJyb3IgPSBvbkVycm9yO1xyXG4gIHJldHVybiB3cztcclxufVxyXG4qL1xyXG5leHBvcnQgY29uc3Qgc2VuZCA9ICh3cywgbWVzc2FnZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzZW5kUGluZyA9ICh3cykgPT4ge1xyXG4gICAgLy9jb25zb2xlLmxvZyhcInNlbmRpbmcgcGluZ1wiKVxyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLnBpbmcgfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9ICh3cywgc2VyaXphYmxlU3RhdGUpID0+IHtcclxuICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBjb21tYW5kOiBDbGllbnRSZXF1ZXN0VHlwZS5jcmVhdGUsIHBheWxvYWQ6IHsgc3RhdGU6IHNlcml6YWJsZVN0YXRlIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgam9pblNlc3Npb24gPSAod3MsIHNlc3Npb25JZCkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmpvaW4sIHBheWxvYWQ6IHsgc2Vzc2lvbklkIH0gfSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY2hhbmdlTmFtZSA9ICh3cywgbmFtZSkgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmNoYW5nZU5hbWUsIHBheWxvYWQ6IHsgbmFtZSB9IH0pKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGxlYXZlU2Vzc2lvbiA9ICh3cykgPT4ge1xyXG4gICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7IGNvbW1hbmQ6IENsaWVudFJlcXVlc3RUeXBlLmxlYXZlIH0pKTtcclxuICAgIHdzLmNsb3NlKCk7XHJcbn07XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdGxvYWRlZDogZmFsc2UsXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuXHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4vLyB0aGUgc3RhcnR1cCBmdW5jdGlvblxuX193ZWJwYWNrX3JlcXVpcmVfXy54ID0gKCkgPT4ge1xuXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcblx0Ly8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG5cdHZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfYW50ZF9lc19ub3RpZmljYXRpb25faW5kZXhfanMtbm9kZV9tb2R1bGVzX2F4aW9zX2xpYl9heGlvc19qc1wiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9yZXBsaWNhdGlvbl93cy9jb25uZWN0aW9uV29ya2VyLnRzXCIpKSlcblx0X193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcblx0cmV0dXJuIF9fd2VicGFja19leHBvcnRzX187XG59O1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsInZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiA/IChvYmopID0+IChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgOiAob2JqKSA9PiAob2JqLl9fcHJvdG9fXyk7XG52YXIgbGVhZlByb3RvdHlwZXM7XG4vLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3Rcbi8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuLy8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4vLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3Rcbi8vIG1vZGUgJiAxNjogcmV0dXJuIHZhbHVlIHdoZW4gaXQncyBQcm9taXNlLWxpa2Vcbi8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbl9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG5cdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IHRoaXModmFsdWUpO1xuXHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuXHRpZih0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlKSB7XG5cdFx0aWYoKG1vZGUgJiA0KSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG5cdFx0aWYoKG1vZGUgJiAxNikgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWx1ZTtcblx0fVxuXHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuXHR2YXIgZGVmID0ge307XG5cdGxlYWZQcm90b3R5cGVzID0gbGVhZlByb3RvdHlwZXMgfHwgW251bGwsIGdldFByb3RvKHt9KSwgZ2V0UHJvdG8oW10pLCBnZXRQcm90byhnZXRQcm90byldO1xuXHRmb3IodmFyIGN1cnJlbnQgPSBtb2RlICYgMiAmJiB2YWx1ZTsgdHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZiA9IHt9O1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIG9ubHkgdGhlIGVudHJ5IGNodW5rLlxuLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoY2h1bmtJZCkgPT4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5mKS5yZWR1Y2UoKHByb21pc2VzLCBrZXkpID0+IHtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmZba2V5XShjaHVua0lkLCBwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHByb21pc2VzO1xuXHR9LCBbXSkpO1xufTsiLCIvLyBUaGlzIGZ1bmN0aW9uIGFsbG93IHRvIHJlZmVyZW5jZSBhc3luYyBjaHVua3MgYW5kIHNpYmxpbmcgY2h1bmtzIGZvciB0aGUgZW50cnlwb2ludFxuX193ZWJwYWNrX3JlcXVpcmVfXy51ID0gKGNodW5rSWQpID0+IHtcblx0Ly8gcmV0dXJuIHVybCBmb3IgZmlsZW5hbWVzIGJhc2VkIG9uIHRlbXBsYXRlXG5cdHJldHVybiBcIlwiICsgY2h1bmtJZCArIFwiLmFwcC5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18uaG1kID0gKG1vZHVsZSkgPT4ge1xuXHRtb2R1bGUgPSBPYmplY3QuY3JlYXRlKG1vZHVsZSk7XG5cdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgJ2V4cG9ydHMnLCB7XG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRzZXQ6ICgpID0+IHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRVMgTW9kdWxlcyBtYXkgbm90IGFzc2lnbiBtb2R1bGUuZXhwb3J0cyBvciBleHBvcnRzLiosIFVzZSBFU00gZXhwb3J0IHN5bnRheCwgaW5zdGVhZDogJyArIG1vZHVsZS5pZCk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG1vZHVsZTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYztcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTtcblx0XHRcdHdoaWxlIChpID4gLTEgJiYgKCFzY3JpcHRVcmwgfHwgIS9eaHR0cChzPyk6Ly50ZXN0KHNjcmlwdFVybCkpKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGNodW5rc1xuLy8gXCIxXCIgbWVhbnMgXCJhbHJlYWR5IGxvYWRlZFwiXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcInNyY19yZXBsaWNhdGlvbl93c19jb25uZWN0aW9uV29ya2VyX3RzXCI6IDFcbn07XG5cbi8vIGltcG9ydFNjcmlwdHMgY2h1bmsgbG9hZGluZ1xudmFyIGluc3RhbGxDaHVuayA9IChkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdGZvcih2YXIgbW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHR9XG5cdH1cblx0aWYocnVudGltZSkgcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0d2hpbGUoY2h1bmtJZHMubGVuZ3RoKVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkcy5wb3AoKV0gPSAxO1xuXHRwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcbn07XG5fX3dlYnBhY2tfcmVxdWlyZV9fLmYuaSA9IChjaHVua0lkLCBwcm9taXNlcykgPT4ge1xuXHQvLyBcIjFcIiBpcyB0aGUgc2lnbmFsIGZvciBcImFscmVhZHkgbG9hZGVkXCJcblx0aWYoIWluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdGlmKHRydWUpIHsgLy8gYWxsIGNodW5rcyBoYXZlIEpTXG5cdFx0XHRpbXBvcnRTY3JpcHRzKF9fd2VicGFja19yZXF1aXJlX18ucCArIF9fd2VicGFja19yZXF1aXJlX18udShjaHVua0lkKSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua3NxdWFkc3RyYXRcIl0gPSBzZWxmW1wid2VicGFja0NodW5rc3F1YWRzdHJhdFwiXSB8fCBbXTtcbnZhciBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiA9IGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gaW5zdGFsbENodW5rO1xuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0IiwidmFyIG5leHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLng7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnggPSAoKSA9PiB7XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmUoXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19hbnRkX2VzX25vdGlmaWNhdGlvbl9pbmRleF9qcy1ub2RlX21vZHVsZXNfYXhpb3NfbGliX2F4aW9zX2pzXCIpLnRoZW4obmV4dCk7XG59OyIsIiIsIi8vIHJ1biBzdGFydHVwXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18ueCgpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9