import {Store} from 'redux';
import {$map_name, $canvas} from './elements';
import {dispatch, Store0} from './store';
import {newUserSettingsWriteAction as writeUserSettings} from './ui/actions';
import {drawAll} from './render/canvas';
import {
    mouseMove,
    mouseScroll,
    mouseDown,
    mouseUp,
    doubleClick,
    click,
    handleTouchMove,
    handleNewTouch,
    handleTouchEnd,
    rightClick
} from './ui/ui';
import WebSocketManager from "./replication_ws/connect_local";
import {remove_all, set_session_userId} from "./api/standard";


function startup() {
    var el = document.getElementById("canvas");
    var f = (msg: string) => (ev: any) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
    }
    el?.addEventListener("touchstart", f("touchstart"), {passive: true});
    el?.addEventListener("touchend", f("touchend"), {passive: true});
    el?.addEventListener("touchcancel", f("touchcancel"), {passive: false});
    el?.addEventListener("touchmove", f("touchmove"), {passive: false});
}


export const setupEventsAndInit = (store: Store0, perfRef: { t0: any }) => {
    const resize = () => {
        $canvas.width = window.innerWidth;
        $canvas.height = window.innerHeight;
        //console.log("resize fired")
        drawAll(store);
    }
    window.addEventListener('resize', resize, false);
    resize();
    const hook = (elem: any, event: keyof (typeof elem), fun: any, options?: any) => {
        let wrapped_fun = (e: any) => {
            perfRef.t0 = performance.now();
            return fun(e);
        }
        elem?.addEventListener(event, wrapped_fun, options)
    }
    const state = store.getState()
    hook(
        $map_name, "onchange",
        (event: any) => {
            dispatch(store, writeUserSettings("mapId", (<HTMLSelectElement>event.target).value));
        }
    )
    hook(state.minimap.texture.image, "load", () => drawAll(store))
    hook($canvas, "mousemove", mouseMove(store))
    hook($canvas, "wheel", mouseScroll(store))
    hook($canvas, "mousedown", mouseDown(store))
    hook($canvas, "mouseup", mouseUp(store))
    hook($canvas, "mouseleave", mouseUp(store))
    hook($canvas, "click", click(store))
    hook($canvas, "dblclick", doubleClick(store))
    hook($canvas, "touchstart", handleNewTouch(store), {passive: false})
    hook($canvas, "touchend", handleTouchEnd(store), {passive: false})
    hook($canvas, "touchcancel", handleTouchEnd(store), {passive: false})
    hook($canvas, "touchmove", handleTouchMove(store), {passive: false})
    hook($canvas, "contextmenu", rightClick(store))

    // const wsManager = new WebSocketManager("ws:/127.0.0.1:1235", {reconnectInterval: 500, autoReconnect: true}, store)
    set_session_userId("0").then(()=>{
        remove_all().then(r => {

            // wsManager.connect()
        })
    })



}
