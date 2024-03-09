import {Icon, Weapon} from "../world/types";
import {applyTransform} from "../world/transformations";
import {Camera} from "../camera/types";
import {canvasScaleTransform} from "./canvas";
import {$contourmap} from "../elements";
import {mat4, vec3} from "gl-matrix";
import {ImageState} from "../ui/types";



export const drawIcons=(ctx: CanvasRenderingContext2D,camera:Camera,  icons: Array<any>,images:ImageState)=>{
    // let image=new Image()
    // image.onload=()=>{
    //     ctx.drawImage(image,500,500)
    // }
    // image.src="./icon/步兵/步兵.png"

    icons.forEach(icon=>{



        let image = images.get(icon.src)


        if(image?.complete)
        {
            d()
        }else {
            // @ts-ignore
            image?.onload=d
        }
        function d() {
            ctx.save()
            applyTransform(ctx, icon.transform.transform)

            applyTransform(ctx, canvasScaleTransform(camera))
            let scale_ = mat4.getScaling(vec3.create(), $contourmap.transform)

            let scale = vec3.inverse(scale_, scale_);
            let inverse_scale=mat4.fromScaling(mat4.create(), scale)
            inverse_scale[0]=Math.min(inverse_scale[0],0.65)
            inverse_scale[5]=Math.min(inverse_scale[5],0.65)

            inverse_scale[0]=Math.max(inverse_scale[0],0.3)
            inverse_scale[5]=Math.max(inverse_scale[5],0.3)

            applyTransform(ctx,inverse_scale )
            // @ts-ignore
            ctx.translate(-(image.width/2)*inverse_scale[0],-(image.height/2)*inverse_scale[0])
            // console.log(icon.transform.transform)
            // @ts-ignore
            ctx.drawImage(image,0,0)
            ctx.restore()
        }
    })
}
