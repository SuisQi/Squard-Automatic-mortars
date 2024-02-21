import { HasTransform } from '../world/types';
import { HasTexture, RenderNode } from '../render/types';
import { maps } from '../common/mapData';
import { vec3 } from 'gl-matrix';

export enum MinimapActionType {
  set = "MINIMAP_SET"
}
export type MinimapAction 
  = {type: MinimapActionType.set, payload: keyof (typeof maps)}
export type Minimap = HasTexture & HasTransform & {size: vec3};