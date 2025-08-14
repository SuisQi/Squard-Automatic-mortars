import { Camera } from "../camera/types";
import { Heightmap } from "../heightmap/types";
import { Target, Weapon } from "../world/types";
import { StoreState } from "../store";
import { DirDataComponent } from "../world/components/dirData";
import { User } from "../replication_ws/types";

// 导入武器渲染器
import { weaponRenderers } from './weaponRenderers';

/**
 * 绘制目标点
 * 使用新的武器渲染器系统
 */
export const drawTargets = (ctx: CanvasRenderingContext2D, weapons: Array<Weapon>, targets: Array<Target>, state: StoreState, dirdatas: Map<number, DirDataComponent>, userId: User['id']): void => {
  const camera = state.camera;
  const userSettings = state.userSettings;
  const heightmap = state.heightmap;
  
  const weaponRendererFunc = weaponRenderers[userSettings.weaponType];
  if (weaponRendererFunc) {
    const weaponRenderer = weaponRendererFunc();
    targets.forEach((target: Target) => {
      weaponRenderer.drawTarget(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId);
    });
  }
}