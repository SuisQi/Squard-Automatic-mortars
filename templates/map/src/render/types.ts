import { vec3 } from 'gl-matrix';
import { Transform } from '../world/types';


export default function log(s: string){
    console.log(s);
}

export type Drawable = {
  draw: (c: CanvasRenderingContext2D) => any;
}
export type HasTexture = {texture: Texture}
export type Texture = {
  transform: Transform;
  source: string;
  size: vec3;
  image: HTMLImageElement;
}

export type Renderable 
  = {type: "texture", texture: Texture}
  //|
;

export type RenderNode = {
  transform: Transform
  renderable: Renderable,
  children: Array<RenderNode>
}