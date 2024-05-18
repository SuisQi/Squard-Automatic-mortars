import {Camera} from "../../camera/types";
import {HasTransform, Selection, Target} from "../../world/types";
import {LineSelectionComponent, SquareSelectionComponent} from "../../world/components/selection";
import {applyTransform} from "../../world/transformations";
import {vec3} from "gl-matrix";
import e from "express";
import {dispatch, Store0} from "../../store";
import {addDirData, addTarget, removeTarget} from "../../world/actions";
import {getEntitiesByType} from "../../world/world";
import {getSolution} from "../../common/mapData";

export const drawLineSelection=(ctx: CanvasRenderingContext2D,camera:Camera,line:Selection|null)=>{

    if(!line)
        return
    line = line as LineSelectionComponent

    ctx.save()
    // applyTransform(ctx,line.startLocation.transform )

    let fromX = line.startLocation.transform[12]
    let fromY = line.startLocation.transform[13]

    let toX = line.endLocation.transform[12]
    let toY = line.endLocation.transform[13]

    ctx.beginPath();
    //画直线
    // ctx.lineTo()
    ctx.moveTo(fromX,fromY);
    ctx.lineTo(toX, toY);





    ctx.lineWidth=200

    ctx.strokeStyle = "rgba(231, 76, 60,0.6)";
    ctx.stroke();
    ctx.restore()

}

interface Point {
    x: number;
    y: number;
}

export function fillLineSelection(store:Store0) {
    let line = store.getState().world.components.selection.get(1);
    if(!line)
        return
    line = line as LineSelectionComponent

    let start = line.startLocation
    let end = line.endLocation
    let interval = line.gap
    const result:vec3[] = [];
    const dx = end.transform[12] - start.transform[12];
    const dy = end.transform[13] - start.transform[13];
    const length = Math.sqrt(dx * dx + dy * dy);
    if(length<1000)
        return;
    const stepCount = Math.floor(length / interval);
    const unitX = dx / length;
    const unitY = dy / length;

    for (let i = 0; i <= stepCount; i++) {
        if(i>=30)
            break
        const factor = i * interval;
        const x = start.transform[12] + unitX * factor;
        const y = start.transform[13] + unitY * factor;
        result.push([x,y,0]);
    }

    // Add the endpoint if it's not exactly divisible by interval
    // if (stepCount * interval < length) {
    //     result.push([end.transform[12],end.transform[13],0]);
    // }

    for (let i = 0; i < result.length; i++) {
        let id = store.getState().world.nextId
        dispatch(store,addTarget(result[i],id))

        const state = store.getState()
        let target = state.world.components.transform.get(id)
        let {solution, angleValue} = getSolution(state, target)


        dispatch(store, addDirData({
            entityId: id,
            dir:solution.dir,
            angle:angleValue,
            userIds: [state.session?.userId ?? "0"]
        }))
    }
}

function isOnLineSegment(line:LineSelectionComponent, point: HasTransform): boolean {
    const start = line.startLocation;
    const end = line.endLocation;

    // 提取起点和终点的坐标
    const startX = start.transform[12];
    const startY = start.transform[13];
    const endX = end.transform[12];
    const endY = end.transform[13];

    // 计算线段向量AB和向量AC
    const AB = { x: endX - startX, y: endY - startY };
    const AC = { x: point.transform[12] - startX, y: point.transform[13] - startY };

    // 计算线段AB的长度
    const lengthAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);

    // 利用叉积计算点到直线的垂直距离
    const crossProduct = AB.x * AC.y - AB.y * AC.x;
    if(lengthAB===0)
        return false;
    const distanceToLine = Math.abs(crossProduct) / lengthAB;

    let tolerance=400
    // 判断点是否在直线的容忍范围内
    if (distanceToLine > tolerance) {
        return false;
    }

    // 使用点积检查点的投影是否在线段的范围内
    const dotProduct = AB.x * AC.x + AB.y * AC.y;
    if (dotProduct < 0 || dotProduct > lengthAB * lengthAB) {
        return false;
    }

    return true;
}
export const removeAllFromLineSelection=(store:Store0)=>{
    // debugger
    const  state= store.getState()
    let line = state.world.components.selection.get(1);
    if(!line)
        return
    line = line as LineSelectionComponent

    for (const [key, value] of state.world.components.transform) {
        if(isOnLineSegment(line,value)){
            if(state.world.components.entity.get(key)?.entityType==="Target") {
                dispatch(store, removeTarget(key))
            }
        }
    }
}
