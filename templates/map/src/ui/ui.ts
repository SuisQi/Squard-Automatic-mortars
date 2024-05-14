import {dispatch, Store0} from '../store';
import {newMousePosition, removeTouch, setDragEntity, setDragStartPosition, setMouseDown, updateTouch} from './actions';
import {changeZoom, moveCamera} from '../camera/actions';
import {vec3} from 'gl-matrix';
import {canvas2world, canvas2worldScale, event2canvas} from '../world/transformations';
import {getClosestEntity, getClosestIcon, getEntitiesByType} from '../world/world';
import {IconToolActionType, TouchInfo} from './types';
import {
    addDirData,
    addTarget,
    addWeapon,
    downSquareSelection,
    IconActionType,
    moveEntityTo,
    removeDirData,
    removeTarget,
    SelectionActionType,
    toggleWeaponActive,
    updateDirData,
    upSquareSelection
} from '../world/actions';
import {$canvas, $contourmap} from '../elements';
import {getZoom} from '../camera/camera';
import {EntityId, Target} from '../world/types';
import {newTransform} from "../world/components/transform";
import {SquareSelectionComponent} from "../world/components/selection";
import {fillSquareTargets, removeSquareTargets} from "../render/selection/square";
import {fillLineSelection, removeAllFromLineSelection} from "../render/selection/line";


const dragOrPan = (store: Store0, event: any) => {
    const state = store.getState();
    const start = state.uiState.dragStartPosition;
    const eventLocation = canvas2world(state.camera, event2canvas(event));
    const dragEntityId = state.uiState.dragEntityId;
    const offset = vec3.sub(vec3.create(), eventLocation, start);

    if (dragEntityId === -1) {
        dispatch(store, moveCamera(offset))
    } else if (dragEntityId !== null && dragEntityId !== undefined) {
        dispatch(store, setDragStartPosition(eventLocation))
        //dispatch(store, moveEntityBy(dragEntityId, offset))
        dispatch(store, moveEntityTo(dragEntityId, eventLocation))

    }
}

export const mouseMove = (store: Store0) => (e: MouseEvent) => {

    if (store.getState().iconToolState.selectionState === 2) {
        const eventLocation = canvas2world(store.getState().camera, event2canvas(e))
        let selectionType= store.getState().iconToolState.selectionType
        if(selectionType===0){
            dispatch(store, upSquareSelection(eventLocation))
            removeSquareTargets(store)
        }else if(selectionType===1){
            dispatch(store,{type:SelectionActionType.LineEndtPos,payload:eventLocation})
            removeAllFromLineSelection(store)
        }
        return;
    }
    if (store.getState().iconToolState.display)
        return
    if ((e.buttons & 1) === 1) {
        dragOrPan(store, e)
    }
    const mouseXY = event2canvas(e);
    dispatch(store, newMousePosition(mouseXY[0], mouseXY[1]))
}

const zoom = (store: Store0, targetElement: any, zoomLocation: vec3, desiredZoom: number) => {
    const camera = store.getState().camera;
    const newZoom = Math.max(0.002, Math.min(0.08, desiredZoom))
    $contourmap.set_zoom(newZoom);
    dispatch(store, changeZoom(event2canvas({
        target: targetElement,
        clientX: zoomLocation[0],
        clientY: zoomLocation[1]
    }), newZoom));
}

export const mouseScroll = (store: Store0) => (e: WheelEvent) => {

    if(store.getState().iconToolState.selectionState===4){//如果选区完成
        if(store.getState().iconToolState.selectionType===0){
            dispatch(store,{type:SelectionActionType.gapXY,payload:e.deltaY>0?100:-100})
            removeSquareTargets(store)
            fillSquareTargets(store)
        }
        else if(store.getState().iconToolState.selectionType===1){
            dispatch(store,{type:SelectionActionType.gap,payload:e.deltaY>0?100:-100})
            removeAllFromLineSelection(store)
            fillLineSelection(store)
        }

        return
    }
    dispatch(store, {type: IconToolActionType.write, payload: {key: "display", value: false}});
    dispatch(store, {type: IconToolActionType.write, payload: {key: "c_name", value: ""}});
    const camera = store.getState().camera;
    const currentZoom = getZoom(store.getState().camera)

    let delta = currentZoom < 0.01 ? 0.001 : currentZoom < 0.02 ? 0.002 : 0.005;
    const newZoom = e.deltaY > 0 ? Math.max(0.002, currentZoom - delta) : Math.min(0.08, currentZoom + delta)
    zoom(store, $canvas, event2canvas(e), newZoom)
}

export const mouseDown = (store: Store0) => (e: MouseEvent) => {
    const eventLocation = canvas2world(store.getState().camera, event2canvas(e))


    if (store.getState().iconToolState.selectionState === 1) {
        if(store.getState().iconToolState.selectionType===0) {
            dispatch(store, downSquareSelection(eventLocation))
        }
        else if (store.getState().iconToolState.selectionType===1){
            dispatch(store,{type:SelectionActionType.LineStartPos,payload:eventLocation})
        }
        dispatch(store, {type: IconToolActionType.write, payload: {key: "selectionState", value: 2}})

    }
    if (store.getState().iconToolState.display || store.getState().iconToolState.selectionState !== 0)
        return
    const dragEntity = getDragEntityId(store)(e)
    dispatch(store, setDragStartPosition(eventLocation))
    dispatch(store, setDragEntity(dragEntity))
    dispatch(store, setMouseDown(true))
}


export const mouseUp = (store: Store0) => (e: any) => {
    const state = store.getState()
    if (store.getState().iconToolState.selectionState === 2) {
        const eventLocation = canvas2world(store.getState().camera, event2canvas(e))

        dispatch(store, {type: IconToolActionType.write, payload: {key: "selectionState", value: 3}})
        let tool = store.getState().iconToolState
        let selection = store.getState().world.components.selection.get(tool.selectionType)
        if (selection) {
            if (tool.selectionType === 0) {
                dispatch(store, upSquareSelection(eventLocation))
                removeSquareTargets(store)

                fillSquareTargets(store)


            }else if(tool.selectionType===1){
                dispatch(store,{type:SelectionActionType.LineEndtPos,payload:eventLocation})
                removeAllFromLineSelection(store)
                fillLineSelection(store)
            }


        }

        return;
    }

    const dragEntityId = state.uiState.dragEntityId;
    state.world.components.entity.forEach(f => {
        if (f.entityId === dragEntityId && f.selected) {


            let target = getEntitiesByType<Target>(state.world, "Target").filter(e => e.entityId === f.entityId)[0];

            dispatch(store, updateDirData({
                entityId: target.entityId,

            }))
        }
    })
    dispatch(store, setMouseDown(false))
}


export const click = (store: Store0) => (e: any) => {


    if (store.getState().iconToolState.selectionState === 3) {
        dispatch(store, {type: IconToolActionType.write, payload: {key: "selectionState", value: 4}})
        return;
    }
    if (store.getState().iconToolState.selectionState === 4) {
        dispatch(store, {type: IconToolActionType.write, payload: {key: "selectionState", value: 0}})
        return;
    }
    if (store.getState().iconToolState.selectionState !== 0)
        return
    // 如果点击的不是图标工具栏，则关闭工具栏
    dispatch(store, {type: IconToolActionType.write, payload: {key: "display", value: false}});
    dispatch(store, {type: IconToolActionType.write, payload: {key: "c_name", value: ""}});


    const state = store.getState();
    const worldLoc = canvas2world(state.camera, event2canvas(e))
    const radius = canvas2worldScale(state.camera, [25, 0, 0])[0]
    const candidates = getClosestEntity(state.world, worldLoc, radius)
    const iconRadius = canvas2worldScale(state.camera, [15, 0, 0])[0]
    const removeIcons = getClosestIcon(state.world, worldLoc, iconRadius)

    if (e.shiftKey) {

        if (candidates.length > 0 && candidates[0].entityType === "Weapon") {
            dispatch(store, toggleWeaponActive(candidates[0].entityId));
        }
    } else if (e.ctrlKey || store.getState().userSettings.deleteMode) {


        if (candidates.length > 0) {


            dispatch(store, removeTarget(candidates[0].entityId));
        }
        if (removeIcons.length > 0) {
            dispatch(store, {type: IconActionType.remove, payload: removeIcons[0].entityId})
        }
    } else if (e.altKey) {


        if (candidates.length > 0) {
            console.log(state.world)
            const targets = getEntitiesByType<Target>(state.world, "Target");
            let target = targets.filter(t => t.entityId === candidates[0].entityId)[0]
            let userIds: string[] = state.world.components.dirData.has(target.entityId) ? state.world.components.dirData.get(target.entityId)?.userIds ?? [] : []
            if (state.world.components.dirData.has(target.entityId)) {
                if (userIds.includes(state.session?.userId ?? "0")) {
                    dispatch(store, removeDirData({
                        entityId: target.entityId,
                        userIds: userIds.filter(f => f !== (state.session?.userId ?? "0"))
                    }))
                } else {
                    dispatch(store, addDirData({
                        entityId: target.entityId,

                        userIds: [...userIds, state.session?.userId ?? "0"]
                    }))
                }
                // dispatch(store, removeSelect(target.entityId))
            } else {
                dispatch(store, addDirData({
                    entityId: target.entityId,

                    userIds: [state.session?.userId ?? "0"]
                }))
                // dispatch(store, addSelected(target))
            }

            // if(hasSelected){
            //
            // }else {
            //   dispatch(store,addSelected(target))
            // }

            // console.log(solution)
            // console.log(angleValue)
        }
    }

}

export const rightClick = (store: Store0) => (event: any) => {

    if (event.button === 2) {
        const eventLocation = canvas2world(store.getState().camera, event2canvas(event))
        event.preventDefault(); // 阻止默认右键菜单行为
        console.log('Right clicked!');
        // 获取鼠标右键单击时相对于屏幕左上角的距离
        const xPos = event.clientX;
        const yPos = event.clientY;

        console.log(xPos, yPos)

        dispatch(store, {type: IconToolActionType.write, payload: {key: "display", value: true}});
        dispatch(store, {type: IconToolActionType.write, payload: {key: "x", value: xPos}});
        dispatch(store, {type: IconToolActionType.write, payload: {key: "y", value: yPos}});
        dispatch(store, {type: IconToolActionType.write, payload: {key: "location", value: eventLocation}});
        // 这里可以添加你想要执行的逻辑
    }
}
export const doubleClick = (store: Store0) => (e: any) => {
    const eventLocation = canvas2world(store.getState().camera, event2canvas(e))
    if (e.altKey)
        return
    let nextId = store.getState().world.nextId
    if (store.getState().uiState.weaponCreationMode || e.shiftKey) {
        dispatch(store, addWeapon(eventLocation, "standardMortar", nextId));
    } else {
        dispatch(store, addTarget(eventLocation, nextId));
    }
}

export const getDragEntityId: (store: Store0) => (event: any) => EntityId
    = store => event => {

    const state = store.getState();
    const worldLoc = canvas2world(state.camera, event2canvas(event));
    const radius = canvas2worldScale(state.camera, vec3.fromValues(25, 0, 0))[0]
    const candidates = getClosestEntity(state.world, worldLoc, radius)
    if (candidates.length > 0) {
        return candidates[0].entityId;
    }
    //return getEntitiesByType<EntityComponent>(state.world, "Camera")[0].entityId
    return -1 // TODO: decide if better data type or camera as entity
}

export const handleNewTouch = (store: Store0) => (ev: any) => {
    // not preventing default to keep click emulation intact
    const range = Array(ev.changedTouches.length).fill(0).map((x, y) => x + y)
    range
        .map(k => {
            let touch = ev.changedTouches[k]
            store.dispatch(updateTouch(touch.identifier, touch.clientX, touch.clientY))
        })
    if (ev.changedTouches.length === 1) {
        let touchEvent = ev.changedTouches[0]
        dispatch(store, setDragEntity(getDragEntityId(store)(touchEvent)));
        dispatch(store, setDragStartPosition(canvas2world(store.getState().camera, event2canvas(touchEvent))));
    }
}

const pinch = (store: Store0) => (ev: any) => {
    const eventTouches = Object.values<Touch>(ev.changedTouches);
    let knownTouches = Array.from(store.getState().uiState.touches.values()).sort((a: any, b: any) => a.identifier - b.identifier) as Array<TouchInfo>;
    let trackedTouches = knownTouches.slice(0, 2)
    let oldDist = vec3.distance(trackedTouches[0].location, trackedTouches[1].location)
    let zoomLocation = vec3.create();
    vec3.add(zoomLocation, trackedTouches[0].location, trackedTouches[1].location)
    vec3.scale(zoomLocation, zoomLocation, 0.5)
    let factorIncrease = 0
    let target: any = null
    eventTouches.forEach((eventTouch: Touch) => {
        trackedTouches.forEach((trackedTouch: any) => {
            if (eventTouch.identifier === trackedTouch.identifier) {
                target = eventTouch.target;
                factorIncrease = factorIncrease + 2 * vec3.distance(vec3.fromValues(eventTouch.clientX, eventTouch.clientY, 0), zoomLocation) / oldDist - 1
            }
        })
    })
    let zoomChangeFactor = 1 + factorIncrease
    if (zoomChangeFactor > 0 && target !== null) {
        const currentZoom = getZoom(store.getState().camera)
        zoom(store, $canvas, zoomLocation, currentZoom * zoomChangeFactor)
    }
}

const touchMove = (store: Store0) => (ev: any) => {
    const eventTouches = Object.values<Touch>(ev.changedTouches);
    let knownTouches = Array.from(store.getState().uiState.touches.values()).sort((a: any, b: any) => a.identifier - b.identifier) as Array<TouchInfo>;
    if (knownTouches.length === 1) {
        const touchEvent = eventTouches[0]
        dragOrPan(store, touchEvent)
    }
}
export const handleTouchMove = (store: Store0) => (ev: any) => {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const eventTouches = Object.values<Touch>(ev.changedTouches);
    let knownTouches = Array.from(store.getState().uiState.touches.values()).sort((a: any, b: any) => a.identifier - b.identifier) as Array<TouchInfo>;
    if (knownTouches.length >= 2) {
        pinch(store)(ev);
    } else if (eventTouches) {
        touchMove(store)(ev)
    }
    eventTouches.forEach((t: Touch) => {
        store.dispatch(updateTouch(t.identifier, t.clientX, t.clientY))
    })
}

// @ts-ignore
export const handleTouchEnd = (store: Store0) => (ev: any) => {
    const range = Array(ev.changedTouches.length).fill(0).map((x, y) => x + y)
    range.forEach(k => store.dispatch(removeTouch(ev.changedTouches[k].identifier)));
}
