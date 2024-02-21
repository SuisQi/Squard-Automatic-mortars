import {dispatch, Store0} from '../store';
import {newMousePosition, setMouseDown, setDragEntity, setDragStartPosition, updateTouch, removeTouch} from './actions';
import {changeZoom, moveCamera} from '../camera/actions';
import {vec3} from 'gl-matrix';
import {canvas2world, canvas2worldScale, event2canvas, getTranslation} from '../world/transformations';
import {getClosestEntity, getEntitiesByType} from '../world/world';
import {TouchInfo} from './types';
import {
    addSelected,
    addTarget,
    addWeapon,
    moveEntityBy,
    moveEntityTo, removeSelect,
    removeTarget,
    toggleWeaponActive
} from '../world/actions';
import {$canvas, $contourmap} from '../elements';
import {getZoom} from '../camera/camera';
import {EntityActionType, EntityId, Target, Weapon} from '../world/types';
import {EntityComponent, EntityType} from '../world/components/entity';
import {getMortarFiringSolution} from "../world/projectilePhysics";
import {US_MIL} from "../world/constants";
import {remove, save, update} from "../api/standard";
import State from "sucrase/dist/types/parser/tokenizer/state";
import {getHeight} from "../heightmap/heightmap";


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
        state.world.components.entity.forEach(f => {
            if (f.entityId === dragEntityId && f.selected) {


                let target = getEntitiesByType<Target>(state.world, "Target").filter(e => e.entityId === f.entityId)[0];
                let {solution, angleValue} = getSolution(store, target)
                update({
                    entityId: target.entityId,
                    dir: solution.dir,
                    angle: angleValue >> 0
                })
            }
        })
    }
}

export const mouseMove = (store: Store0) => (e: MouseEvent) => {

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
    const camera = store.getState().camera;
    const currentZoom = getZoom(store.getState().camera)
    let delta = currentZoom < 0.01 ? 0.001 : currentZoom < 0.02 ? 0.002 : 0.005;
    const newZoom = e.deltaY > 0 ? Math.max(0.002, currentZoom - delta) : Math.min(0.08, currentZoom + delta)
    zoom(store, $canvas, event2canvas(e), newZoom)
}

export const mouseDown = (store: Store0) => (e: MouseEvent) => {
    const dragEntity = getDragEntityId(store)(e)
    const eventLocation = canvas2world(store.getState().camera, event2canvas(e))
    dispatch(store, setDragStartPosition(eventLocation))
    dispatch(store, setDragEntity(dragEntity))
    dispatch(store, setMouseDown(true))
}

export const mouseUp = (store: Store0) => (e: any) => {
    dispatch(store, setMouseDown(false))
}

const getSolution = (store: Store0, target: Target) => {
    const state = store.getState();
    const userSettings = state.userSettings

    const weapon = getEntitiesByType<Weapon>(state.world, "Weapon").filter((w: Weapon) => w.isActive)[0]

    const weaponTranslation = getTranslation(weapon.transform)
    const weaponHeight = getHeight(state.heightmap, weaponTranslation)
    weaponTranslation[2] = weaponHeight +  weapon.heightOverGround;
    const targetTranslation = getTranslation(target.transform);
    const targetHeight = getHeight(state.heightmap, targetTranslation)
    targetTranslation[2] = targetHeight;
    const solution = getMortarFiringSolution(weaponTranslation, targetTranslation).highArc;
    const angleValue = userSettings.weaponType === "technicalMortar" ? solution.angle / Math.PI * 180 : solution.angle * US_MIL;
    return {
        solution,
        angleValue
    }
}
export const click = (store: Store0) => (e: any) => {

    if (e.shiftKey) {
        const state = store.getState();
        const worldLoc = canvas2world(state.camera, event2canvas(e))
        const radius = canvas2worldScale(state.camera, [25, 0, 0])[0]
        const candidates = getClosestEntity(state.world, worldLoc, radius)
        if (candidates.length > 0 && candidates[0].entityType === "Weapon") {
            dispatch(store, toggleWeaponActive(candidates[0].entityId));
        }
    } else if (e.ctrlKey || store.getState().userSettings.deleteMode) {
        const state = store.getState();
        const worldLoc = canvas2world(state.camera, event2canvas(e))
        const radius = canvas2worldScale(state.camera, [25, 0, 0])[0]
        const candidates = getClosestEntity(state.world, worldLoc, radius)

        if (candidates.length > 0) {


            remove({
                entityId: candidates[0].entityId,
            }).then(res => {
                dispatch(store, removeTarget(candidates[0].entityId));
            })
        }
    } else if (e.altKey) {
        const state = store.getState();
        const worldLoc = canvas2world(state.camera, event2canvas(e))
        const radius = canvas2worldScale(state.camera, [25, 0, 0])[0]
        const candidates = getClosestEntity(state.world, worldLoc, radius)


        if (candidates.length > 0) {
            console.log(state.world)
            const targets = getEntitiesByType<Target>(state.world, "Target");
            let target = targets.filter(t => t.entityId === candidates[0].entityId)[0]
            let {solution, angleValue} = getSolution(store, target)
            if (target.selected) {
                remove({
                    entityId: target.entityId,
                }).then(res => {
                    dispatch(store, removeSelect(target.entityId))

                })
            } else {

                save({
                    entityId: target.entityId,
                    dir: solution.dir,
                    angle: angleValue >> 0
                }).then(res => {
                    dispatch(store, addSelected(target))
                })
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

export const doubleClick = (store: Store0) => (e: any) => {
    const eventLocation = canvas2world(store.getState().camera, event2canvas(e))
    if (e.altKey)
        return
    if (store.getState().uiState.weaponCreationMode || e.shiftKey) {
        dispatch(store, addWeapon(eventLocation, "standardMortar"));
    } else {
        dispatch(store, addTarget(eventLocation));
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

export const handleTouchEnd = (store: Store0) => (ev: any) => {
    const range = Array(ev.changedTouches.length).fill(0).map((x, y) => x + y)
    range.forEach(k => store.dispatch(removeTouch(ev.changedTouches[k].identifier)));
}
