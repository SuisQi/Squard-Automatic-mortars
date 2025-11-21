import { vec3 } from "gl-matrix";
import { getZoom } from "../camera/camera";
import { ZOOM_LEVEL_2, ZOOM_LEVEL_3 } from "../camera/constants";
import { camera } from "../camera/reducer";
import { Camera } from "../camera/types";
import { minimap } from "../minimap/reducer";
import { Minimap } from "../minimap/types";
import { applyTransform, newTranslation, standardFormatKeypad, world2keypad, world2keypadStrings } from "../world/transformations";
import { canvasScaleTransform, outlineText, setOutlineTextStyles, text } from "./canvas";
import { TEXT_BLACK, TEXT_GREEN, TEXT_RED } from "./constants";
import { getGridConstants } from "../constants/grid";

export const drawKeypadIndicator: (ctx: CanvasRenderingContext2D, minimap: Minimap, location: vec3, fillColor: string, camera: Camera, mapId: string) => void =
(ctx, minimap, location, fillColor, camera, mapId) => {
  if (location === null){
    return;
  }

  // 获取当前地图的网格常量
  const gridConstants = getGridConstants(mapId);
  const { GRID_SPACING, LARGE_GRID_SPACING, QUADRANT_SIZE } = gridConstants;

  const keypad: Array<number> = world2keypad(minimap, location, mapId);
  //console.log("keypad", keypad)
  if (keypad[0] !== -1 && keypad[1] !== -1){
    const outerX = keypad[0] * QUADRANT_SIZE
    const outerY = keypad[1] * QUADRANT_SIZE
    ctx.save();
    applyTransform(ctx, minimap.transform);
    // square
    ctx.beginPath();
    ctx.lineTo(outerX + QUADRANT_SIZE, outerY);
    ctx.lineTo(outerX + QUADRANT_SIZE, outerY + QUADRANT_SIZE);
    ctx.lineTo(outerX, outerY + QUADRANT_SIZE);
    ctx.lineTo(outerX, outerY);
    ctx.closePath()

    ctx.lineWidth = 3;
    ctx.strokeStyle = fillColor;
    ctx.resetTransform();
    ctx.stroke();
    ctx.restore();
    //
    ctx.save();
    applyTransform(ctx, minimap.transform);
    applyTransform(ctx, newTranslation(outerX, outerY, 0))
    applyTransform(ctx, canvasScaleTransform(camera))
    outlineText(ctx, `${String.fromCharCode(65 + keypad[0])}${1 + keypad[1]}`, "bottom", fillColor, TEXT_BLACK, 24, true);
    ctx.restore();

    const zoom = getZoom(camera);
    const coord2index = (x:number, y:number) => 7 + x - 3 * y;
    const hideHovered = false; // tentative
    // large keypad
    if (zoom > ZOOM_LEVEL_2){
      for (let i = 0; i <= 2; i++) {
        for (let j = 0; j <= 2; j++) {
          if (coord2index(i, j) !== keypad[2] && (hideHovered || zoom > ZOOM_LEVEL_2)){
            ctx.save();
            applyTransform(ctx, minimap.transform);
            applyTransform(ctx, newTranslation(outerX + LARGE_GRID_SPACING / 2 + i * LARGE_GRID_SPACING, outerY + LARGE_GRID_SPACING / 2 + j * LARGE_GRID_SPACING, 0))
            applyTransform(ctx, canvasScaleTransform(camera))
            applyTransform(ctx, newTranslation(-5, 2, 0))
            outlineText(ctx, `${coord2index(i, j)}`, "middle", fillColor, TEXT_BLACK, 22, true);
            ctx.restore();
          } else if (zoom > ZOOM_LEVEL_3){
            // small keypad - 在每个小格子中心显示数字
            for (let i2 = 0; i2 <= 2; i2++) {
              for (let j2 = 0; j2 <= 2; j2++) {
                if (coord2index(i2, j2) !== keypad[3]){
                  ctx.save();
                  applyTransform(ctx, minimap.transform);
                  applyTransform(ctx, newTranslation(outerX + i * LARGE_GRID_SPACING, outerY + j * LARGE_GRID_SPACING, 0))
                  applyTransform(ctx, newTranslation(GRID_SPACING / 2 + i2 * GRID_SPACING, GRID_SPACING / 2 + j2 * GRID_SPACING, 0))
                  applyTransform(ctx, canvasScaleTransform(camera))
                  applyTransform(ctx, newTranslation(-3, 1, 0))
                  outlineText(ctx, `${coord2index(i2, j2)}`, "middle", fillColor, TEXT_BLACK, 16, true);
                  ctx.restore();
                }
              }
            }
          }
        }
      }
    }
  }
}

export const drawKeypadLabel = (ctx: CanvasRenderingContext2D, minimap: Minimap, location: vec3, fillColor: string, camera: Camera, fontSize: number, mapId: string): void => {
  if (location === null){
    return;
  }
  const keypad: Array<string> = world2keypadStrings(minimap, location, mapId);
  ctx.save();
  applyTransform(ctx, newTranslation(location[0], location[1], location[2]))
  applyTransform(ctx, canvasScaleTransform(camera))
  applyTransform(ctx, newTranslation(-1.6 * fontSize, -1 * fontSize, 0))
  outlineText(ctx, standardFormatKeypad(keypad), "bottom", fillColor, TEXT_BLACK, fontSize, true);
  ctx.restore();
}