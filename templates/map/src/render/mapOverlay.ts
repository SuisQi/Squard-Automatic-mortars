/**
 * 地图贴图渲染模块
 * 将截图通过透视变换绘制到底图上
 */
import { MapOverlayState } from '../mapoverlay/types';
import { Minimap } from '../minimap/types';
import { applyTransform } from '../world/transformations';

/**
 * 绘制地图贴图
 *
 * 使用双线性插值网格细分方法将截图叠加到战术地图上
 * 这是一种近似透视变换的方法，真正的透视变换需要 WebGL
 */
export function drawMapOverlay(
    ctx: CanvasRenderingContext2D,
    overlay: MapOverlayState,
    minimap: Minimap
): void {
    // 检查是否有有效的贴图数据
    if (!overlay.enabled ||
        !overlay.screenshotImage ||
        !overlay.corners ||
        !overlay.homography) {
        return;
    }

    const img = overlay.screenshotImage;
    if (!img.complete || img.naturalWidth === 0) {
        return;
    }

    ctx.save();

    // 设置透明度
    ctx.globalAlpha = overlay.opacity;

    // 应用 minimap 变换，将绘制坐标系对齐到 minimap
    applyTransform(ctx, minimap.transform);

    // 使用网格细分绘制透视变换后的图像
    drawQuadrilateralImage(ctx, img, overlay.corners, minimap);

    ctx.restore();
}

/**
 * 将图像绘制到四边形区域（透视近似）
 *
 * 使用多个小块进行细分，通过双线性插值近似透视变换效果
 */
function drawQuadrilateralImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    corners: [number, number][],
    minimap: Minimap
): void {
    // corners: [左上, 右上, 右下, 左下] (相对于原始底图的像素坐标)
    if (corners.length !== 4) {
        return;
    }

    // 获取 minimap 尺寸和纹理尺寸
    const mapSize = minimap.size;
    const textureWidth = minimap.texture.image.naturalWidth || 4096;
    const textureHeight = minimap.texture.image.naturalHeight || 4096;

    // 计算缩放比例：世界坐标 / 纹理像素
    const scaleX = mapSize[0] / textureWidth;
    const scaleY = mapSize[1] / textureHeight;

    // 将四角点从纹理像素坐标转换为 minimap 本地坐标（世界单位）
    // 注意：minimap.transform 已经处理了平移，这里只需要缩放
    const worldCorners: [number, number][] = corners.map(([px, py]) => [
        px * scaleX,
        py * scaleY
    ]);


    // 使用网格细分绘制以近似透视效果
    const divisions = 10;  // 细分数量，越大越精确但性能开销越大
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
            // 计算当前网格的四个角在 [0,1] 范围内的位置
            const u0 = i / divisions;
            const u1 = (i + 1) / divisions;
            const v0 = j / divisions;
            const v1 = (j + 1) / divisions;

            // 双线性插值计算目标四角的世界坐标
            const p00 = bilinearInterpolate(worldCorners, u0, v0);
            const p10 = bilinearInterpolate(worldCorners, u1, v0);
            const p11 = bilinearInterpolate(worldCorners, u1, v1);
            const p01 = bilinearInterpolate(worldCorners, u0, v1);

            // 源图像区域
            const sx = u0 * imgW;
            const sy = v0 * imgH;
            const sw = (u1 - u0) * imgW;
            const sh = (v1 - v0) * imgH;

            // 绘制变换后的小块（使用仿射近似）
            drawAffineQuad(ctx, img, sx, sy, sw, sh, p00, p10, p01);
        }
    }
}

/**
 * 双线性插值
 *
 * 根据 u,v 参数 (0-1) 在四边形内插值
 */
function bilinearInterpolate(
    corners: [number, number][],
    u: number,
    v: number
): [number, number] {
    const [tl, tr, br, bl] = corners;

    // 顶边插值
    const topX = tl[0] + (tr[0] - tl[0]) * u;
    const topY = tl[1] + (tr[1] - tl[1]) * u;

    // 底边插值
    const botX = bl[0] + (br[0] - bl[0]) * u;
    const botY = bl[1] + (br[1] - bl[1]) * u;

    // 垂直插值
    return [
        topX + (botX - topX) * v,
        topY + (botY - topY) * v
    ];
}

/**
 * 使用仿射变换绘制图像小块
 *
 * 将源图像的一个矩形区域变换到目标四边形
 * 使用三个点确定仿射变换矩阵
 */
function drawAffineQuad(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number,
    p0: [number, number],  // 左上
    p1: [number, number],  // 右上
    p3: [number, number]   // 左下
): void {
    if (sw <= 0 || sh <= 0) return;

    ctx.save();

    // 计算仿射变换矩阵
    // 源坐标: (0,0), (sw, 0), (0, sh)
    // 目标坐标: p0, p1, p3
    const dx1 = p1[0] - p0[0];
    const dy1 = p1[1] - p0[1];
    const dx2 = p3[0] - p0[0];
    const dy2 = p3[1] - p0[1];

    // 使用 transform() 而不是 setTransform()
    // transform() 会与当前变换矩阵组合，保留 camera 和 minimap 的变换
    ctx.transform(
        dx1 / sw, dy1 / sw,
        dx2 / sh, dy2 / sh,
        p0[0], p0[1]
    );

    // 绘制图像
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    ctx.restore();
}
