/**
 * 地图贴图渲染模块
 * 将后端透视变换后的图像直接绘制到底图上
 * 后端已完成透视变换，前端只需简单 drawImage
 */
import { MapOverlayState } from '../mapoverlay/types';
import { Minimap } from '../minimap/types';
import { applyTransform } from '../world/transformations';

/**
 * 绘制地图贴图
 * 直接绘制已透视变换的图像到指定位置
 */
export function drawMapOverlay(
    ctx: CanvasRenderingContext2D,
    overlay: MapOverlayState,
    minimap: Minimap
): void {
    if (!overlay.enabled || !overlay.warpedImage || !overlay.bounds) {
        return;
    }

    const img = overlay.warpedImage;
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }

    const [minX, minY, maxX, maxY] = overlay.bounds;
    const drawWidth = maxX - minX;
    const drawHeight = maxY - minY;

    // 坐标转换：像素坐标 -> 世界坐标
    const mapSize = minimap.size;
    const textureWidth = minimap.texture.image.naturalWidth || 4096;
    const textureHeight = minimap.texture.image.naturalHeight || 4096;
    const scaleX = mapSize[0] / textureWidth;
    const scaleY = mapSize[1] / textureHeight;

    const worldX = minX * scaleX;
    const worldY = minY * scaleY;
    const worldW = drawWidth * scaleX;
    const worldH = drawHeight * scaleY;

    ctx.save();
    ctx.globalAlpha = overlay.opacity;
    applyTransform(ctx, minimap.transform);

    // 直接绘制图像到目标位置
    ctx.drawImage(img, worldX, worldY, worldW, worldH);

    ctx.restore();
}

/**
 * 清除贴图缓存（保留接口兼容性）
 */
export function clearMapOverlayCache(): void {
    // 不再需要缓存，保留空函数以兼容
}
