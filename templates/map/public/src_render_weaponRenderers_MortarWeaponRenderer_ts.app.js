"use strict";
(self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || []).push([["src_render_weaponRenderers_MortarWeaponRenderer_ts"],{

/***/ "./src/render/weaponRenderers/MortarWeaponRenderer.ts":
/*!************************************************************!*\
  !*** ./src/render/weaponRenderers/MortarWeaponRenderer.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GRAVITY: () => (/* binding */ GRAVITY),
/* harmony export */   MAPSCALE: () => (/* binding */ MAPSCALE),
/* harmony export */   MORTAR_100_DAMAGE_RANGE: () => (/* binding */ MORTAR_100_DAMAGE_RANGE),
/* harmony export */   MORTAR_10_DAMAGE_RANGE: () => (/* binding */ MORTAR_10_DAMAGE_RANGE),
/* harmony export */   MORTAR_25_DAMAGE_RANGE: () => (/* binding */ MORTAR_25_DAMAGE_RANGE),
/* harmony export */   MORTAR_DEVIATION: () => (/* binding */ MORTAR_DEVIATION),
/* harmony export */   MORTAR_MAX_RANGE: () => (/* binding */ MORTAR_MAX_RANGE),
/* harmony export */   MORTAR_MIN_RANGE: () => (/* binding */ MORTAR_MIN_RANGE),
/* harmony export */   MORTAR_MOA: () => (/* binding */ MORTAR_MOA),
/* harmony export */   MORTAR_VELOCITY: () => (/* binding */ MORTAR_VELOCITY),
/* harmony export */   MortarWeaponRenderer: () => (/* binding */ MortarWeaponRenderer),
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









// 迫击炮相关常量
const MAPSCALE = 0.01;
const GRAVITY = 980; // cm/s^2
const US_MIL = 1018.59;
const MORTAR_VELOCITY = 10989; // cm/s
const MORTAR_MOA = 50;
const MORTAR_DEVIATION = MORTAR_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
const MORTAR_MIN_RANGE = 5000; // cm
const MORTAR_MAX_RANGE = 123096.963; // cm
const MORTAR_100_DAMAGE_RANGE = 650; // cm
const MORTAR_25_DAMAGE_RANGE = 1200; // cm
const MORTAR_10_DAMAGE_RANGE = 1500; // cm
/**
 * 绘制迫击炮网格线
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
 * 迫击炮武器渲染器
 * 处理标准迫击炮和技术迫击炮的渲染
 */
class MortarWeaponRenderer extends _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__.BaseWeaponRenderer {
    constructor() {
        super(...arguments);
        this.weaponType = "standardMortar";
    }
    // 实现基类抽象方法 - 武器常量
    getVelocity() { return MORTAR_VELOCITY; }
    getGravity() { return GRAVITY; }
    getDeviation() { return MORTAR_DEVIATION; }
    getMinRange() { return MORTAR_MIN_RANGE; }
    getMaxRange() { return MORTAR_MAX_RANGE; }
    get100DamageRange() { return MORTAR_100_DAMAGE_RANGE; }
    get25DamageRange() { return MORTAR_25_DAMAGE_RANGE; }
    getFiringSolution(weaponTranslation, targetTranslation) {
        return (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.getMortarFiringSolution)(weaponTranslation, targetTranslation).highArc;
    }
    drawSplash(ctx, lineWidthFactor) {
        ctx.lineWidth = 1 * lineWidthFactor;
        ctx.strokeStyle = '#f00';
        // 绘制100%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, MORTAR_100_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
        // 绘制25%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, MORTAR_25_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected = false) {
        ctx.lineWidth = 1 * lineWidthFactor;
        if (!selected) {
            ctx.strokeStyle = '#00f';
        }
        // 绘制精度椭圆
        (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread, firingSolution.closeSpread, firingSolution.closeSpread, selected);
        if (withSplash) {
            ctx.strokeStyle = '#f00';
            // 绘制100%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + MORTAR_100_DAMAGE_RANGE, firingSolution.closeSpread + MORTAR_100_DAMAGE_RANGE, firingSolution.closeSpread + MORTAR_100_DAMAGE_RANGE);
            // 绘制25%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + MORTAR_25_DAMAGE_RANGE, firingSolution.closeSpread + MORTAR_25_DAMAGE_RANGE, firingSolution.closeSpread + MORTAR_25_DAMAGE_RANGE);
        }
    }
    getAngleValue(solution, userSettings) {
        return userSettings.weaponType === "technicalMortar" ?
            solution.angle / Math.PI * 180 :
            solution.angle * US_MIL;
    }
    getAngleText(angleValue, solution) {
        return solution.angle ? `${(angleValue >> 0)}` : "-----";
    }
    getAnglePrecision(userSettings) {
        return userSettings.weaponType === "technicalMortar" ? 1 : 0;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlbmRlcl93ZWFwb25SZW5kZXJlcnNfTW9ydGFyV2VhcG9uUmVuZGVyZXJfdHMuYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF1QztBQUNtQjtBQUNKO0FBQ3dDO0FBQ0g7QUFDOUI7QUFDZ0I7QUFDckI7QUFDSjtBQUNwRDtBQUNPO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0EsOERBQThEO0FBQzlELCtCQUErQjtBQUMvQixxQ0FBcUM7QUFDckMscUNBQXFDO0FBQ3JDLHFDQUFxQztBQUNyQyxxQ0FBcUM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxpREFBUTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxtQ0FBbUMsbUVBQWtCO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsbUJBQW1CO0FBQ25CLHFCQUFxQjtBQUNyQixvQkFBb0I7QUFDcEIsb0JBQW9CO0FBQ3BCLDBCQUEwQjtBQUMxQix5QkFBeUI7QUFDekI7QUFDQSxlQUFlLGlGQUF1QjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsMERBQWlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0EsWUFBWSwwREFBaUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxrQkFBa0I7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzRUFBYztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCw4RUFBb0I7QUFDOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxpREFBZSxDQUFDLDZDQUFXLElBQUksNkRBQW9CO0FBQ3BGLFFBQVEsaUVBQW1CO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0Esc0NBQXNDLHNFQUFjO0FBQ3BELGlDQUFpQywrREFBUztBQUMxQztBQUNBLHNDQUFzQyxzRUFBYztBQUNwRCxpQ0FBaUMsK0RBQVM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHNFQUFjO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHNFQUFjLE1BQU0sNkRBQW9CO0FBQ3BEO0FBQ0EsWUFBWSxzRUFBYyxNQUFNLHNFQUFjO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixvREFBVywyQkFBMkIsZ0RBQVEsRUFBRSxrREFBVTtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isb0RBQVcsMkJBQTJCLGdEQUFRLEVBQUUsa0RBQVU7QUFDMUU7QUFDQSx1QkFBdUIsd0JBQXdCLElBQUksc0NBQXNDO0FBQ3pGLHVCQUF1Qix3QkFBd0I7QUFDL0MsZ0JBQWdCLG9EQUFXLHlCQUF5QixnREFBUSxFQUFFLGtEQUFVO0FBQ3hFO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC8uL3NyYy9yZW5kZXIvd2VhcG9uUmVuZGVyZXJzL01vcnRhcldlYXBvblJlbmRlcmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tIFwiZ2wtbWF0cml4XCI7XHJcbmltcG9ydCB7IEJhc2VXZWFwb25SZW5kZXJlciB9IGZyb20gXCIuL0Jhc2VXZWFwb25SZW5kZXJlclwiO1xyXG5pbXBvcnQgeyBnZXRIZWlnaHQgfSBmcm9tIFwiLi4vLi4vaGVpZ2h0bWFwL2hlaWdodG1hcFwiO1xyXG5pbXBvcnQgeyBnZXRNb3J0YXJGaXJpbmdTb2x1dGlvbiwgYW5nbGUyZ3JvdW5kRGlzdGFuY2UgfSBmcm9tIFwiLi4vLi4vd29ybGQvcHJvamVjdGlsZVBoeXNpY3NcIjtcclxuaW1wb3J0IHsgY2FudmFzU2NhbGVUcmFuc2Zvcm0sIGRyYXdTcHJlYWRFbGxpcHNlLCBvdXRsaW5lVGV4dCwgZHJhd0xpbmUgfSBmcm9tIFwiLi4vY2FudmFzXCI7XHJcbmltcG9ydCB7IGFwcGx5VHJhbnNmb3JtIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3RyYW5zZm9ybWF0aW9uc1wiO1xyXG5pbXBvcnQgeyBnZXRUcmFuc2xhdGlvbiwgbmV3VHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vd29ybGQvdHJhbnNmb3JtYXRpb25zXCI7XHJcbmltcG9ydCB7IGNhbm9uaWNhbEVudGl0eVNvcnQgfSBmcm9tIFwiLi4vLi4vd29ybGQvd29ybGRcIjtcclxuaW1wb3J0IHsgVEVYVF9SRUQsIFRFWFRfV0hJVEUgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XHJcbi8vIOi/q+WHu+eCruebuOWFs+W4uOmHj1xyXG5leHBvcnQgY29uc3QgTUFQU0NBTEUgPSAwLjAxO1xyXG5leHBvcnQgY29uc3QgR1JBVklUWSA9IDk4MDsgLy8gY20vc14yXHJcbmV4cG9ydCBjb25zdCBVU19NSUwgPSAxMDE4LjU5O1xyXG5leHBvcnQgY29uc3QgTU9SVEFSX1ZFTE9DSVRZID0gMTA5ODk7IC8vIGNtL3NcclxuZXhwb3J0IGNvbnN0IE1PUlRBUl9NT0EgPSA1MDtcclxuZXhwb3J0IGNvbnN0IE1PUlRBUl9ERVZJQVRJT04gPSBNT1JUQVJfTU9BIC8gNjAgKiBNYXRoLlBJIC8gMTgwIC8gMjsgLy8gY29uZSBhbmdsZSBmcm9tIGNlbnRlciB+IFwicmFkaXVzIGFuZ2xlXCJcclxuZXhwb3J0IGNvbnN0IE1PUlRBUl9NSU5fUkFOR0UgPSA1MDAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTU9SVEFSX01BWF9SQU5HRSA9IDEyMzA5Ni45NjM7IC8vIGNtXHJcbmV4cG9ydCBjb25zdCBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRSA9IDY1MDsgLy8gY21cclxuZXhwb3J0IGNvbnN0IE1PUlRBUl8yNV9EQU1BR0VfUkFOR0UgPSAxMjAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTU9SVEFSXzEwX0RBTUFHRV9SQU5HRSA9IDE1MDA7IC8vIGNtXHJcbi8qKlxyXG4gKiDnu5jliLbov6vlh7vngq7nvZHmoLznur9cclxuICovXHJcbmZ1bmN0aW9uIGRyYXdNb3J0YXJHcmlkTGluZShjdHgsIHgwLCB5MCwgcjAsIHIxLCBkaXIpIHtcclxuICAgIGNvbnN0IHBoaSA9IGRpciAqIE1hdGguUEkgLyAxODA7XHJcbiAgICBjb25zdCBba3gsIGt5XSA9IFtNYXRoLnNpbihwaGkpLCAtTWF0aC5jb3MocGhpKV07XHJcbiAgICBkcmF3TGluZShjdHgsIHgwICsga3ggKiByMCwgeTAgKyBreSAqIHIwLCB4MCArIGt4ICogcjEsIHkwICsga3kgKiByMSk7XHJcbn1cclxuLyoqXHJcbiAqIOe7mOWItui/q+WHu+eCrue9keagvOW8p+e6v1xyXG4gKi9cclxuZnVuY3Rpb24gZHJhd01vcnRhckdyaWRBcmMoY3R4LCB4MCwgeTAsIHIsIGRpcikge1xyXG4gICAgaWYgKHIgPj0gMCkge1xyXG4gICAgICAgIGNvbnN0IGFscGhhID0gTWF0aC5QSSAvIDE4MDtcclxuICAgICAgICBjb25zdCBwaGkgPSAoZGlyIC0gOTApICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh4MCwgeTAsIHIsIHBoaSAtIDIgKiBhbHBoYSwgcGhpICsgMyAqIGFscGhhKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOi/q+WHu+eCruatpuWZqOa4suafk+WZqFxyXG4gKiDlpITnkIbmoIflh4bov6vlh7vngq7lkozmioDmnK/ov6vlh7vngq7nmoTmuLLmn5NcclxuICovXHJcbmV4cG9ydCBjbGFzcyBNb3J0YXJXZWFwb25SZW5kZXJlciBleHRlbmRzIEJhc2VXZWFwb25SZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMud2VhcG9uVHlwZSA9IFwic3RhbmRhcmRNb3J0YXJcIjtcclxuICAgIH1cclxuICAgIC8vIOWunueOsOWfuuexu+aKveixoeaWueazlSAtIOatpuWZqOW4uOmHj1xyXG4gICAgZ2V0VmVsb2NpdHkoKSB7IHJldHVybiBNT1JUQVJfVkVMT0NJVFk7IH1cclxuICAgIGdldEdyYXZpdHkoKSB7IHJldHVybiBHUkFWSVRZOyB9XHJcbiAgICBnZXREZXZpYXRpb24oKSB7IHJldHVybiBNT1JUQVJfREVWSUFUSU9OOyB9XHJcbiAgICBnZXRNaW5SYW5nZSgpIHsgcmV0dXJuIE1PUlRBUl9NSU5fUkFOR0U7IH1cclxuICAgIGdldE1heFJhbmdlKCkgeyByZXR1cm4gTU9SVEFSX01BWF9SQU5HRTsgfVxyXG4gICAgZ2V0MTAwRGFtYWdlUmFuZ2UoKSB7IHJldHVybiBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRTsgfVxyXG4gICAgZ2V0MjVEYW1hZ2VSYW5nZSgpIHsgcmV0dXJuIE1PUlRBUl8yNV9EQU1BR0VfUkFOR0U7IH1cclxuICAgIGdldEZpcmluZ1NvbHV0aW9uKHdlYXBvblRyYW5zbGF0aW9uLCB0YXJnZXRUcmFuc2xhdGlvbikge1xyXG4gICAgICAgIHJldHVybiBnZXRNb3J0YXJGaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pLmhpZ2hBcmM7XHJcbiAgICB9XHJcbiAgICBkcmF3U3BsYXNoKGN0eCwgbGluZVdpZHRoRmFjdG9yKSB7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDEgKiBsaW5lV2lkdGhGYWN0b3I7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmMDAnO1xyXG4gICAgICAgIC8vIOe7mOWItjEwMCXkvKTlrrPojIPlm7RcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYygwLCAwLCBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAvLyDnu5jliLYyNSXkvKTlrrPojIPlm7RcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYygwLCAwLCBNT1JUQVJfMjVfREFNQUdFX1JBTkdFLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgZHJhd1NwcmVhZChjdHgsIGZpcmluZ1NvbHV0aW9uLCBsaW5lV2lkdGhGYWN0b3IsIHdpdGhTcGxhc2gsIHNlbGVjdGVkID0gZmFsc2UpIHtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICBpZiAoIXNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDBmJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g57uY5Yi257K+5bqm5qSt5ZyGXHJcbiAgICAgICAgZHJhd1NwcmVhZEVsbGlwc2UoY3R4LCBmaXJpbmdTb2x1dGlvbi53ZWFwb25Ub1RhcmdldFZlYywgZmlyaW5nU29sdXRpb24uaG9yaXpvbnRhbFNwcmVhZCwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQsIGZpcmluZ1NvbHV0aW9uLmNsb3NlU3ByZWFkLCBzZWxlY3RlZCk7XHJcbiAgICAgICAgaWYgKHdpdGhTcGxhc2gpIHtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmMDAnO1xyXG4gICAgICAgICAgICAvLyDnu5jliLYxMDAl5Lyk5a6z6IyD5Zu05qSt5ZyGXHJcbiAgICAgICAgICAgIGRyYXdTcHJlYWRFbGxpcHNlKGN0eCwgZmlyaW5nU29sdXRpb24ud2VhcG9uVG9UYXJnZXRWZWMsIGZpcmluZ1NvbHV0aW9uLmhvcml6b250YWxTcHJlYWQgKyBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNT1JUQVJfMTAwX0RBTUFHRV9SQU5HRSk7XHJcbiAgICAgICAgICAgIC8vIOe7mOWItjI1JeS8pOWus+iMg+WbtOakreWchlxyXG4gICAgICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGZpcmluZ1NvbHV0aW9uLndlYXBvblRvVGFyZ2V0VmVjLCBmaXJpbmdTb2x1dGlvbi5ob3Jpem9udGFsU3ByZWFkICsgTU9SVEFSXzI1X0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNT1JUQVJfMjVfREFNQUdFX1JBTkdFLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCArIE1PUlRBUl8yNV9EQU1BR0VfUkFOR0UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEFuZ2xlVmFsdWUoc29sdXRpb24sIHVzZXJTZXR0aW5ncykge1xyXG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3Mud2VhcG9uVHlwZSA9PT0gXCJ0ZWNobmljYWxNb3J0YXJcIiA/XHJcbiAgICAgICAgICAgIHNvbHV0aW9uLmFuZ2xlIC8gTWF0aC5QSSAqIDE4MCA6XHJcbiAgICAgICAgICAgIHNvbHV0aW9uLmFuZ2xlICogVVNfTUlMO1xyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uLmFuZ2xlID8gYCR7KGFuZ2xlVmFsdWUgPj4gMCl9YCA6IFwiLS0tLS1cIjtcclxuICAgIH1cclxuICAgIGdldEFuZ2xlUHJlY2lzaW9uKHVzZXJTZXR0aW5ncykge1xyXG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3Mud2VhcG9uVHlwZSA9PT0gXCJ0ZWNobmljYWxNb3J0YXJcIiA/IDEgOiAwO1xyXG4gICAgfVxyXG4gICAgc3VwcG9ydHNHcmlkKCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZHJhd1RhcmdldEdyaWQoY3R4LCBsaW5lV2lkdGhGYWN0b3IsIHdlYXBvblRyYW5zZm9ybSwgZmlyaW5nU29sdXRpb24pIHtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgd2VhcG9uVHJhbnNmb3JtKTtcclxuICAgICAgICBjb25zdCBncmlkRGlyID0gTWF0aC5mbG9vcihmaXJpbmdTb2x1dGlvbi5kaXIpO1xyXG4gICAgICAgIGNvbnN0IG1pbDUgPSBNYXRoLmZsb29yKGZpcmluZ1NvbHV0aW9uLmFuZ2xlICogVVNfTUlMIC8gNSkgKiA1O1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMGYwJztcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICBjb25zdCBhcmNSYWRpaSA9IFstMTAsIC01LCAwLCA1LCAxMCwgMTVdLm1hcCh4ID0+IGFuZ2xlMmdyb3VuZERpc3RhbmNlKChtaWw1ICsgeCkgLyBVU19NSUwsIGZpcmluZ1NvbHV0aW9uLnN0YXJ0SGVpZ2h0T2Zmc2V0LCBNT1JUQVJfVkVMT0NJVFksIEdSQVZJVFkpKTtcclxuICAgICAgICBjb25zdCBbcmEsIHIwLCByMSwgcjIsIHIzLCByYl0gPSBhcmNSYWRpaTtcclxuICAgICAgICAvLyDnu5jliLblvoTlkJHnvZHmoLznur9cclxuICAgICAgICBbLTIsIC0xLCAwLCAxLCAyLCAzXS5mb3JFYWNoKGdyaWRPZmZzZXQgPT4gZHJhd01vcnRhckdyaWRMaW5lKGN0eCwgMCwgMCwgcmEsIHJiLCBncmlkRGlyICsgZ3JpZE9mZnNldCkpO1xyXG4gICAgICAgIC8vIOe7mOWItuW8p+e6v+e9keagvFxyXG4gICAgICAgIGFyY1JhZGlpLmZvckVhY2goYXJjUmFkaXVzID0+IGRyYXdNb3J0YXJHcmlkQXJjKGN0eCwgMCwgMCwgYXJjUmFkaXVzLCBncmlkRGlyKSk7XHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIGRyYXdUYXJnZXQoY3R4LCBjYW1lcmEsIHVzZXJTZXR0aW5ncywgaGVpZ2h0bWFwLCB3ZWFwb25zLCB0YXJnZXQsIGRpcmRhdGFzLCB1c2VySWQpIHtcclxuICAgICAgICBjb25zdCBjYW52YXNTaXplRmFjdG9yID0gbWF0NC5nZXRTY2FsaW5nKHZlYzMuY3JlYXRlKCksIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpWzBdO1xyXG4gICAgICAgIGNhbm9uaWNhbEVudGl0eVNvcnQod2VhcG9ucyk7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2VhcG9ucyA9IHdlYXBvbnMuZmlsdGVyKCh3KSA9PiB3LmlzQWN0aXZlKTtcclxuICAgICAgICBjb25zdCBhbGxXZWFwb25zSW5kZXggPSB7fTtcclxuICAgICAgICB3ZWFwb25zLmZvckVhY2goKHcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh3LmlzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBhbGxXZWFwb25zSW5kZXhbdy5lbnRpdHlJZF0gPSBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFjdGl2ZVdlYXBvbnMuZm9yRWFjaCgod2VhcG9uLCBhY3RpdmVXZWFwb25JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XHJcbiAgICAgICAgICAgIGNvbnN0IHdlYXBvblRyYW5zbGF0aW9uID0gZ2V0VHJhbnNsYXRpb24od2VhcG9uLnRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHdlYXBvbkhlaWdodCA9IGdldEhlaWdodChoZWlnaHRtYXAsIHdlYXBvblRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgd2VhcG9uVHJhbnNsYXRpb25bMl0gPSB3ZWFwb25IZWlnaHQgKyB3ZWFwb24uaGVpZ2h0T3Zlckdyb3VuZDtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0VHJhbnNsYXRpb24gPSBnZXRUcmFuc2xhdGlvbih0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0SGVpZ2h0ID0gZ2V0SGVpZ2h0KGhlaWdodG1hcCwgdGFyZ2V0VHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB0YXJnZXRUcmFuc2xhdGlvblsyXSA9IHRhcmdldEhlaWdodDtcclxuICAgICAgICAgICAgY29uc3Qgc29sdXRpb24gPSB0aGlzLmdldEZpcmluZ1NvbHV0aW9uKHdlYXBvblRyYW5zbGF0aW9uLCB0YXJnZXRUcmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB1c2VyU2V0dGluZ3MuZm9udFNpemUgKiAodXNlclNldHRpbmdzLnRhcmdldENvbXBhY3RNb2RlID8gMSA6IDEuNyk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0R3JpZCAmJiB0aGlzLnN1cHBvcnRzR3JpZCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUYXJnZXRHcmlkKGN0eCwgY2FudmFzU2l6ZUZhY3Rvciwgd2VhcG9uLnRyYW5zZm9ybSwgc29sdXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgdGFyZ2V0LnRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0U3ByZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlyZGF0YXMgJiYgKChfYiA9IChfYSA9IGRpcmRhdGFzLmdldCh0YXJnZXQuZW50aXR5SWQpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudXNlcklkcykgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmluY2x1ZGVzKHVzZXJJZCB8fCAnJykpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmZjAwNGQnO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyMzEsIDc2LCA2MCwwLjUpJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRpcmRhdGFzICYmICEoKF9kID0gKF9jID0gZGlyZGF0YXMuZ2V0KHRhcmdldC5lbnRpdHlJZCkpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy51c2VySWRzKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuaW5jbHVkZXModXNlcklkIHx8ICcnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI0FBQjdCOCc7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDEzMSwgMTQ1LCAxNDYsMC41KSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTcHJlYWQoY3R4LCBzb2x1dGlvbiwgY2FudmFzU2l6ZUZhY3RvciwgdXNlclNldHRpbmdzLnRhcmdldFNwbGFzaCwgZGlyZGF0YXMgPT09IG51bGwgfHwgZGlyZGF0YXMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRpcmRhdGFzLmhhcyh0YXJnZXQuZW50aXR5SWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0U3BsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTcGxhc2goY3R4LCBjYW52YXNTaXplRmFjdG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpO1xyXG4gICAgICAgICAgICBjb25zdCBhbmdsZVZhbHVlID0gdGhpcy5nZXRBbmdsZVZhbHVlKHNvbHV0aW9uLCB1c2VyU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIG5ld1RyYW5zbGF0aW9uKDEwLCBhY3RpdmVXZWFwb25JbmRleCAqIGxpbmVIZWlnaHQsIDApKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRDb21wYWN0TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IFwiLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IHRoaXMuZ2V0QW5nbGVQcmVjaXNpb24odXNlclNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgIGlmIChzb2x1dGlvbi5hbmdsZSAmJiBhbmdsZVZhbHVlID49IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZVZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigxLCA0ICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNvbHV0aW9uLmFuZ2xlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gYW5nbGVWYWx1ZS50b0ZpeGVkKHByZWNpc2lvbikudG9TdHJpbmcoKS5zdWJzdHIoMCwgMyArIHByZWNpc2lvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlV2VhcG9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gKGFsbFdlYXBvbnNJbmRleFt3ZWFwb24uZW50aXR5SWRdICsgMSkudG9TdHJpbmcoKSArIFwiOiBcIiArIGFuZ2xlVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dGxpbmVUZXh0KGN0eCwgYW5nbGVUZXh0LCBcIm1pZGRsZVwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBhbmdsZVRleHQgPSB0aGlzLmdldEFuZ2xlVGV4dChhbmdsZVZhbHVlLCBzb2x1dGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlV2VhcG9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gKGFsbFdlYXBvbnNJbmRleFt3ZWFwb24uZW50aXR5SWRdICsgMSkudG9TdHJpbmcoKSArIFwiOiBcIiArIGFuZ2xlVGV4dDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dGxpbmVUZXh0KGN0eCwgYW5nbGVUZXh0LCBcImJvdHRvbVwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdHRvbVRleHQgPSB1c2VyU2V0dGluZ3MudGFyZ2V0RGlzdGFuY2UgP1xyXG4gICAgICAgICAgICAgICAgICAgIGAke3NvbHV0aW9uLmRpci50b0ZpeGVkKDEpfcKwICR7KHNvbHV0aW9uLmRpc3QgKiBNQVBTQ0FMRSkudG9GaXhlZCgwKX1tYCA6XHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uZGlyLnRvRml4ZWQoMSl9wrBgO1xyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBib3R0b21UZXh0LCBcInRvcFwiLCBURVhUX1JFRCwgVEVYVF9XSElURSwgdXNlclNldHRpbmdzLmZvbnRTaXplICogMiAvIDMsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kcmF3VGFyZ2V0SWNvbihjdHgsIGNhbWVyYSwgdGFyZ2V0LnRyYW5zZm9ybSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9