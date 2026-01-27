import log from "./render/types";
import {dispatch, newStore} from './store';
import {setupEventsAndInit} from './events';
import * as M from "gl-matrix"
import {changeMap, newUIStateWriteAction, settingsToActions} from "./ui/actions";
import {drawAll} from './render/canvas';
import * as React from "react";
import * as ReactDOM from 'react-dom'
import {makeLeftPanel, mapBaseOptions} from './ui/leftPanel';
import {makeTooltip} from "./ui/tooltip";
import {loadUserSettings} from "./ui/persistence";
import {enableMapSet} from "immer";
import {addTarget, addWeapon, moveEntityTo, removeAllTargets, addDirData} from "./world/actions";
import {UIStateActionType} from "./ui/types";
import {remove, remove_all, set_weapon, save, update} from "./api/standard";
import {makeIconTool} from "./ui/iconTool";
import {hl} from "./common/hlclient";
import {vec3} from "gl-matrix";
import {getEntitiesByType} from "./world/world";
import {Target} from "./world/types";
import {getSolution} from "./common/mapData";
// 初始化国际化系统
import "./i18n";

M.glMatrix.setMatrixArrayType(Array)
enableMapSet()

const store = newStore()
const perfRef = {t0: performance.now()};
const printState = (st: typeof store) => () => {
    let t1 = performance.now();
    //console.log(st.getState())
    console.log(`Update took ${t1 - perfRef.t0} ms.`);
}

// Initializing world state
store.dispatch(addWeapon([0, 0, 0], "standardMortar", 0))
settingsToActions(loadUserSettings()).map(store.dispatch);
store.dispatch(changeMap("kokan"))

// Setting up render and controls
setupEventsAndInit(store, perfRef)
// store.subscribe(printState(store))
store.subscribe(() => drawAll(store))

var fragment = new DocumentFragment();
mapBaseOptions.forEach(o => {
    const imageLoc = o[1];
    var link = document.createElement('link')
    link.rel = "prefetch";
    link.as = "image";
    link.href = imageLoc;
    fragment.appendChild(link)
})
document.getElementById("preloadContainer")?.append(fragment);
/*
to be optimized:
- mouse movement triggers rerender
    use middleware to trigger canvas updates similar to replication?
-
*/
type ClassType = "mortar" | "t1"|'light-launcher'|"tC_1"|"tB_1"
type Yolov5Detect = {
    "class": ClassType,
    "pos": [number, number],
    "bbox": [number, number]
}
setTimeout(() => {
    // 注册 changeMap action 处理器，用于通过 RPC 切换地图
    hl.regAction("changeMap", (res, param: { mapId: string }) => {
        console.log("changeMap received:", param)
        dispatch(store, changeMap(param.mapId as any))
        res(JSON.stringify({ success: true, mapId: param.mapId }))
    })

    // 注册 addMarker action 处理器，用于通过 RPC 添加火力点或武器标记
    hl.regAction("addMarker", (res, param: { x: number, y: number, type: "target" | "weapon", active?: boolean }) => {
        console.log("addMarker received:", param)
        const state = store.getState()

        // 计算世界坐标 (需要加上 minimap 的偏移量)
        const worldX = param.x + state.minimap.transform[12]
        const worldY = param.y + state.minimap.transform[13]
        const pos: vec3 = [worldX, worldY, 0]

        // 默认激活
        const active = param.active !== false

        if (param.type === "weapon") {
            // 添加武器标记
            const id = state.world.nextId
            dispatch(store, addWeapon(pos, state.userSettings.weaponType, id))
            res(JSON.stringify({ success: true, entityId: id, type: "weapon", x: worldX, y: worldY }))
        } else {
            // 添加火力点（目标）
            const id = state.world.nextId
            dispatch(store, addTarget(pos, id))

            // 获取更新后的 state 来计算方位角和密位
            const newState = store.getState()
            const target = getEntitiesByType<Target>(newState.world, "Target").filter(e => e.entityId === id)[0]

            if (target) {
                const {solution, angleValue} = getSolution(newState, target, null)

                // 获取当前用户 ID（协作模式下从 session 获取，单机模式下使用 "0"）
                const currentUserId = newState.session?.userId || "0"

                // 如果激活，则设置 userIds 为当前用户
                const userIds = active ? [currentUserId] : []

                // 添加 dirData 到前端状态（用于正确渲染火力点样式）
                dispatch(store, addDirData({
                    entityId: id,
                    userIds: userIds,
                    dir: solution.dir,
                    angle: angleValue
                }))

                // 保存火力点数据到后端
                save({
                    entityId: id,
                    dir: solution.dir,
                    angle: angleValue,
                    userIds: userIds
                })
            }

            res(JSON.stringify({ success: true, entityId: id, type: "target", active: active, x: worldX, y: worldY }))
        }
    })

    // 注册 getSolution action 处理器，用于根据目标点坐标计算方位密位（协同开火用）
    hl.regAction("getSolution", (res, param: { targetX: number, targetY: number }) => {
        console.log("getSolution received:", param)
        const state = store.getState()

        // 创建目标点坐标
        const targetPos: vec3 = [param.targetX, param.targetY, 0]

        // 使用 getSolution 计算方位密位
        const {solution, angleValue} = getSolution(state, null, targetPos)

        res(JSON.stringify({
            success: true,
            dir: solution.dir,
            angle: angleValue
        }))
    })

    hl.regAction("handlerData", (res, param: Array<Yolov5Detect>) => {
        console.log(param)

        const sortOrder:{[key in ClassType]?:number} = {
            "mortar": 1,
            'light-launcher':1,
            "t1": 2,
            "tC_1":2,
            "tB_1":2,
        };
        param = param.sort((a,b)=>{
            const orderA = sortOrder[a['class'] as ClassType] || 3;
            const orderB = sortOrder[b['class'] as ClassType] || 3;
            return orderA - orderB;
        })
        let  state = store.getState()
        let data:{[key in ClassType|"type"]?:object|string} = {

        }
        param.forEach(f => {
            f['pos'][0] *= state.minimap.size[0]
            f['pos'][1] *= state.minimap.size[1]

            switch (f['class']) {
                case "tB_1":
                case "tC_1":
                case "t1":
                    f['pos'][1] += f['bbox'][1] * state.minimap.size[1] / 2
                    let id =  state.world.nextId
                    let pos:vec3 = [f['pos'][0] + state.minimap.transform[12], f['pos'][1] + state.minimap.transform[13], 0]
                    dispatch(store,removeAllTargets())
                    dispatch(store, addTarget(pos,id))
                    state = store.getState()
                    let target = getEntitiesByType<Target>(state.world, "Target").filter(e => e.entityId === id)[0];
                    let {solution, angleValue,dist} = getSolution(state, target,null)
                    data[f['class']]={
                        "dist":dist,
                        "angle":angleValue
                    }

                    break
                case "light-launcher":
                case "mortar":
                    const weapons = state.world.components.weapon
                    for (let [key, value] of weapons.entries()) {
                        if (value.isActive) {
                            dispatch(store,moveEntityTo(key,[f['pos'][0] + state.minimap.transform[12], f['pos'][1] + state.minimap.transform[13], 0]))
                            data['type']=f['class']
                            break
                        }

                    }
                    break
                default:
                    break
            }




        })
        res(JSON.stringify(data))

    })
}, 100)
const $tooltip = document.getElementById('tooltip')!;
const $leftPanel = document.getElementById('leftPanel')!;
const $rightPanel = document.getElementById('rightPanel')!;
const $iconTool = document.getElementById('iconTool')!;
const h = React.createElement

set_weapon(store.getState().userSettings.weaponType)
ReactDOM.render(makeLeftPanel(store), $leftPanel)
ReactDOM.render(makeTooltip(store), $tooltip)
ReactDOM.render(makeIconTool(store), $iconTool)

