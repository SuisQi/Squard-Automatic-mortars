import {Camera} from "../camera/types";
import {Selected} from "../world/types";
import {mat4, vec3} from "gl-matrix";
import {canvasScaleTransform} from "./canvas";

const drawSelected = (ctx:any,camera:Camera,selected:Selected)=>{
    const canvasSizeFactor = mat4.getScaling(vec3.create(), canvasScaleTransform(camera))[0]
}
