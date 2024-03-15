import {Store0, StoreState} from "../store";
import {getEntitiesByType} from "../world/world";
import {Target, Weapon} from "../world/types";
import {getTranslation} from "../world/transformations";
import {getHeight} from "../heightmap/heightmap";
import {getMortarFiringSolution} from "../world/projectilePhysics";
import {US_MIL} from "../world/constants";
import {state} from "sucrase/dist/types/parser/traverser/base";
import {getSolution} from "../common/mapData";
import {notification} from "antd";


interface WebSocketManagerOptions {
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

interface MessageListener {
    (message: string): void;
}



class WebSocketManager {
    private store: Store0;
    private url: string;
    private options: WebSocketManagerOptions;
    private websocket: WebSocket | null = null;
    private status: string = 'disconnected';
    private messageListeners: MessageListener[] = [];

    constructor(url: string, options: WebSocketManagerOptions = {}, store: Store0) {
        this.url = url;
        this.options = options;
        this.store = store
    }

    connect = () => {
        if (this.status === 'connected' || this.status === 'connecting') {
            return;
        }

        this.setStatus('connecting');
        this.websocket = new WebSocket(this.url);

        this.websocket.onopen = () => {
            this.setStatus('connected');
            console.log('WebSocket connected');
        };

        this.websocket.onmessage = (event) => {
            let msg = JSON.parse(event.data)
            if(msg.command==="compute"){
                const state = this.store.getState()
                const targets = getEntitiesByType<Target>(state.world, "Target");
                let target = targets.filter(t => t.entityId === parseInt(msg.payload))[0]
                let {solution, angleValue} = getSolution(state, target)
                this.sendMessage(JSON.stringify({
                    "command":"SET",
                    "payload":{
                        entityId:target.entityId,
                        dir: solution.dir,
                        angle: angleValue >> 0,
                    }
                }))
            }
            else if(msg.command==="ERROR"){
                notification.error({
                    message: '警告',
                    description: msg.payload,
                });
                this.options.autoReconnect=false
            }

            // this.notifyMessageListeners(event.data);
        };

        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            if (this.options.autoReconnect) {
                this.setStatus('reconnecting');
                setTimeout(this.connect, this.options.reconnectInterval || 5000);
            } else {
                this.setStatus('disconnected');
            }
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error', error);
            this.websocket?.close();
        };
    }

    disconnect = () => {
        if (this.websocket) {
            this.websocket.close();
        }
    }

    sendMessage = (message: string) => {
        if (this.status === 'connected' && this.websocket) {
            this.websocket.send(message);
        }
    }

    addMessageListener = (listener: MessageListener) => {
        this.messageListeners.push(listener);
    }

    removeMessageListener = (listener: MessageListener) => {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    private setStatus = (status: string) => {
        this.status = status;
    }

    private notifyMessageListeners = (message: string) => {
        this.messageListeners.forEach(listener => listener(message));
    }
}

export default WebSocketManager;
