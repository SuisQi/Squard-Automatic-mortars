type HandlerFunction = (resolve: (response: any) => void, param?: any) => void;

interface Handlers {
    [key: string]: HandlerFunction;
}

class Hlclient {
    private wsURL: string;
    private handlers: Handlers;
    private socket: WebSocket | undefined;

    constructor(wsURL: string) {
        if (!wsURL) {
            throw new Error('wsURL can not be empty!!');
        }
        this.wsURL = wsURL;
        this.handlers = {
            _execjs: (resolve: (response: any) => void, param: any) => {
                const res = eval(param);
                if (!res) {
                    resolve("没有返回值");
                } else {
                    resolve(res);
                }
            }
        };
        this.socket = undefined;
        this.connect();
    }

    private connect(): void {
        console.log('begin of connect to wsURL: ' + this.wsURL);
        try {
            this.socket = new WebSocket(this.wsURL);
            this.socket.onmessage = (e: MessageEvent) => {
                this.handlerRequest(e.data);
            };
        } catch (e) {
            console.log("connection failed, reconnect after 10s");
            setTimeout(() => {
                this.connect();
            }, 10000);
        }
        if (this.socket) {
            this.socket.onclose = () => {
                console.log('rpc已关闭');
                setTimeout(() => {
                    this.connect();
                }, 10000);
            };
            this.socket.addEventListener('open', () => {
                console.log("rpc连接成功");
            });
            this.socket.addEventListener('error', (event) => {
                console.error('rpc连接出错,请检查是否打开服务端:', event);
            });
        }
    }

    public send(msg: string): void {
        if (this.socket) {
            this.socket.send(msg);
        } else {
            console.error('WebSocket is not connected.');
        }
    }

    public regAction(func_name: string, func: HandlerFunction): boolean {
        if (typeof func_name !== 'string') {
            throw new Error("func_name must be a string");
        }
        if (typeof func !== 'function') {
            throw new Error("must be a function");
        }
        console.log("register func_name: " + func_name);
        this.handlers[func_name] = func;
        return true;
    }

    private handlerRequest(requestJson: string): void {
        let result: any;
        try {
            result = JSON.parse(requestJson);
        } catch (error) {
            console.log("catch error", requestJson);
            result = this.transjson(requestJson);
        }
        if (!result['action']) {
            this.sendResult('', 'need request param {action}');
            return;
        }
        const action = result["action"];
        const theHandler = this.handlers[action];
        if (!theHandler) {
            this.sendResult(action, 'action not found');
            return;
        }
        try {
            if (!result["param"]) {
                theHandler((response: any) => {
                    this.sendResult(action, response);
                });
                return;
            }
            let param = result["param"];
            try {
                param = JSON.parse(param);
            } catch (e) {}
            theHandler((response: any) => {
                this.sendResult(action, response);
            }, param);
        } catch (e) {
            console.log("error: " + e);
            this.sendResult(action, e);
        }
    }

    private sendResult(action: string, e: any): void {
        if (typeof e === 'object' && e !== null) {
            try {
                e = JSON.stringify(e);
            } catch (v) {
                console.log(v); // 不是json无需操作
            }
        }
        this.send(action + atob("aGxeX14") + e);
    }

    private transjson(formdata: string): any {
        const regex = /"action":(?<actionName>.*?),/g;
        const actionName = regex.exec(formdata)?.groups?.actionName;
        if (!actionName) {
            throw new Error('Invalid format');
        }
        let stringfystring = formdata.match(/{..data..:.*..\w+..:\s...*?..}/g)?.pop() ?? '';
        stringfystring = stringfystring.replace(/\\"/g, '"');
        const paramstring = JSON.parse(stringfystring);
        const tens = `{"action":${actionName},"param":{}}`;
        const tjson = JSON.parse(tens);
        tjson.param = paramstring;
        return tjson;
    }
}


export const hl = new Hlclient(`ws://${(typeof window!=="undefined")?window.location.hostname:self.location.hostname}:12080/ws?group=map`)
