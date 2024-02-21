import log from "./render/types";
import {newStore} from './store';
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
import {addWeapon} from "./world/actions";
import {UIStateActionType} from "./ui/types";
import {remove, remove_all} from "./api/standard";

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
store.dispatch(addWeapon([0, 0, 0], "standardMortar"))
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

const $tooltip = document.getElementById('tooltip')!;
const $leftPanel = document.getElementById('leftPanel')!;
const $rightPanel = document.getElementById('rightPanel')!;
const h = React.createElement
remove_all().then(r => {

})
ReactDOM.render(makeLeftPanel(store), $leftPanel)
ReactDOM.render(makeTooltip(store), $tooltip)

