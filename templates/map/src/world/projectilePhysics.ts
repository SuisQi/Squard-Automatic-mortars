import {vec3} from "gl-matrix";
import {$s5map} from "../elements";
import {FiringSolutionTable} from "./rocketTables";
import { US_MIL, GRAVITY } from "./constants"; // 保留通用常量

/**
 * 计算抛射体发射角度
 * @param x 水平距离
 * @param startHeightOffset 起始高度偏移
 * @param v 初速度
 * @param g 重力加速度
 * @param isHighArc 是否为高弧弹道
 * @param dragCoefficient 空气阻力系数
 * @returns 发射角度（弧度）
 */
function calcAngle(x: number, startHeightOffset: number, v: number, g: number, isHighArc: boolean, dragCoefficient: number = 0) {
    // 计算垂直位移
    const y = -startHeightOffset;
    // 计算判别式
    const d = Math.sqrt(v ** 4 - g * (g * x ** 2 + 2 * y * v ** 2) - dragCoefficient * v ** 2);
    // 根据弹道类型计算角度
    const rad = Math.atan((v ** 2 + (isHighArc ? d : -d)) / (g * x));
    return rad;
}

/**
 * 计算高弧弹道发射角度
 * @param x 水平距离
 * @param startHeightOffset 起始高度偏移
 * @param v 初速度
 * @param g 重力加速度
 * @param dragCoefficient 空气阻力系数
 * @returns 发射角度（弧度）
 */
export function calcAngleHigh(x: number, startHeightOffset: number, v: number, g: number, dragCoefficient: number = 0) {
    return calcAngle(x, startHeightOffset, v, g, true, dragCoefficient);
}

/**
 * 计算低弧弹道发射角度
 * @param x 水平距离
 * @param startHeightOffset 起始高度偏移
 * @param v 初速度
 * @param g 重力加速度
 * @param dragCoefficient 空气阻力系数
 * @returns 发射角度（弧度）
 */
function calcAngleLow(x: number, startHeightOffset: number, v: number, g: number, dragCoefficient: number = 0) {
    // https://en.wikipedia.org/wiki/Projectile_motion
    // -> Angle {\displaystyle \theta } \theta required to hit coordinate (x,y)
    return calcAngle(x, startHeightOffset, v, g, false, dragCoefficient);
}

/**
 * 解算抛射体飞行路径（高弧）
 * @param x0 起始点X坐标
 * @param y0 起始点Y坐标
 * @param z0 起始点Z坐标
 * @param x1 目标点X坐标
 * @param y1 目标点Y坐标
 * @param z1 目标点Z坐标
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param dragCoefficient 空气阻力系数
 * @returns [角度, 方向, 距离]
 */
export function solveProjectileFlightHighArc(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, velocity: number, gravity: number, dragCoefficient: number = 0): [number, number, number] {
    //console.log("calc log", x0, x0, z0, x1, y1, z1, velocity)
    // 计算水平位移
    const dx = x1 - x0;
    const dy = y1 - y0;
    // 计算水平距离
    const dist2d = Math.round(Math.hypot(dx, dy));
    // 计算方向角
    const dir = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360 * 100) / 100;
    // 计算发射角度
    const angle = calcAngleHigh(dist2d, z0 - z1, velocity, gravity, dragCoefficient);
    return [angle, dir, dist2d];
}

/**
 * 解算抛射体飞行路径（低弧）
 * @param x0 起始点X坐标
 * @param y0 起始点Y坐标
 * @param z0 起始点Z坐标
 * @param x1 目标点X坐标
 * @param y1 目标点Y坐标
 * @param z1 目标点Z坐标
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param dragCoefficient 空气阻力系数
 * @returns [角度, 方向, 距离]
 */
export function solveProjectileFlightLowArc(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, velocity: number, gravity: number, dragCoefficient: number = 0): [number, number, number] {
    //console.log("calc log", x0, x0, z0, x1, y1, z1, velocity)
    // 计算水平位移
    const dx = x1 - x0;
    const dy = y1 - y0;
    // 计算水平距离
    const dist2d = Math.round(Math.hypot(dx, dy));
    // 计算方向角
    const dir = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360 * 100) / 100;
    // 计算发射角度
    const angle = calcAngleLow(dist2d, z0 - z1, velocity, gravity, dragCoefficient);
    return [angle, dir, dist2d];
}

/**
 * 计算两点之间的距离和方向
 * @param vec1 起始点坐标
 * @param vec2 目标点坐标
 * @returns [距离, 方向]
 */
export function distDir(vec1: vec3, vec2: vec3) {
    const dx = vec2[0] - vec1[0];
    const dy = vec2[1] - vec1[1];
    const dist2d = Math.round(Math.hypot(dx, dy));
    const dir = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360 * 100) / 100;
    return [dist2d, dir]
}

/**
 * 计算给定角度下抛射体的地面距离
 * @param angle 发射角度
 * @param startHeightOffset 起始高度偏移
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @returns 地面距离
 */
export function angle2groundDistance(angle: number, startHeightOffset: number, velocity: number, gravity: number): number {
    // distance over ground - for map drawing purposes
    const d = Math.sqrt(velocity ** 2 * Math.sin(angle) ** 2 + 2 * gravity * startHeightOffset);
    if (isNaN(d)) { // cannot reach this height
        return 0;
    } else {
        return velocity * Math.cos(angle) * (velocity * Math.sin(angle) + d) / gravity;
    }
}

/**
 * 计算抛射体飞行时间
 * @param angle 发射角度
 * @param startHeightOffset 起始高度偏移
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @returns 飞行时间
 */
export function flightTime(angle: number, startHeightOffset: number, velocity: number, gravity: number): number {
    //Math.atan((v ** 2 + d) / (g * x));
    const heightComponent =
        Math.sqrt(
            (velocity * Math.sin(angle)) ** 2
            + 2 * gravity * startHeightOffset
        );
    return (velocity * Math.sin(angle) + heightComponent) / gravity
}

/**
 * 计算高弧弹道的散布参数
 * @param dist 水平距离
 * @param startHeightOffset 起始高度偏移
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param deviation 偏差角度
 * @returns [水平散布, 近距离散布, 远距离散布]
 */
export function calcSpreadHigh(dist: number, startHeightOffset: number, velocity: number, gravity: number, deviation: number): [number, number, number] {
    const centerAngle = calcAngleHigh(dist, startHeightOffset, velocity, gravity);
    const close = angle2groundDistance(centerAngle + deviation, startHeightOffset, velocity, gravity)
    const far = angle2groundDistance(centerAngle - deviation, startHeightOffset, velocity, gravity)
    // i'm too lazy for the true horizontal component so i'll approximate it via
    // time of (accurate) flight and max horizontal deviation speed - should be close enough for small deviation angles.
    // ^ essentially linear approximation of angle change
    const horizontalSpeed = Math.sin(deviation) * velocity;
    return [horizontalSpeed * flightTime(centerAngle, startHeightOffset, velocity, gravity), Math.max(0, dist - close), Math.max(0, far - dist)];
}

/**
 * 计算低弧弹道的散布参数
 * @param dist 水平距离
 * @param startHeightOffset 起始高度偏移
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param deviation 偏差角度
 * @returns [水平散布, 近距离散布, 远距离散布]
 */
export function calcSpreadLow(dist: number, startHeightOffset: number, velocity: number, gravity: number, deviation: number): [number, number, number] {
    const centerAngle = calcAngleLow(dist, startHeightOffset, velocity, gravity);
    const close = angle2groundDistance(centerAngle - deviation, startHeightOffset, velocity, gravity)
    const far = angle2groundDistance(centerAngle + deviation, startHeightOffset, velocity, gravity)
    // i'm too lazy for the true horizontal component so i'll approximate it via
    // time of (accurate) flight and max horizontal deviation speed - should be close enough for small deviation angles.
    // ^ essentially linear approximation of angle change
    const horizontalSpeed = Math.sin(deviation) * velocity;
    return [horizontalSpeed * flightTime(centerAngle, startHeightOffset, velocity, gravity), Math.max(0, dist - close), Math.max(0, far - dist)];
}

export type FiringSolution = {
    weaponTranslation: vec3,
    targetTranslation: vec3,
    weaponToTargetVec: vec3,
    angle: number,
    dir: number,
    dist: number,
    startHeightOffset: number,
    time: number,
    horizontalSpread: number,
    closeSpread: number,
    farSpread: number,
}

export const getUsMil = (angle: number): number => angle * US_MIL
export const getDist = (start: vec3, end: vec3): number => Math.hypot(end[0] - start[0], end[1] - start[1])
export const getStartHeightOffset = (start: vec3, end: vec3): number => end[2] - start[2]

export type FiringSolutionPair = {
    lowArc: FiringSolution,
    highArc: FiringSolution
}

/**
 * 弹道求解器接口
 */
type Solver = {
    pathSolver: Function,
    spreadSolver: Function,
}

/**
 * 低弧弹道求解器
 */
const lowArcSolver: Solver = Object.freeze({
    pathSolver: solveProjectileFlightLowArc,
    spreadSolver: calcSpreadLow,
})

/**
 * 高弧弹道求解器
 */
const highArcSolver: Solver = Object.freeze({
    pathSolver: solveProjectileFlightHighArc,
    spreadSolver: calcSpreadHigh,
})

/**
 * 计算抛射体射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param deviation 偏差角度
 * @param solver 弹道求解器
 * @param dragCoefficient 空气阻力系数
 * @returns 射击解决方案
 */
const getProjectileSolution = (weaponTranslation: vec3, targetTranslation: vec3, velocity: number, gravity: number, deviation: number, solver: Solver, dragCoefficient: number = 0): FiringSolution => {
    // 计算起始高度偏移
    const startHeightOffset = weaponTranslation[2] - targetTranslation[2];
    // 计算武器到目标的向量
    const weaponToTargetVec = vec3.subtract(vec3.create(), targetTranslation, weaponTranslation);
    // 使用求解器计算角度、方向和距离
    const [angle, dir, dist] = solver.pathSolver(
        weaponTranslation[0], weaponTranslation[1], weaponTranslation[2],
        targetTranslation[0], targetTranslation[1], targetTranslation[2],
        velocity,
        gravity,
        dragCoefficient
    );
    // 计算散布参数
    const [horizontalSpread, closeSpread, farSpread] = solver.spreadSolver(dist, startHeightOffset, velocity, gravity, deviation)
    // 计算飞行时间
    const time = flightTime(angle, startHeightOffset, velocity, gravity)
    // 返回冻结的对象以防止修改
    return Object.freeze({
        weaponTranslation,
        targetTranslation,
        weaponToTargetVec,
        angle,
        dir,
        dist,
        startHeightOffset,
        time,
        horizontalSpread,
        closeSpread,
        farSpread,
    })
}

/**
 * 获取抛射体射击解决方案对（高弧和低弧）
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @param velocity 初速度
 * @param gravity 重力加速度
 * @param deviation 偏差角度
 * @param dragCoefficient 空气阻力系数
 * @returns 射击解决方案对
 */
export const getProjectileSolutionPair = (weaponTranslation: vec3, targetTranslation: vec3, velocity: number, gravity: number, deviation: number, dragCoefficient: number = 0): FiringSolutionPair => {
    return Object.freeze({
        lowArc: getProjectileSolution(weaponTranslation, targetTranslation, velocity, gravity, deviation, lowArcSolver, dragCoefficient),
        highArc: getProjectileSolution(weaponTranslation, targetTranslation, velocity, gravity, deviation, highArcSolver,dragCoefficient),
    })
}

// 迫击炮常量
const MORTAR_VELOCITY = 10989; // cm/s
const MORTAR_DEVIATION = 50 / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"

/**
 * 获取迫击炮射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案对
 */
export const getMortarFiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolutionPair => {
    return getProjectileSolutionPair(weaponTranslation, targetTranslation, MORTAR_VELOCITY, GRAVITY, MORTAR_DEVIATION);
};

// M121迫击炮常量
const M121_VELOCITY = 14200; // cm/s
const M121_DRAG = 0;
const M121_DEVIATION = 40 / 60 * Math.PI / 180 / 2;

/**
 * 获取M121迫击炮射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案对
 */
export const getM121FiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolutionPair => {
    return getProjectileSolutionPair(weaponTranslation, targetTranslation, M121_VELOCITY, GRAVITY, M121_DEVIATION, M121_DRAG);
};

// MK19常量
const MK19_VELOCITY = 23600; // cm/s
const MK19_DEVIATION = 35 / 60 * Math.PI / 180 / 2;

/**
 * 获取MK19榴弹发射器射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案对
 */
export const getMK19FiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolutionPair => {
    return getProjectileSolutionPair(weaponTranslation, targetTranslation, MK19_VELOCITY, GRAVITY, MK19_DEVIATION);
};

// 地狱大炮常量
const HELL_CANNON_VELOCITY = 9500; // cm/s
const HELL_CANNON_DEVIATION = 100 / 60 * Math.PI / 180 / 2;

/**
 * 获取地狱大炮射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案对
 */
export const getHellCannonFiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolutionPair => {
    return getProjectileSolutionPair(weaponTranslation, targetTranslation, HELL_CANNON_VELOCITY, GRAVITY, HELL_CANNON_DEVIATION);
};

// BM21常量
const BM21_VELOCITY = 20000; // cm/s
const BM21_GRAVITY = 2 * GRAVITY; // cm/s^2
const BM21_DEVIATION = 200 / 60 * Math.PI / 180 / 2;

/**
 * 获取BM21火箭炮射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案对
 */
export const getBM21FiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolutionPair => {
    return getProjectileSolutionPair(weaponTranslation, targetTranslation, BM21_VELOCITY, BM21_GRAVITY, BM21_DEVIATION);
};


/**
 * 从表格数据获取射击解决方案
 * @param table 射击解决方案表格
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案
 */
const getTableFiringSolution = (table: FiringSolutionTable, weaponTranslation: vec3, targetTranslation: vec3): FiringSolution => {
    // 计算起始高度偏移
    const startHeightOffset = weaponTranslation[2] - targetTranslation[2];
    // 计算距离和方向
    const [dist, dir] = distDir(weaponTranslation, targetTranslation);
    // 计算武器到目标的向量
    const weaponToTargetVec = vec3.subtract(vec3.create(), weaponTranslation, targetTranslation)
    // 从表格获取角度
    const angle = table.getAngle(dist, startHeightOffset)
    // 从表格获取时间
    const time = table.getTime(dist, startHeightOffset)
    // 计算密位
    const mil = angle * US_MIL;
    // 限制密位范围
    const milCapped = mil < 800 ? 0 : mil;
    // 四舍五入密位值
    const milRounded = Math.floor(milCapped * 10) / 10;
    // 计算水平散布
    const horizontalSpread = table.calcSpreadHorizontal(dist, startHeightOffset)
    // 计算垂直散布
    let spread = table.calcSpreadVertical(dist, startHeightOffset) // "temp" hack...
    let closeSpread = spread[0];
    let farSpread = spread[1]
    // 处理近距离散布为0的情况
    closeSpread = closeSpread != 0 ? closeSpread : dist;
    // 返回冻结的对象以防止修改
    return Object.freeze({
        weaponTranslation,
        targetTranslation,
        weaponToTargetVec,
        startHeightOffset,
        angle,
        angleLow: 0,
        dir,
        dist,
        time,
        timeLow: 0,
        mil,
        milCapped,
        milRounded,
        horizontalSpread,
        closeSpread,
        farSpread,
    })
}

/**
 * 获取S5火箭弹射击解决方案
 * @param weaponTranslation 武器位置
 * @param targetTranslation 目标位置
 * @returns 射击解决方案
 */
export const getS5FiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolution => getTableFiringSolution($s5map, weaponTranslation, targetTranslation)

// rip this work....
//export const getBM21FiringSolution = (weaponTranslation: vec3, targetTranslation: vec3): FiringSolution => getTableFiringSolution($bm21map, weaponTranslation, targetTranslation)
