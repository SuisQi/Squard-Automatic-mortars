/**
 * Canvas渲染模块
 * 负责整个地图应用的Canvas 2D渲染，包括地图、武器、目标、图标等所有可视化元素
 */

import { $canvas, $contourmap} from "../elements";
import { HasTransform, Target, Transform, Weapon, World,Icon } from "../world/types";
import { Texture } from "./types";
import { Store0 } from '../store';
import { applyTransform } from '../world/transformations';

import { Minimap } from '../minimap/types';
import { vec3, mat4 } from 'gl-matrix';
import { Camera } from '../camera/types';
import { UIState, UserSettings } from '../ui/types';

import { Heightmap } from "../heightmap/types";
import { drawWeapons } from "./weapon";
import { drawTargets } from "./target";
import { drawKeypadIndicator, drawKeypadLabel } from "./common";
import { ZOOM_LEVEL_2, ZOOM_LEVEL_3 } from "../camera/constants";
import { getZoom } from "../camera/camera";
import { TEXT_GREEN, TEXT_RED } from "./constants";
import { Contourmap } from "../contourmap/types";
import { getComponent, getEntitiesByType, getEntity } from "../world/world";
import { EntityComponent } from "../world/components/entity";
import { WeaponComponent } from "../world/components/weapon";
import produce from "immer";
import {drawIcons} from "./icon";
import {drawSquare} from "./selection/square";
import {drawLineSelection} from "./selection/line";
import {Terrainmap} from "../terrainmap/types";

/**
 * 绘制直线
 * @param ctx Canvas绘制上下文
 * @param x0 起点X坐标
 * @param y0 起点Y坐标
 * @param x1 终点X坐标
 * @param y1 终点Y坐标
 */
export const drawLine: (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => void =
  (ctx, x0, y0, x1, y1) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

/**
 * 绘制屏幕宽度的直线（像素对齐优化）
 * 对坐标进行四舍五入并添加0.5像素偏移，确保线条清晰显示
 * @param ctx Canvas绘制上下文
 * @param x0 起点X坐标
 * @param y0 起点Y坐标
 * @param x1 终点X坐标
 * @param y1 终点Y坐标
 */
const drawLineScreenWidth: (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => void =
  (ctx, x0, y0, x1, y1) => {
    ctx.save()
    ctx.beginPath();
    // 像素对齐优化，确保线条清晰
    ctx.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5);
    ctx.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
    ctx.resetTransform();
    ctx.stroke();
    ctx.restore();
  }

/**
 * 绘制武器精度椭圆
 * 用于显示武器的射击精度范围，包括水平、近距离和远距离散布
 * @param ctx Canvas绘制上下文
 * @param weaponToTargetVec 武器到目标的向量
 * @param horizontalRadius 水平散布半径
 * @param closeRadius 近距离散布半径
 * @param farRadius 远距离散布半径
 * @param selected 是否选中状态（影响填充效果）
 */
export function drawSpreadEllipse(ctx: CanvasRenderingContext2D, weaponToTargetVec: vec3, horizontalRadius: number, closeRadius: number, farRadius: number,selected:boolean=false){
  let dx = weaponToTargetVec[0];
  let dy = weaponToTargetVec[1];
  // 计算椭圆旋转角度，使其朝向目标
  let ellRot = Math.atan2(dy, dx) + Math.PI/2;

  ctx.save()
  ctx.beginPath();
  // 绘制椭圆的上半部分（远距离）
  ctx.ellipse(0, 0, horizontalRadius, farRadius, ellRot, Math.PI, 2 * Math.PI);
  // 绘制椭圆的下半部分（近距离）
  ctx.ellipse(0, 0, horizontalRadius, closeRadius, ellRot, 0, Math.PI);
  ctx.stroke();
  
  // 如果选中，填充椭圆
  if(selected){
      ctx.fill()
  }
  ctx.restore();
}

/**
 * 绘制纹理
 * @param ctx Canvas绘制上下文
 * @param transform 变换矩阵
 * @param texture 纹理对象
 */
export const drawTexture = (ctx: CanvasRenderingContext2D, transform: Transform, texture: Texture) => {
  // 确保图像已加载完成
  if (texture.image.complete && texture.image.naturalWidth !== 0){
    ctx.save();
    applyTransform(ctx, texture.transform)
    ctx.drawImage(texture.image, 0, 0);
    ctx.restore();
  }
}

/**
 * 绘制网格
 * 根据缩放级别绘制不同精度的网格线
 * @param ctx Canvas绘制上下文
 * @param zoom 缩放级别
 * @param mapSize 地图尺寸
 */
function drawGrid(ctx: CanvasRenderingContext2D, zoom: number, mapSize: vec3) {
  const start_x = 0;
  const start_y = 0;
  const end_x = mapSize[0];
  const end_y = mapSize[1];

  /**
   * 绘制半个网格（垂直或水平线）
   * @param start 起始坐标
   * @param end 结束坐标
   * @param bound1 边界1
   * @param bound2 边界2
   * @param drawLine 绘制线条的函数
   */
  //@ts-ignore
  const halfGrid = (start, end, bound1, bound2, drawLine) => {
    for (let i = 1; start_x + i * 10000/3 < end ; i++){
      if (i % 9 == 0){
        // 主要网格线（粗黑线）
        ctx.strokeStyle = 'black';
        ctx.lineWidth = zoom > ZOOM_LEVEL_2 ? 2 : 1;
        drawLine(ctx, start + i * 10000/3, bound1, start + i * 10000/3, bound2)
      } else if (zoom > ZOOM_LEVEL_2 && i % 3 == 0){
        // 中等网格线（细黑线）
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        drawLine(ctx, start + i * 10000/3, bound1, start + i * 10000/3, bound2)
      } else if (zoom > ZOOM_LEVEL_3){
        // 细网格线（灰色）
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1;
        drawLine(ctx, start + i * 10000/3, bound1, start + i * 10000/3, bound2)
      }
    }
  }
  
  // 绘制垂直网格线
  halfGrid(start_x, end_x, start_y, end_y, drawLineScreenWidth)
  // 绘制水平网格线（参数顺序交换）
  //@ts-ignore
  const drawLineScreenWidthSwapped = (ctx, y0, x0, y1, x1) => drawLineScreenWidth(ctx, x0, y0, x1, y1);
  halfGrid(start_y, end_y, start_x, end_x, drawLineScreenWidthSwapped)
}

/**
 * 绘制背景
 * @param ctx Canvas绘制上下文
 */
const drawBackground: (ctx: CanvasRenderingContext2D) => void =
  ctx => {
    const canvas = ctx.canvas;
    ctx.fillStyle = "#050505"; // 深灰色背景
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

/**
 * 绘制小地图
 * @param ctx Canvas绘制上下文
 * @param minimap 小地图对象
 * @param zoom 缩放级别
 * @param settings 用户设置
 */
const drawMinimap: (ctx: CanvasRenderingContext2D, minimap: Minimap, zoom:number, settings: UserSettings) => void =
  (ctx, minimap, zoom, settings) => {
    ctx.save()
    applyTransform(ctx, minimap.transform)
    drawTexture(ctx, minimap.transform, minimap.texture);
    
    // 如果启用网格显示
    if(settings.mapGrid){
      drawGrid(ctx, zoom, minimap.size)
    }
    ctx.restore();
  }

/**
 * 绘制地形图
 * @param ctx Canvas绘制上下文
 * @param terrainmap 地形图对象
 * @param zoom 缩放级别
 * @param settings 用户设置
 */
const drawTerrainmap: (ctx: CanvasRenderingContext2D, terrainmap: Terrainmap, zoom:number, settings: UserSettings) => void =
    (ctx, terrainmap, zoom, settings) => {
        // 检查是否启用地形图显示
        if(!settings.terrainmap)
            return
        ctx.save()
        applyTransform(ctx, terrainmap.transform)
        drawTexture(ctx, terrainmap.transform, terrainmap.texture);
        
        // 如果启用网格显示
        if(settings.mapGrid){
            drawGrid(ctx, zoom, terrainmap.size)
        }
        ctx.restore();
    }

/**
 * 绘制等高线图
 * @param ctx Canvas绘制上下文
 * @param contourmap 等高线图对象
 * @param settings 用户设置
 */
const drawContourmap: (ctx: CanvasRenderingContext2D, contourmap: Contourmap, settings: UserSettings) => void =
  (ctx, contourmap, settings) => {
    // 检查等高线图是否准备就绪
    if ($contourmap.is_ready()) {
      ctx.save()
      applyTransform(ctx, contourmap.transform)
      applyTransform(ctx, ($contourmap.transform))
      applyTransform(ctx, contourmap.texture.transform)
      ctx.drawImage($contourmap.get_canvas(), 0, 0);
      ctx.restore();
    }
  }

/**
 * 绘制高度图
 * @param ctx Canvas绘制上下文
 * @param heightmap 高度图对象
 * @param settings 用户设置
 */
const drawHeightmap: (ctx: CanvasRenderingContext2D, heightmap: Heightmap, settings: UserSettings) => void =
  (ctx, heightmap, settings) => {
    ctx.save()
    applyTransform(ctx, heightmap.transform)
    drawTexture(ctx, heightmap.transform, heightmap.texture);
    ctx.restore();
  }

/**
 * 获取Canvas缩放变换矩阵
 * 用于在屏幕上以固定大小绘制元素（如图标），不受相机缩放影响
 * @param camera 相机对象
 * @returns 变换矩阵
 */
export const canvasScaleTransform: (camera: Camera) => Transform =
  camera => {
    // 获取相机缩放值并取反，实现固定屏幕尺寸效果
    let scale = mat4.getScaling(vec3.create(), camera.transform)
    scale = vec3.inverse(scale, scale);
    return mat4.fromScaling(mat4.create(), scale);
  }

/**
 * 绘制放置辅助器
 * 在拖拽武器或目标时显示网格辅助线和标签
 * @param ctx Canvas绘制上下文
 * @param camera 相机对象
 * @param userSettings 用户设置
 * @param uiState UI状态
 * @param world 世界对象
 * @param minimap 小地图对象
 */
const drawPlacementHelpers = (ctx: CanvasRenderingContext2D, camera:Camera, userSettings: UserSettings, uiState: UIState, world: World, minimap: Minimap) => {
  // 检查是否正在拖拽实体
  if (uiState.mouseDown && uiState.dragEntityId !== -1 && uiState.dragEntityId !== null){
    const entity = getComponent<EntityComponent>(world, uiState.dragEntityId, "entity");
    
    // 只为武器和目标显示辅助器
    if (entity?.entityType === "Weapon" || entity?.entityType === "Target"){
      let transformComponent = getComponent<HasTransform>(world, uiState.dragEntityId, "transform");
      if (transformComponent){
        let location = mat4.getTranslation(vec3.create(), transformComponent.transform);
        
        if (entity?.entityType === "Weapon"){
          // 武器放置辅助器（绿色）
          if (userSettings.weaponPlacementHelper){
            drawKeypadIndicator(ctx, minimap, location, TEXT_GREEN, camera);
          }
          if (userSettings.weaponPlacementLabel){
            drawKeypadLabel(ctx, minimap, location, TEXT_GREEN, camera, userSettings.fontSize)
          }
        } else if (entity?.entityType === "Target"){
          // 目标放置辅助器（红色）
          if (userSettings.targetPlacementHelper){
            drawKeypadIndicator(ctx, minimap, location, TEXT_RED, camera);
          }
          if (userSettings.targetPlacementLabel){
            drawKeypadLabel(ctx, minimap, location, TEXT_RED, camera, userSettings.fontSize)
          }
        }
      }
    }
  }
}

/**
 * 主渲染函数
 * 协调所有渲染组件，按正确顺序绘制整个场景
 * @param store Redux store对象
 */
export const drawAll = (store: Store0) => {
  const state = store.getState();
  if ($canvas && $canvas.getContext("2d")){
    // 性能测量（已注释）
    //const t0 = performance.now();
    
    const ctx = setupCanvas($canvas)
    const zoom = getZoom(state.camera);
    
    // 获取所有需要渲染的实体
    const targets = getEntitiesByType<Target>(state.world, "Target");
    const weapons = getEntitiesByType<Weapon>(state.world, "Weapon");
    const icons = Array.from(state.world.components.icon.values()).map(f=>{
        return {
            ...f,
            transform:state.world.components.transform.get(f.entityId)
        }
    })
    const dirDatas = state.world.components.dirData
    
    ctx.save();
    
    // 渲染顺序很重要：从底层到顶层
    drawBackground(ctx)                    // 1. 背景
    applyTransform(ctx, state.camera.transform)
    drawMinimap(ctx, state.minimap, zoom, state.userSettings);        // 2. 小地图
    drawTerrainmap(ctx, state.terrainmap, zoom, state.userSettings);  // 3. 地形图
    drawContourmap(ctx, state.contourmap, state.userSettings);        // 4. 等高线图
    // drawHeightmap(ctx, state.heightmap, state.userSettings);       // 5. 高度图（已禁用）
    drawWeapons(ctx, state.userSettings, state.camera, weapons);      // 6. 武器
    drawTargets(ctx, weapons, targets,state,dirDatas,state.session?.userId??"0"); // 7. 目标
    drawPlacementHelpers(ctx, state.camera, state.userSettings, state.uiState, state.world, state.minimap); // 8. 放置辅助器
    drawIcons(ctx,state.camera, icons,state.images);                 // 9. 图标
    drawSquare(ctx,state.camera,state.world.components.selection.get(0)??null);  // 10. 方形选择
    drawLineSelection(ctx,state.camera,state.world.components.selection.get(1)??null) // 11. 线性选择

    ctx.restore();
    
    // 性能测量（已注释）
    //const t1 = performance.now();
    //console.log(`drawAll took ${t1 - t0} ms.`);
  }
}

/**
 * 绘制带轮廓的文本
 * 先绘制白色轮廓，再绘制彩色填充，确保文本在任何背景下都清晰可见
 * @param ctx Canvas绘制上下文
 * @param text 要绘制的文本
 * @param baseline 文本基线位置
 * @param fillStyle 填充颜色
 * @param strokeStyle 轮廓颜色
 * @param fontSize 字体大小
 * @param bold 是否加粗
 */
export const outlineText: (
    ctx: CanvasRenderingContext2D,
    text: string,
    baseline: "middle" | "bottom" | "top",
    fillStyle: string,
    strokeStyle: string,
    fontSize: number,
    bold: boolean
  ) => void =
  (ctx, text, baseline, fillStyle, strokeStyle, fontSize, bold) => {
    ctx.save();
    ctx.font = `${bold ? "bold": ""} ${fontSize}px sans-serif`;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.textBaseline = baseline;

    // 先绘制轮廓，再绘制填充
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

/**
 * 绘制纯文本（无轮廓）
 * @param ctx Canvas绘制上下文
 * @param text 要绘制的文本
 * @param baseline 文本基线位置
 * @param fillStyle 填充颜色
 * @param fontSize 字体大小
 * @param bold 是否加粗
 */
export const text: (ctx: CanvasRenderingContext2D, text: string, baseline: "middle" | "bottom" | "top", fillStyle: string, fontSize: number, bold: boolean) => void =
  (ctx, text, baseline, fillStyle, fontSize, bold) => {
    ctx.save();
    ctx.font = `${bold ? "bold": ""} ${fontSize}px sans-serif`;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.fillStyle = fillStyle;
    ctx.textBaseline = baseline;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

/**
 * 设置轮廓文本样式
 * @param ctx Canvas绘制上下文
 */
export const setOutlineTextStyles: (ctx: CanvasRenderingContext2D) => void =
  ctx => {
    ctx.lineWidth = 3;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeStyle = 'rgb(255, 255, 255)';
}

/**
 * 从平移坐标创建变换矩阵
 * @param x X坐标
 * @param y Y坐标
 * @returns 变换矩阵
 */
const fromTranslation: (x: number, y:number) => Transform =
  (x, y) => mat4.fromTranslation(mat4.create(), [x, y, 0])

/**
 * 从缩放值创建变换矩阵
 * @param xy 缩放因子
 * @returns 变换矩阵
 */
const fromScaling: (xy: number) => Transform =
  (xy) => mat4.fromScaling(mat4.create(), [xy, xy, 1])

/**
 * 设置Canvas高DPI支持
 * 根据设备像素比调整Canvas尺寸，确保在高分辨率屏幕上显示清晰
 * @param canvas HTML Canvas元素
 * @returns Canvas 2D绘制上下文
 */
function setupCanvas(canvas: HTMLCanvasElement) {
  // 获取设备像素比，默认为1
  const dpr = window.devicePixelRatio || 1;
  let ctx = canvas.getContext('2d')!;

  // 获取Canvas的CSS像素尺寸
  const rect = canvas.getBoundingClientRect();
  
  // 设置Canvas的实际像素尺寸
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // 缩放绘制上下文以保持变换完整性
  ctx.scale(dpr, dpr);
  
  // 通过CSS强制显示尺寸（响应式）
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  
  return ctx;
}