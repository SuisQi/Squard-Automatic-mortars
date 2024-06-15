import { HasTransform } from '../world/types';
import { HasTexture, RenderNode } from '../render/types';
import { maps } from '../common/mapData';
import { vec3 } from 'gl-matrix';

export enum TerrainmapActionType {
  set = "TERRAIN_SET"
}
export type TerrainmapAction
  = {type: TerrainmapActionType.set, payload: keyof (typeof maps)}
export type Terrainmap = HasTexture & HasTransform & {size: vec3};
