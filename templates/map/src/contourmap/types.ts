import { HasTransform } from '../world/types';
import { HasTexture } from '../render/types';
import { maps } from '../common/mapData';
import { vec3 } from 'gl-matrix';

export enum ContourmapActionType {
  set = "MINIMAP_SET"
}
export type ContourmapAction 
  = {type: ContourmapActionType.set, payload: keyof (typeof maps)}
export type Contourmap = HasTexture & HasTransform & {size: vec3};