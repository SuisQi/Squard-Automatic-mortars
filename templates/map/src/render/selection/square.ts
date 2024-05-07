import {Camera} from "../../camera/types";
import {applyTransform} from "../../world/transformations";
import {canvasScaleTransform} from "../canvas";
import {SquareSelection} from "../../world/types";

export const drawSquare=(ctx: CanvasRenderingContext2D,camera:Camera,square:SquareSelection|null)=>{
    if(!square||!square.location)
        return
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
