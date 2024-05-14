import {Camera} from "../../camera/types";
import {applyTransform} from "../../world/transformations";
import {canvasScaleTransform} from "../canvas";
import {Selection} from "../../world/types";
import {SquareSelectionComponent} from "../../world/components/selection";
import {dispatch, Store0} from "../../store";
import {addDirData, addTarget, removeTarget} from "../../world/actions";
import {vec3} from "gl-matrix";

export const drawSquare=(ctx: CanvasRenderingContext2D,camera:Camera,square:Selection|null)=>{

    if(!square)
        return
    square = square as SquareSelectionComponent

    ctx.save()
    applyTransform(ctx, square.location.transform)

    // applyTransform(ctx, canvasScaleTransform(camera))
    ctx.fillStyle="rgba(166, 172, 175 ,0.4)"

    ctx.fillRect(0,0,square.w,square.h)

    ctx.strokeStyle = "#1030ae"; // 设置边框颜色
    ctx.lineWidth = 50; // 设置线宽
    ctx.setLineDash([500, 300]); // 设置虚线的模式，[线段长度, 间隙长度]
    ctx.strokeRect(0,0,square.w,square.h)
    ctx.restore()
}
function customRound(value: number) {
    if (value < 0) {
        // 对负数向下取整
        return Math.floor(value);
    } else {
        // 对正数向上取整
        return Math.ceil(value);
    }
}

// 定义计算矩形起点和终点的函数
function calculateBounds(x: number, w: number) {
    const start = w > 0 ? x : x + w;
    const end = w > 0 ? x + w : x;
    return {start, end};
}

export const removeSquareTargets = (store: Store0) => {
    let selection = store.getState().world.components.selection.get(0);
    if(!selection)
        return
    selection = selection as SquareSelectionComponent
    let downTransform = selection.location.transform
    // 计算矩形的水平和垂直边界
    const xBounds = calculateBounds(downTransform[12], selection.w);
    const yBounds = calculateBounds(downTransform[13], selection.h);

    for (const [key, value] of store.getState().world.components.transform) {
        const x = value.transform[12];
        const y = value.transform[13];
        // 检查组件的x和y坐标是否在矩形范围内
        if (x >= xBounds.start && x <= xBounds.end && y >= yBounds.start && y <= yBounds.end) {
            if(store.getState().world.components.entity.get(key)?.entityType==="Target")
                dispatch(store, removeTarget(key))

        }
    }
}
export const fillSquareTargets = (store: Store0) => {
    let selection = store.getState().world.components.selection.get(0);
    if(!selection)
        return
    selection = selection as SquareSelectionComponent
    let index = 0
    const state = store.getState()
    for (let i = 0; i < Math.abs(customRound(selection.w / selection.gapX)); i++) {
        for (let j = 0; j < Math.abs(customRound(selection.h / selection.gapY)); j++) {
            if (index >= 100)
                return;
            index++
            let pos = [selection?.location.transform[12] + i * selection?.gapX * (selection.w > 0 ? 1 : -1), selection?.location.transform[13] + j * selection?.gapY * (selection.h > 0 ? 1 : -1), 0] as vec3
            let id = store.getState().world.nextId
            dispatch(store, addTarget(pos, id))
            dispatch(store, addDirData({
                entityId: id,

                userIds: [state.session?.userId ?? "0"]
            }))
        }
    }

}
