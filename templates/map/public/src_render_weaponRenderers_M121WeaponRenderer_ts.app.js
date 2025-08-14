"use strict";
(self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || []).push([["src_render_weaponRenderers_M121WeaponRenderer_ts"],{

/***/ "./src/render/weaponRenderers/M121WeaponRenderer.ts":
/*!**********************************************************!*\
  !*** ./src/render/weaponRenderers/M121WeaponRenderer.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GRAVITY: () => (/* binding */ GRAVITY),
/* harmony export */   M121WeaponRenderer: () => (/* binding */ M121WeaponRenderer),
/* harmony export */   M121_100_DAMAGE_RANGE: () => (/* binding */ M121_100_DAMAGE_RANGE),
/* harmony export */   M121_25_DAMAGE_RANGE: () => (/* binding */ M121_25_DAMAGE_RANGE),
/* harmony export */   M121_DEVIATION: () => (/* binding */ M121_DEVIATION),
/* harmony export */   M121_DRAG: () => (/* binding */ M121_DRAG),
/* harmony export */   M121_GRAVITY: () => (/* binding */ M121_GRAVITY),
/* harmony export */   M121_MAX_RANGE: () => (/* binding */ M121_MAX_RANGE),
/* harmony export */   M121_MIN_RANGE: () => (/* binding */ M121_MIN_RANGE),
/* harmony export */   M121_MOA: () => (/* binding */ M121_MOA),
/* harmony export */   M121_VELOCITY: () => (/* binding */ M121_VELOCITY),
/* harmony export */   MAPSCALE: () => (/* binding */ MAPSCALE),
/* harmony export */   MORTAR_VELOCITY: () => (/* binding */ MORTAR_VELOCITY),
/* harmony export */   US_MIL: () => (/* binding */ US_MIL)
/* harmony export */ });
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/esm/mat4.js");
/* harmony import */ var gl_matrix__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! gl-matrix */ "./node_modules/gl-matrix/esm/vec3.js");
/* harmony import */ var _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseWeaponRenderer */ "./src/render/weaponRenderers/BaseWeaponRenderer.ts");
/* harmony import */ var _heightmap_heightmap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../heightmap/heightmap */ "./src/heightmap/heightmap.ts");
/* harmony import */ var _world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../world/projectilePhysics */ "./src/world/projectilePhysics.ts");
/* harmony import */ var _canvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../canvas */ "./src/render/canvas.ts");
/* harmony import */ var _world_transformations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../world/transformations */ "./src/world/transformations.ts");
/* harmony import */ var _world_world__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../world/world */ "./src/world/world.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants */ "./src/render/constants.ts");









// M121迫击炮相关常量
const MAPSCALE = 0.01;
const GRAVITY = 980; // cm/s^2
const US_MIL = 1018.59;
const MORTAR_VELOCITY = 10989; // cm/s - 用于网格计算
// M121 120mm迫击炮特有常量
const M121_MOA = 40;
const M121_DRAG = 0;
const M121_VELOCITY = 14200; // cm/s
const M121_GRAVITY = 980; // cm/s^2
const M121_MIN_RANGE = 30000; // cm
const M121_MAX_RANGE = 200000; // cm
const M121_DEVIATION = M121_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
const M121_100_DAMAGE_RANGE = 600; // cm
const M121_25_DAMAGE_RANGE = 4200; // cm
/**
 * 绘制迫击炮网格线（M121使用与标准迫击炮相同的网格系统）
 */
function drawMortarGridLine(ctx, x0, y0, r0, r1, dir) {
    const phi = dir * Math.PI / 180;
    const [kx, ky] = [Math.sin(phi), -Math.cos(phi)];
    (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawLine)(ctx, x0 + kx * r0, y0 + ky * r0, x0 + kx * r1, y0 + ky * r1);
}
/**
 * 绘制迫击炮网格弧线
 */
function drawMortarGridArc(ctx, x0, y0, r, dir) {
    if (r >= 0) {
        const alpha = Math.PI / 180;
        const phi = (dir - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(x0, y0, r, phi - 2 * alpha, phi + 3 * alpha);
        ctx.stroke();
    }
}
/**
 * M121 120mm迫击炮武器渲染器
 * 重型迫击炮，具有更大的射程和威力
 */
class M121WeaponRenderer extends _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__.BaseWeaponRenderer {
    constructor() {
        super(...arguments);
        this.weaponType = "M121";
    }
    // 实现基类抽象方法 - 武器常量
    getVelocity() { return M121_VELOCITY; }
    getGravity() { return M121_GRAVITY; }
    getDeviation() { return M121_DEVIATION; }
    getMinRange() { return M121_MIN_RANGE; }
    getMaxRange() { return M121_MAX_RANGE; }
    getDrag() { return M121_DRAG; }
    get100DamageRange() { return M121_100_DAMAGE_RANGE; }
    get25DamageRange() { return M121_25_DAMAGE_RANGE; }
    getFiringSolution(weaponTranslation, targetTranslation) {
        return (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.getM121FiringSolution)(weaponTranslation, targetTranslation).highArc;
    }
    drawSplash(ctx, lineWidthFactor) {
        ctx.lineWidth = 1 * lineWidthFactor;
        ctx.strokeStyle = '#f00';
        // 绘制100%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, M121_100_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
        // 绘制25%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, M121_25_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected = false) {
        ctx.beginPath();
        ctx.save();
        ctx.lineWidth = 1 * lineWidthFactor;
        if (!selected) {
            ctx.strokeStyle = '#00f';
        }
        // 绘制精度椭圆
        (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread, firingSolution.closeSpread, firingSolution.closeSpread, selected);
        if (withSplash) {
            ctx.strokeStyle = '#f00';
            // 绘制100%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + M121_100_DAMAGE_RANGE, firingSolution.closeSpread + M121_100_DAMAGE_RANGE, firingSolution.closeSpread + M121_100_DAMAGE_RANGE);
            // 绘制25%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + M121_25_DAMAGE_RANGE, firingSolution.closeSpread + M121_25_DAMAGE_RANGE, firingSolution.closeSpread + M121_25_DAMAGE_RANGE);
        }
        ctx.restore();
    }
    getAngleValue(solution, userSettings) {
        return solution.angle / Math.PI * 180 + 0.1;
    }
    getAngleText(angleValue, solution) {
        return solution.angle ? `${(angleValue.toFixed(2))}` : "-----";
    }
    getAnglePrecision(userSettings) {
        return 2;
    }
    supportsGrid() {
        return true;
    }
    drawTargetGrid(ctx, lineWidthFactor, weaponTransform, firingSolution) {
        ctx.save();
        (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, weaponTransform);
        const gridDir = Math.floor(firingSolution.dir);
        const mil5 = Math.floor(firingSolution.angle * US_MIL / 5) * 5;
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1 * lineWidthFactor;
        const arcRadii = [-10, -5, 0, 5, 10, 15].map(x => (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.angle2groundDistance)((mil5 + x) / US_MIL, firingSolution.startHeightOffset, MORTAR_VELOCITY, GRAVITY));
        const [ra, r0, r1, r2, r3, rb] = arcRadii;
        // 绘制径向网格线
        [-2, -1, 0, 1, 2, 3].forEach(gridOffset => drawMortarGridLine(ctx, 0, 0, ra, rb, gridDir + gridOffset));
        // 绘制弧线网格
        arcRadii.forEach(arcRadius => drawMortarGridArc(ctx, 0, 0, arcRadius, gridDir));
        ctx.restore();
    }
    drawTarget(ctx, camera, userSettings, heightmap, weapons, target, dirdatas, userId) {
        const canvasSizeFactor = gl_matrix__WEBPACK_IMPORTED_MODULE_7__.getScaling(gl_matrix__WEBPACK_IMPORTED_MODULE_8__.create(), (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.canvasScaleTransform)(camera))[0];
        (0,_world_world__WEBPACK_IMPORTED_MODULE_5__.canonicalEntitySort)(weapons);
        const activeWeapons = weapons.filter((w) => w.isActive);
        const allWeaponsIndex = {};
        weapons.forEach((w, index) => {
            if (w.isActive) {
                allWeaponsIndex[w.entityId] = index;
            }
        });
        activeWeapons.forEach((weapon, activeWeaponIndex) => {
            var _a, _b, _c, _d;
            const weaponTranslation = (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.getTranslation)(weapon.transform);
            const weaponHeight = (0,_heightmap_heightmap__WEBPACK_IMPORTED_MODULE_1__.getHeight)(heightmap, weaponTranslation);
            weaponTranslation[2] = weaponHeight + weapon.heightOverGround;
            const targetTranslation = (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.getTranslation)(target.transform);
            const targetHeight = (0,_heightmap_heightmap__WEBPACK_IMPORTED_MODULE_1__.getHeight)(heightmap, targetTranslation);
            targetTranslation[2] = targetHeight;
            const solution = this.getFiringSolution(weaponTranslation, targetTranslation);
            const lineHeight = userSettings.fontSize * (userSettings.targetCompactMode ? 1 : 1.7);
            if (userSettings.targetGrid && this.supportsGrid()) {
                this.drawTargetGrid(ctx, canvasSizeFactor, weapon.transform, solution);
            }
            ctx.save();
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, target.transform);
            if (userSettings.targetSpread) {
                if (dirdatas && ((_b = (_a = dirdatas.get(target.entityId)) === null || _a === void 0 ? void 0 : _a.userIds) === null || _b === void 0 ? void 0 : _b.includes(userId || ''))) {
                    ctx.strokeStyle = '#ff004d';
                    ctx.fillStyle = 'rgba(231, 76, 60,0.5)';
                }
                else if (dirdatas && !((_d = (_c = dirdatas.get(target.entityId)) === null || _c === void 0 ? void 0 : _c.userIds) === null || _d === void 0 ? void 0 : _d.includes(userId || ''))) {
                    ctx.strokeStyle = '#AAB7B8';
                    ctx.fillStyle = 'rgba(131, 145, 146,0.5)';
                }
                this.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash, dirdatas === null || dirdatas === void 0 ? void 0 : dirdatas.has(target.entityId));
            }
            else if (userSettings.targetSplash) {
                this.drawSplash(ctx, canvasSizeFactor);
            }
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.canvasScaleTransform)(camera));
            const angleValue = this.getAngleValue(solution, userSettings);
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.newTranslation)(10, activeWeaponIndex * lineHeight, 0));
            if (userSettings.targetCompactMode) {
                let angleText = "-----";
                const precision = this.getAnglePrecision(userSettings);
                if (solution.angle && angleValue >= 1000) {
                    angleText = angleValue.toFixed(precision).toString().substr(1, 4 + precision);
                }
                else if (solution.angle) {
                    angleText = angleValue.toFixed(precision).toString().substr(0, 3 + precision);
                }
                if (activeWeapons.length > 1) {
                    angleText = (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + angleText;
                }
                (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.outlineText)(ctx, angleText, "middle", _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_RED, _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_WHITE, userSettings.fontSize, true);
            }
            else {
                let angleText = this.getAngleText(angleValue, solution);
                if (activeWeapons.length > 1) {
                    angleText = (allWeaponsIndex[weapon.entityId] + 1).toString() + ": " + angleText;
                }
                (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.outlineText)(ctx, angleText, "bottom", _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_RED, _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_WHITE, userSettings.fontSize, true);
                const bottomText = userSettings.targetDistance ?
                    `${solution.dir.toFixed(1)}° ${(solution.dist * MAPSCALE).toFixed(0)}m` :
                    `${solution.dir.toFixed(1)}°`;
                (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.outlineText)(ctx, bottomText, "top", _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_RED, _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
            }
            ctx.restore();
        });
        this.drawTargetIcon(ctx, camera, target.transform);
    }
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlbmRlcl93ZWFwb25SZW5kZXJlcnNfTTEyMVdlYXBvblJlbmRlcmVyX3RzLmFwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF1QztBQUNtQjtBQUNKO0FBQ3NDO0FBQ0Q7QUFDOUI7QUFDZ0I7QUFDckI7QUFDSjtBQUNwRDtBQUNPO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsK0JBQStCO0FBQ3RDO0FBQ087QUFDQTtBQUNBLDZCQUE2QjtBQUM3QiwwQkFBMEI7QUFDMUIsOEJBQThCO0FBQzlCLCtCQUErQjtBQUMvQiwwREFBMEQ7QUFDMUQsbUNBQW1DO0FBQ25DLG1DQUFtQztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGlEQUFRO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLGlDQUFpQyxtRUFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixtQkFBbUI7QUFDbkIscUJBQXFCO0FBQ3JCLG9CQUFvQjtBQUNwQixvQkFBb0I7QUFDcEIsZ0JBQWdCO0FBQ2hCLDBCQUEwQjtBQUMxQix5QkFBeUI7QUFDekI7QUFDQSxlQUFlLCtFQUFxQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDBEQUFpQjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxZQUFZLDBEQUFpQjtBQUM3QjtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLHdCQUF3QjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNFQUFjO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELDhFQUFvQjtBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLGlEQUFlLENBQUMsNkNBQVcsSUFBSSw2REFBb0I7QUFDcEYsUUFBUSxpRUFBbUI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxzQ0FBc0Msc0VBQWM7QUFDcEQsaUNBQWlDLCtEQUFTO0FBQzFDO0FBQ0Esc0NBQXNDLHNFQUFjO0FBQ3BELGlDQUFpQywrREFBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0VBQWM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0VBQWMsTUFBTSw2REFBb0I7QUFDcEQ7QUFDQSxZQUFZLHNFQUFjLE1BQU0sc0VBQWM7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG9EQUFXLDJCQUEyQixnREFBUSxFQUFFLGtEQUFVO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixvREFBVywyQkFBMkIsZ0RBQVEsRUFBRSxrREFBVTtBQUMxRTtBQUNBLHVCQUF1Qix3QkFBd0IsSUFBSSxzQ0FBc0M7QUFDekYsdUJBQXVCLHdCQUF3QjtBQUMvQyxnQkFBZ0Isb0RBQVcseUJBQXlCLGdEQUFRLEVBQUUsa0RBQVU7QUFDeEU7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlbmRlci93ZWFwb25SZW5kZXJlcnMvTTEyMVdlYXBvblJlbmRlcmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tIFwiZ2wtbWF0cml4XCI7XHJcbmltcG9ydCB7IEJhc2VXZWFwb25SZW5kZXJlciB9IGZyb20gXCIuL0Jhc2VXZWFwb25SZW5kZXJlclwiO1xyXG5pbXBvcnQgeyBnZXRIZWlnaHQgfSBmcm9tIFwiLi4vLi4vaGVpZ2h0bWFwL2hlaWdodG1hcFwiO1xyXG5pbXBvcnQgeyBnZXRNMTIxRmlyaW5nU29sdXRpb24sIGFuZ2xlMmdyb3VuZERpc3RhbmNlIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3Byb2plY3RpbGVQaHlzaWNzXCI7XHJcbmltcG9ydCB7IGNhbnZhc1NjYWxlVHJhbnNmb3JtLCBkcmF3U3ByZWFkRWxsaXBzZSwgb3V0bGluZVRleHQsIGRyYXdMaW5lIH0gZnJvbSBcIi4uL2NhbnZhc1wiO1xyXG5pbXBvcnQgeyBhcHBseVRyYW5zZm9ybSB9IGZyb20gXCIuLi8uLi93b3JsZC90cmFuc2Zvcm1hdGlvbnNcIjtcclxuaW1wb3J0IHsgZ2V0VHJhbnNsYXRpb24sIG5ld1RyYW5zbGF0aW9uIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3RyYW5zZm9ybWF0aW9uc1wiO1xyXG5pbXBvcnQgeyBjYW5vbmljYWxFbnRpdHlTb3J0IH0gZnJvbSBcIi4uLy4uL3dvcmxkL3dvcmxkXCI7XHJcbmltcG9ydCB7IFRFWFRfUkVELCBURVhUX1dISVRFIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xyXG4vLyBNMTIx6L+r5Ye754Ku55u45YWz5bi46YePXHJcbmV4cG9ydCBjb25zdCBNQVBTQ0FMRSA9IDAuMDE7XHJcbmV4cG9ydCBjb25zdCBHUkFWSVRZID0gOTgwOyAvLyBjbS9zXjJcclxuZXhwb3J0IGNvbnN0IFVTX01JTCA9IDEwMTguNTk7XHJcbmV4cG9ydCBjb25zdCBNT1JUQVJfVkVMT0NJVFkgPSAxMDk4OTsgLy8gY20vcyAtIOeUqOS6jue9keagvOiuoeeul1xyXG4vLyBNMTIxIDEyMG1t6L+r5Ye754Ku54m55pyJ5bi46YePXHJcbmV4cG9ydCBjb25zdCBNMTIxX01PQSA9IDQwO1xyXG5leHBvcnQgY29uc3QgTTEyMV9EUkFHID0gMDtcclxuZXhwb3J0IGNvbnN0IE0xMjFfVkVMT0NJVFkgPSAxNDIwMDsgLy8gY20vc1xyXG5leHBvcnQgY29uc3QgTTEyMV9HUkFWSVRZID0gOTgwOyAvLyBjbS9zXjJcclxuZXhwb3J0IGNvbnN0IE0xMjFfTUlOX1JBTkdFID0gMzAwMDA7IC8vIGNtXHJcbmV4cG9ydCBjb25zdCBNMTIxX01BWF9SQU5HRSA9IDIwMDAwMDsgLy8gY21cclxuZXhwb3J0IGNvbnN0IE0xMjFfREVWSUFUSU9OID0gTTEyMV9NT0EgLyA2MCAqIE1hdGguUEkgLyAxODAgLyAyOyAvLyBjb25lIGFuZ2xlIGZyb20gY2VudGVyIH4gXCJyYWRpdXMgYW5nbGVcIlxyXG5leHBvcnQgY29uc3QgTTEyMV8xMDBfREFNQUdFX1JBTkdFID0gNjAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTTEyMV8yNV9EQU1BR0VfUkFOR0UgPSA0MjAwOyAvLyBjbVxyXG4vKipcclxuICog57uY5Yi26L+r5Ye754Ku572R5qC857q/77yITTEyMeS9v+eUqOS4juagh+WHhui/q+WHu+eCruebuOWQjOeahOe9keagvOezu+e7n++8iVxyXG4gKi9cclxuZnVuY3Rpb24gZHJhd01vcnRhckdyaWRMaW5lKGN0eCwgeDAsIHkwLCByMCwgcjEsIGRpcikge1xyXG4gICAgY29uc3QgcGhpID0gZGlyICogTWF0aC5QSSAvIDE4MDtcclxuICAgIGNvbnN0IFtreCwga3ldID0gW01hdGguc2luKHBoaSksIC1NYXRoLmNvcyhwaGkpXTtcclxuICAgIGRyYXdMaW5lKGN0eCwgeDAgKyBreCAqIHIwLCB5MCArIGt5ICogcjAsIHgwICsga3ggKiByMSwgeTAgKyBreSAqIHIxKTtcclxufVxyXG4vKipcclxuICog57uY5Yi26L+r5Ye754Ku572R5qC85byn57q/XHJcbiAqL1xyXG5mdW5jdGlvbiBkcmF3TW9ydGFyR3JpZEFyYyhjdHgsIHgwLCB5MCwgciwgZGlyKSB7XHJcbiAgICBpZiAociA+PSAwKSB7XHJcbiAgICAgICAgY29uc3QgYWxwaGEgPSBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICAgIGNvbnN0IHBoaSA9IChkaXIgLSA5MCkgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKHgwLCB5MCwgciwgcGhpIC0gMiAqIGFscGhhLCBwaGkgKyAzICogYWxwaGEpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogTTEyMSAxMjBtbei/q+WHu+eCruatpuWZqOa4suafk+WZqFxyXG4gKiDph43lnovov6vlh7vngq7vvIzlhbfmnInmm7TlpKfnmoTlsITnqIvlkozlqIHliptcclxuICovXHJcbmV4cG9ydCBjbGFzcyBNMTIxV2VhcG9uUmVuZGVyZXIgZXh0ZW5kcyBCYXNlV2VhcG9uUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB0aGlzLndlYXBvblR5cGUgPSBcIk0xMjFcIjtcclxuICAgIH1cclxuICAgIC8vIOWunueOsOWfuuexu+aKveixoeaWueazlSAtIOatpuWZqOW4uOmHj1xyXG4gICAgZ2V0VmVsb2NpdHkoKSB7IHJldHVybiBNMTIxX1ZFTE9DSVRZOyB9XHJcbiAgICBnZXRHcmF2aXR5KCkgeyByZXR1cm4gTTEyMV9HUkFWSVRZOyB9XHJcbiAgICBnZXREZXZpYXRpb24oKSB7IHJldHVybiBNMTIxX0RFVklBVElPTjsgfVxyXG4gICAgZ2V0TWluUmFuZ2UoKSB7IHJldHVybiBNMTIxX01JTl9SQU5HRTsgfVxyXG4gICAgZ2V0TWF4UmFuZ2UoKSB7IHJldHVybiBNMTIxX01BWF9SQU5HRTsgfVxyXG4gICAgZ2V0RHJhZygpIHsgcmV0dXJuIE0xMjFfRFJBRzsgfVxyXG4gICAgZ2V0MTAwRGFtYWdlUmFuZ2UoKSB7IHJldHVybiBNMTIxXzEwMF9EQU1BR0VfUkFOR0U7IH1cclxuICAgIGdldDI1RGFtYWdlUmFuZ2UoKSB7IHJldHVybiBNMTIxXzI1X0RBTUFHRV9SQU5HRTsgfVxyXG4gICAgZ2V0RmlyaW5nU29sdXRpb24od2VhcG9uVHJhbnNsYXRpb24sIHRhcmdldFRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldE0xMjFGaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pLmhpZ2hBcmM7XHJcbiAgICB9XHJcbiAgICBkcmF3U3BsYXNoKGN0eCwgbGluZVdpZHRoRmFjdG9yKSB7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDEgKiBsaW5lV2lkdGhGYWN0b3I7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmMDAnO1xyXG4gICAgICAgIC8vIOe7mOWItjEwMCXkvKTlrrPojIPlm7RcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYygwLCAwLCBNMTIxXzEwMF9EQU1BR0VfUkFOR0UsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgLy8g57uY5Yi2MjUl5Lyk5a6z6IyD5Zu0XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmMoMCwgMCwgTTEyMV8yNV9EQU1BR0VfUkFOR0UsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBkcmF3U3ByZWFkKGN0eCwgZmlyaW5nU29sdXRpb24sIGxpbmVXaWR0aEZhY3Rvciwgd2l0aFNwbGFzaCwgc2VsZWN0ZWQgPSBmYWxzZSkge1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxICogbGluZVdpZHRoRmFjdG9yO1xyXG4gICAgICAgIGlmICghc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMGYnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDnu5jliLbnsr7luqbmpK3lnIZcclxuICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGZpcmluZ1NvbHV0aW9uLndlYXBvblRvVGFyZ2V0VmVjLCBmaXJpbmdTb2x1dGlvbi5ob3Jpem9udGFsU3ByZWFkLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQsIHNlbGVjdGVkKTtcclxuICAgICAgICBpZiAod2l0aFNwbGFzaCkge1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2YwMCc7XHJcbiAgICAgICAgICAgIC8vIOe7mOWItjEwMCXkvKTlrrPojIPlm7TmpK3lnIZcclxuICAgICAgICAgICAgZHJhd1NwcmVhZEVsbGlwc2UoY3R4LCBmaXJpbmdTb2x1dGlvbi53ZWFwb25Ub1RhcmdldFZlYywgZmlyaW5nU29sdXRpb24uaG9yaXpvbnRhbFNwcmVhZCArIE0xMjFfMTAwX0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNMTIxXzEwMF9EQU1BR0VfUkFOR0UsIGZpcmluZ1NvbHV0aW9uLmNsb3NlU3ByZWFkICsgTTEyMV8xMDBfREFNQUdFX1JBTkdFKTtcclxuICAgICAgICAgICAgLy8g57uY5Yi2MjUl5Lyk5a6z6IyD5Zu05qSt5ZyGXHJcbiAgICAgICAgICAgIGRyYXdTcHJlYWRFbGxpcHNlKGN0eCwgZmlyaW5nU29sdXRpb24ud2VhcG9uVG9UYXJnZXRWZWMsIGZpcmluZ1NvbHV0aW9uLmhvcml6b250YWxTcHJlYWQgKyBNMTIxXzI1X0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNMTIxXzI1X0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNMTIxXzI1X0RBTUFHRV9SQU5HRSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgICBnZXRBbmdsZVZhbHVlKHNvbHV0aW9uLCB1c2VyU2V0dGluZ3MpIHtcclxuICAgICAgICByZXR1cm4gc29sdXRpb24uYW5nbGUgLyBNYXRoLlBJICogMTgwICsgMC4xO1xyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uLmFuZ2xlID8gYCR7KGFuZ2xlVmFsdWUudG9GaXhlZCgyKSl9YCA6IFwiLS0tLS1cIjtcclxuICAgIH1cclxuICAgIGdldEFuZ2xlUHJlY2lzaW9uKHVzZXJTZXR0aW5ncykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgc3VwcG9ydHNHcmlkKCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZHJhd1RhcmdldEdyaWQoY3R4LCBsaW5lV2lkdGhGYWN0b3IsIHdlYXBvblRyYW5zZm9ybSwgZmlyaW5nU29sdXRpb24pIHtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgd2VhcG9uVHJhbnNmb3JtKTtcclxuICAgICAgICBjb25zdCBncmlkRGlyID0gTWF0aC5mbG9vcihmaXJpbmdTb2x1dGlvbi5kaXIpO1xyXG4gICAgICAgIGNvbnN0IG1pbDUgPSBNYXRoLmZsb29yKGZpcmluZ1NvbHV0aW9uLmFuZ2xlICogVVNfTUlMIC8gNSkgKiA1O1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMGYwJztcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICBjb25zdCBhcmNSYWRpaSA9IFstMTAsIC01LCAwLCA1LCAxMCwgMTVdLm1hcCh4ID0+IGFuZ2xlMmdyb3VuZERpc3RhbmNlKChtaWw1ICsgeCkgLyBVU19NSUwsIGZpcmluZ1NvbHV0aW9uLnN0YXJ0SGVpZ2h0T2Zmc2V0LCBNT1JUQVJfVkVMT0NJVFksIEdSQVZJVFkpKTtcclxuICAgICAgICBjb25zdCBbcmEsIHIwLCByMSwgcjIsIHIzLCByYl0gPSBhcmNSYWRpaTtcclxuICAgICAgICAvLyDnu5jliLblvoTlkJHnvZHmoLznur9cclxuICAgICAgICBbLTIsIC0xLCAwLCAxLCAyLCAzXS5mb3JFYWNoKGdyaWRPZmZzZXQgPT4gZHJhd01vcnRhckdyaWRMaW5lKGN0eCwgMCwgMCwgcmEsIHJiLCBncmlkRGlyICsgZ3JpZE9mZnNldCkpO1xyXG4gICAgICAgIC8vIOe7mOWItuW8p+e6v+e9keagvFxyXG4gICAgICAgIGFyY1JhZGlpLmZvckVhY2goYXJjUmFkaXVzID0+IGRyYXdNb3J0YXJHcmlkQXJjKGN0eCwgMCwgMCwgYXJjUmFkaXVzLCBncmlkRGlyKSk7XHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIGRyYXdUYXJnZXQoY3R4LCBjYW1lcmEsIHVzZXJTZXR0aW5ncywgaGVpZ2h0bWFwLCB3ZWFwb25zLCB0YXJnZXQsIGRpcmRhdGFzLCB1c2VySWQpIHtcclxuICAgICAgICBjb25zdCBjYW52YXNTaXplRmFjdG9yID0gbWF0NC5nZXRTY2FsaW5nKHZlYzMuY3JlYXRlKCksIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpWzBdO1xyXG4gICAgICAgIGNhbm9uaWNhbEVudGl0eVNvcnQod2VhcG9ucyk7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2VhcG9ucyA9IHdlYXBvbnMuZmlsdGVyKCh3KSA9PiB3LmlzQWN0aXZlKTtcclxuICAgICAgICBjb25zdCBhbGxXZWFwb25zSW5kZXggPSB7fTtcclxuICAgICAgICB3ZWFwb25zLmZvckVhY2goKHcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh3LmlzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBhbGxXZWFwb25zSW5kZXhbdy5lbnRpdHlJZF0gPSBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFjdGl2ZVdlYXBvbnMuZm9yRWFjaCgod2VhcG9uLCBhY3RpdmVXZWFwb25JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XHJcbiAgICAgICAgICAgIGNvbnN0IHdlYXBvblRyYW5zbGF0aW9uID0gZ2V0VHJhbnNsYXRpb24od2VhcG9uLnRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHdlYXBvbkhlaWdodCA9IGdldEhlaWdodChoZWlnaHRtYXAsIHdlYXBvblRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgd2VhcG9uVHJhbnNsYXRpb25bMl0gPSB3ZWFwb25IZWlnaHQgKyB3ZWFwb24uaGVpZ2h0T3Zlckdyb3VuZDtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0VHJhbnNsYXRpb24gPSBnZXRUcmFuc2xhdGlvbih0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0SGVpZ2h0ID0gZ2V0SGVpZ2h0KGhlaWdodG1hcCwgdGFyZ2V0VHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB0YXJnZXRUcmFuc2xhdGlvblsyXSA9IHRhcmdldEhlaWdodDtcclxuICAgICAgICAgICAgY29uc3Qgc29sdXRpb24gPSB0aGlzLmdldEZpcmluZ1NvbHV0aW9uKHdlYXBvblRyYW5zbGF0aW9uLCB0YXJnZXRUcmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB1c2VyU2V0dGluZ3MuZm9udFNpemUgKiAodXNlclNldHRpbmdzLnRhcmdldENvbXBhY3RNb2RlID8gMSA6IDEuNyk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0R3JpZCAmJiB0aGlzLnN1cHBvcnRzR3JpZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUYXJnZXRHcmlkKGN0eCwgY2FudmFzU2l6ZUZhY3Rvciwgd2VhcG9uLnRyYW5zZm9ybSwgc29sdXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgdGFyZ2V0LnRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0U3ByZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZGF0YXMgJiYgKChfYiA9IChfYSA9IGRpcmRhdGFzLmdldCh0YXJnZXQuZW50aXR5SWQpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudXNlcklkcykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmluY2x1ZGVzKHVzZXJJZCB8fCAnJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmZjAwNGQnO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyMzEsIDc2LCA2MCwwLjUpJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRpcmRhdGFzICYmICEoKF9kID0gKF9jID0gZGlyZGF0YXMuZ2V0KHRhcmdldC5lbnRpdHlJZCkpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy51c2VySWRzKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuaW5jbHVkZXModXNlcklkIHx8ICcnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI0FBQjdCOCc7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDEzMSwgMTQ1LCAxNDYsMC41KSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTcHJlYWQoY3R4LCBzb2x1dGlvbiwgY2FudmFzU2l6ZUZhY3RvciwgdXNlclNldHRpbmdzLnRhcmdldFNwbGFzaCwgZGlyZGF0YXMgPT09IG51bGwgfHwgZGlyZGF0YXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRpcmRhdGFzLmhhcyh0YXJnZXQuZW50aXR5SWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0U3BsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTcGxhc2goY3R4LCBjYW52YXNTaXplRmFjdG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpO1xyXG4gICAgICAgICAgICBjb25zdCBhbmdsZVZhbHVlID0gdGhpcy5nZXRBbmdsZVZhbHVlKHNvbHV0aW9uLCB1c2VyU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIG5ld1RyYW5zbGF0aW9uKDEwLCBhY3RpdmVXZWFwb25JbmRleCAqIGxpbmVIZWlnaHQsIDApKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRDb21wYWN0TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IFwiLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IHRoaXMuZ2V0QW5nbGVQcmVjaXNpb24odXNlclNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgIGlmIChzb2x1dGlvbi5hbmdsZSAmJiBhbmdsZVZhbHVlID49IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZVZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigxLCA0ICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNvbHV0aW9uLmFuZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gYW5nbGVWYWx1ZS50b0ZpeGVkKHByZWNpc2lvbikudG9TdHJpbmcoKS5zdWJzdHIoMCwgMyArIHByZWNpc2lvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlV2VhcG9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gKGFsbFdlYXBvbnNJbmRleFt3ZWFwb24uZW50aXR5SWRdICsgMSkudG9TdHJpbmcoKSArIFwiOiBcIiArIGFuZ2xlVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dGxpbmVUZXh0KGN0eCwgYW5nbGVUZXh0LCBcIm1pZGRsZVwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBhbmdsZVRleHQgPSB0aGlzLmdldEFuZ2xlVGV4dChhbmdsZVZhbHVlLCBzb2x1dGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlV2VhcG9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gKGFsbFdlYXBvbnNJbmRleFt3ZWFwb24uZW50aXR5SWRdICsgMSkudG9TdHJpbmcoKSArIFwiOiBcIiArIGFuZ2xlVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dGxpbmVUZXh0KGN0eCwgYW5nbGVUZXh0LCBcImJvdHRvbVwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdHRvbVRleHQgPSB1c2VyU2V0dGluZ3MudGFyZ2V0RGlzdGFuY2UgP1xyXG4gICAgICAgICAgICAgICAgICAgIGAke3NvbHV0aW9uLmRpci50b0ZpeGVkKDEpfcKwICR7KHNvbHV0aW9uLmRpc3QgKiBNQVBTQ0FMRSkudG9GaXhlZCgwKX1tYCA6XHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uZGlyLnRvRml4ZWQoMSl9wrBgO1xyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBib3R0b21UZXh0LCBcInRvcFwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplICogMiAvIDMsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kcmF3VGFyZ2V0SWNvbihjdHgsIGNhbWVyYSwgdGFyZ2V0LnRyYW5zZm9ybSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9