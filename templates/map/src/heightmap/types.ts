import { vec3 } from "gl-matrix";
import { HasTexture } from "../render/types";
import { HasTransform } from "../world/types";


export type Heightmap = HasTexture & HasTransform & {
  size: vec3,
  canvas: HTMLCanvasElement,
};