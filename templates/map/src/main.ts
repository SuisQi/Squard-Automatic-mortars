import log from "./render/types";
import {dispatch, newStore} from './store';
import {setupEventsAndInit} from './events';
import * as M from "gl-matrix"
import {changeMap, newUIStateWriteAction, settingsToActions} from "./ui/actions";
import {drawAll} from './render/canvas';
import * as React from "react";
import * as ReactDOM from 'react-dom'
import {makeLeftPanel, mapOptions} from './ui/leftPanel';
import {makeTooltip} from "./ui/tooltip";
import {loadUserSettings} from "./ui/persistence";
import {enableMapSet} from "immer";
import {addTarget, addWeapon, moveEntityTo, removeAllTargets} from "./world/actions";
import {UIStateActionType} from "./ui/types";
import {remove, remove_all} from "./api/standard";
import {makeIconTool} from "./ui/iconTool";
import {hl} from "./common/hlclient";
import {vec3} from "gl-matrix";
import {getEntitiesByType} from "./world/world";
import {Target} from "./world/types";
import {getSolution} from "./common/mapData";

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
mapOptions.forEach(o => {
    const imageLoc = o[2];
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


ReactDOM.render(makeLeftPanel(store), $leftPanel)
ReactDOM.render(makeTooltip(store), $tooltip)
ReactDOM.render(makeIconTool(store), $iconTool)

