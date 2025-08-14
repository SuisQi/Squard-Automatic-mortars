"use strict";
(self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || []).push([["src_render_weaponRenderers_MK19WeaponRenderer_ts"],{

/***/ "./src/render/weaponRenderers/MK19WeaponRenderer.ts":
/*!**********************************************************!*\
  !*** ./src/render/weaponRenderers/MK19WeaponRenderer.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GRAVITY: () => (/* binding */ GRAVITY),
/* harmony export */   MAPSCALE: () => (/* binding */ MAPSCALE),
/* harmony export */   MK19WeaponRenderer: () => (/* binding */ MK19WeaponRenderer),
/* harmony export */   MK19_100_DAMAGE_RANGE: () => (/* binding */ MK19_100_DAMAGE_RANGE),
/* harmony export */   MK19_25_DAMAGE_RANGE: () => (/* binding */ MK19_25_DAMAGE_RANGE),
/* harmony export */   MK19_DEVIATION: () => (/* binding */ MK19_DEVIATION),
/* harmony export */   MK19_GRAVITY: () => (/* binding */ MK19_GRAVITY),
/* harmony export */   MK19_MAX_RANGE: () => (/* binding */ MK19_MAX_RANGE),
/* harmony export */   MK19_MIN_RANGE: () => (/* binding */ MK19_MIN_RANGE),
/* harmony export */   MK19_MOA: () => (/* binding */ MK19_MOA),
/* harmony export */   MK19_VELOCITY: () => (/* binding */ MK19_VELOCITY)
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









// MK19榴弹发射器相关常量
const MAPSCALE = 0.01;
const GRAVITY = 980; // cm/s^2
// MK19 40mm榴弹发射器特有常量
const MK19_MOA = 35;
const MK19_DEVIATION = MK19_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
const MK19_VELOCITY = 23600; // cm/s
const MK19_MAX_RANGE = 340000; // cm
const MK19_MIN_RANGE = 3000; // cm
const MK19_100_DAMAGE_RANGE = 100; // cm
const MK19_25_DAMAGE_RANGE = 150; // cm
const MK19_GRAVITY = GRAVITY; // cm/s^2
/**
 * MK19 40mm自动榴弹发射器武器渲染器
 * 低弹道直射武器，具有高精度和快速射击能力
 */
class MK19WeaponRenderer extends _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__.BaseWeaponRenderer {
    constructor() {
        super(...arguments);
        this.weaponType = "MK19";
    }
    // 实现基类抽象方法 - 武器常量
    getVelocity() { return MK19_VELOCITY; }
    getGravity() { return MK19_GRAVITY; }
    getDeviation() { return MK19_DEVIATION; }
    getMinRange() { return MK19_MIN_RANGE; }
    getMaxRange() { return MK19_MAX_RANGE; }
    get100DamageRange() { return MK19_100_DAMAGE_RANGE; }
    get25DamageRange() { return MK19_25_DAMAGE_RANGE; }
    getFiringSolution(weaponTranslation, targetTranslation) {
        return (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.getMK19FiringSolution)(weaponTranslation, targetTranslation).lowArc;
    }
    drawSplash(ctx, lineWidthFactor) {
        ctx.lineWidth = 1 * lineWidthFactor;
        ctx.strokeStyle = '#f00';
        // 绘制100%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, MK19_100_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
        // 绘制25%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, MK19_25_DAMAGE_RANGE, 0, 2 * Math.PI);
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
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + MK19_100_DAMAGE_RANGE, firingSolution.closeSpread + MK19_100_DAMAGE_RANGE, firingSolution.closeSpread + MK19_100_DAMAGE_RANGE);
            // 绘制25%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, firingSolution.weaponToTargetVec, firingSolution.horizontalSpread + MK19_25_DAMAGE_RANGE, firingSolution.closeSpread + MK19_25_DAMAGE_RANGE, firingSolution.closeSpread + MK19_25_DAMAGE_RANGE);
        }
    }
    getAngleValue(solution, userSettings) {
        return solution.angle / Math.PI * 180;
    }
    getAngleText(angleValue, solution) {
        return solution.angle ? `${(angleValue.toFixed(2))}` : "-----";
    }
    getAnglePrecision(userSettings) {
        return 2;
    }
    supportsGrid() {
        return false; // MK19不支持网格显示
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlbmRlcl93ZWFwb25SZW5kZXJlcnNfTUsxOVdlYXBvblJlbmRlcmVyX3RzLmFwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF1QztBQUNtQjtBQUNKO0FBQ2dCO0FBQ1c7QUFDcEI7QUFDZ0I7QUFDckI7QUFDSjtBQUNwRDtBQUNPO0FBQ0EscUJBQXFCO0FBQzVCO0FBQ087QUFDQSwwREFBMEQ7QUFDMUQsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsbUNBQW1DO0FBQ25DLGtDQUFrQztBQUNsQyw4QkFBOEI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDTyxpQ0FBaUMsbUVBQWtCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsbUJBQW1CO0FBQ25CLHFCQUFxQjtBQUNyQixvQkFBb0I7QUFDcEIsb0JBQW9CO0FBQ3BCLDBCQUEwQjtBQUMxQix5QkFBeUI7QUFDekI7QUFDQSxlQUFlLCtFQUFxQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsMERBQWlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0EsWUFBWSwwREFBaUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLHdCQUF3QjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQSxpQ0FBaUMsaURBQWUsQ0FBQyw2Q0FBVyxJQUFJLDZEQUFvQjtBQUNwRixRQUFRLGlFQUFtQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLHNDQUFzQyxzRUFBYztBQUNwRCxpQ0FBaUMsK0RBQVM7QUFDMUM7QUFDQSxzQ0FBc0Msc0VBQWM7QUFDcEQsaUNBQWlDLCtEQUFTO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzRUFBYztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzRUFBYyxNQUFNLDZEQUFvQjtBQUNwRDtBQUNBLFlBQVksc0VBQWMsTUFBTSxzRUFBYztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isb0RBQVcsMkJBQTJCLGdEQUFRLEVBQUUsa0RBQVU7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG9EQUFXLDJCQUEyQixnREFBUSxFQUFFLGtEQUFVO0FBQzFFO0FBQ0EsdUJBQXVCLHdCQUF3QixJQUFJLHNDQUFzQztBQUN6Rix1QkFBdUIsd0JBQXdCO0FBQy9DLGdCQUFnQixvREFBVyx5QkFBeUIsZ0RBQVEsRUFBRSxrREFBVTtBQUN4RTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3NxdWFkc3RyYXQvLi9zcmMvcmVuZGVyL3dlYXBvblJlbmRlcmVycy9NSzE5V2VhcG9uUmVuZGVyZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdmVjMywgbWF0NCB9IGZyb20gXCJnbC1tYXRyaXhcIjtcclxuaW1wb3J0IHsgQmFzZVdlYXBvblJlbmRlcmVyIH0gZnJvbSBcIi4vQmFzZVdlYXBvblJlbmRlcmVyXCI7XHJcbmltcG9ydCB7IGdldEhlaWdodCB9IGZyb20gXCIuLi8uLi9oZWlnaHRtYXAvaGVpZ2h0bWFwXCI7XHJcbmltcG9ydCB7IGdldE1LMTlGaXJpbmdTb2x1dGlvbiB9IGZyb20gXCIuLi8uLi93b3JsZC9wcm9qZWN0aWxlUGh5c2ljc1wiO1xyXG5pbXBvcnQgeyBjYW52YXNTY2FsZVRyYW5zZm9ybSwgZHJhd1NwcmVhZEVsbGlwc2UsIG91dGxpbmVUZXh0IH0gZnJvbSBcIi4uL2NhbnZhc1wiO1xyXG5pbXBvcnQgeyBhcHBseVRyYW5zZm9ybSB9IGZyb20gXCIuLi8uLi93b3JsZC90cmFuc2Zvcm1hdGlvbnNcIjtcclxuaW1wb3J0IHsgZ2V0VHJhbnNsYXRpb24sIG5ld1RyYW5zbGF0aW9uIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3RyYW5zZm9ybWF0aW9uc1wiO1xyXG5pbXBvcnQgeyBjYW5vbmljYWxFbnRpdHlTb3J0IH0gZnJvbSBcIi4uLy4uL3dvcmxkL3dvcmxkXCI7XHJcbmltcG9ydCB7IFRFWFRfUkVELCBURVhUX1dISVRFIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xyXG4vLyBNSzE55qa05by55Y+R5bCE5Zmo55u45YWz5bi46YePXHJcbmV4cG9ydCBjb25zdCBNQVBTQ0FMRSA9IDAuMDE7XHJcbmV4cG9ydCBjb25zdCBHUkFWSVRZID0gOTgwOyAvLyBjbS9zXjJcclxuLy8gTUsxOSA0MG1t5qa05by55Y+R5bCE5Zmo54m55pyJ5bi46YePXHJcbmV4cG9ydCBjb25zdCBNSzE5X01PQSA9IDM1O1xyXG5leHBvcnQgY29uc3QgTUsxOV9ERVZJQVRJT04gPSBNSzE5X01PQSAvIDYwICogTWF0aC5QSSAvIDE4MCAvIDI7IC8vIGNvbmUgYW5nbGUgZnJvbSBjZW50ZXIgfiBcInJhZGl1cyBhbmdsZVwiXHJcbmV4cG9ydCBjb25zdCBNSzE5X1ZFTE9DSVRZID0gMjM2MDA7IC8vIGNtL3NcclxuZXhwb3J0IGNvbnN0IE1LMTlfTUFYX1JBTkdFID0gMzQwMDAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTUsxOV9NSU5fUkFOR0UgPSAzMDAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTUsxOV8xMDBfREFNQUdFX1JBTkdFID0gMTAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgTUsxOV8yNV9EQU1BR0VfUkFOR0UgPSAxNTA7IC8vIGNtXHJcbmV4cG9ydCBjb25zdCBNSzE5X0dSQVZJVFkgPSBHUkFWSVRZOyAvLyBjbS9zXjJcclxuLyoqXHJcbiAqIE1LMTkgNDBtbeiHquWKqOamtOW8ueWPkeWwhOWZqOatpuWZqOa4suafk+WZqFxyXG4gKiDkvY7lvLnpgZPnm7TlsITmrablmajvvIzlhbfmnInpq5jnsr7luqblkozlv6vpgJ/lsITlh7vog73liptcclxuICovXHJcbmV4cG9ydCBjbGFzcyBNSzE5V2VhcG9uUmVuZGVyZXIgZXh0ZW5kcyBCYXNlV2VhcG9uUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB0aGlzLndlYXBvblR5cGUgPSBcIk1LMTlcIjtcclxuICAgIH1cclxuICAgIC8vIOWunueOsOWfuuexu+aKveixoeaWueazlSAtIOatpuWZqOW4uOmHj1xyXG4gICAgZ2V0VmVsb2NpdHkoKSB7IHJldHVybiBNSzE5X1ZFTE9DSVRZOyB9XHJcbiAgICBnZXRHcmF2aXR5KCkgeyByZXR1cm4gTUsxOV9HUkFWSVRZOyB9XHJcbiAgICBnZXREZXZpYXRpb24oKSB7IHJldHVybiBNSzE5X0RFVklBVElPTjsgfVxyXG4gICAgZ2V0TWluUmFuZ2UoKSB7IHJldHVybiBNSzE5X01JTl9SQU5HRTsgfVxyXG4gICAgZ2V0TWF4UmFuZ2UoKSB7IHJldHVybiBNSzE5X01BWF9SQU5HRTsgfVxyXG4gICAgZ2V0MTAwRGFtYWdlUmFuZ2UoKSB7IHJldHVybiBNSzE5XzEwMF9EQU1BR0VfUkFOR0U7IH1cclxuICAgIGdldDI1RGFtYWdlUmFuZ2UoKSB7IHJldHVybiBNSzE5XzI1X0RBTUFHRV9SQU5HRTsgfVxyXG4gICAgZ2V0RmlyaW5nU29sdXRpb24od2VhcG9uVHJhbnNsYXRpb24sIHRhcmdldFRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldE1LMTlGaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pLmxvd0FyYztcclxuICAgIH1cclxuICAgIGRyYXdTcGxhc2goY3R4LCBsaW5lV2lkdGhGYWN0b3IpIHtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2YwMCc7XHJcbiAgICAgICAgLy8g57uY5Yi2MTAwJeS8pOWus+iMg+WbtFxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKDAsIDAsIE1LMTlfMTAwX0RBTUFHRV9SQU5HRSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAvLyDnu5jliLYyNSXkvKTlrrPojIPlm7RcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYygwLCAwLCBNSzE5XzI1X0RBTUFHRV9SQU5HRSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIGRyYXdTcHJlYWQoY3R4LCBmaXJpbmdTb2x1dGlvbiwgbGluZVdpZHRoRmFjdG9yLCB3aXRoU3BsYXNoLCBzZWxlY3RlZCA9IGZhbHNlKSB7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDEgKiBsaW5lV2lkdGhGYWN0b3I7XHJcbiAgICAgICAgaWYgKCFzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwZic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOe7mOWItueyvuW6puakreWchlxyXG4gICAgICAgIGRyYXdTcHJlYWRFbGxpcHNlKGN0eCwgZmlyaW5nU29sdXRpb24ud2VhcG9uVG9UYXJnZXRWZWMsIGZpcmluZ1NvbHV0aW9uLmhvcml6b250YWxTcHJlYWQsIGZpcmluZ1NvbHV0aW9uLmNsb3NlU3ByZWFkLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCwgc2VsZWN0ZWQpO1xyXG4gICAgICAgIGlmICh3aXRoU3BsYXNoKSB7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjZjAwJztcclxuICAgICAgICAgICAgLy8g57uY5Yi2MTAwJeS8pOWus+iMg+WbtOakreWchlxyXG4gICAgICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGZpcmluZ1NvbHV0aW9uLndlYXBvblRvVGFyZ2V0VmVjLCBmaXJpbmdTb2x1dGlvbi5ob3Jpem9udGFsU3ByZWFkICsgTUsxOV8xMDBfREFNQUdFX1JBTkdFLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCArIE1LMTlfMTAwX0RBTUFHRV9SQU5HRSwgZmlyaW5nU29sdXRpb24uY2xvc2VTcHJlYWQgKyBNSzE5XzEwMF9EQU1BR0VfUkFOR0UpO1xyXG4gICAgICAgICAgICAvLyDnu5jliLYyNSXkvKTlrrPojIPlm7TmpK3lnIZcclxuICAgICAgICAgICAgZHJhd1NwcmVhZEVsbGlwc2UoY3R4LCBmaXJpbmdTb2x1dGlvbi53ZWFwb25Ub1RhcmdldFZlYywgZmlyaW5nU29sdXRpb24uaG9yaXpvbnRhbFNwcmVhZCArIE1LMTlfMjVfREFNQUdFX1JBTkdFLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCArIE1LMTlfMjVfREFNQUdFX1JBTkdFLCBmaXJpbmdTb2x1dGlvbi5jbG9zZVNwcmVhZCArIE1LMTlfMjVfREFNQUdFX1JBTkdFKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRBbmdsZVZhbHVlKHNvbHV0aW9uLCB1c2VyU2V0dGluZ3MpIHtcclxuICAgICAgICByZXR1cm4gc29sdXRpb24uYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uLmFuZ2xlID8gYCR7KGFuZ2xlVmFsdWUudG9GaXhlZCgyKSl9YCA6IFwiLS0tLS1cIjtcclxuICAgIH1cclxuICAgIGdldEFuZ2xlUHJlY2lzaW9uKHVzZXJTZXR0aW5ncykge1xyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgc3VwcG9ydHNHcmlkKCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gTUsxOeS4jeaUr+aMgee9keagvOaYvuekulxyXG4gICAgfVxyXG4gICAgZHJhd1RhcmdldChjdHgsIGNhbWVyYSwgdXNlclNldHRpbmdzLCBoZWlnaHRtYXAsIHdlYXBvbnMsIHRhcmdldCwgZGlyZGF0YXMsIHVzZXJJZCkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhc1NpemVGYWN0b3IgPSBtYXQ0LmdldFNjYWxpbmcodmVjMy5jcmVhdGUoKSwgY2FudmFzU2NhbGVUcmFuc2Zvcm0oY2FtZXJhKSlbMF07XHJcbiAgICAgICAgY2Fub25pY2FsRW50aXR5U29ydCh3ZWFwb25zKTtcclxuICAgICAgICBjb25zdCBhY3RpdmVXZWFwb25zID0gd2VhcG9ucy5maWx0ZXIoKHcpID0+IHcuaXNBY3RpdmUpO1xyXG4gICAgICAgIGNvbnN0IGFsbFdlYXBvbnNJbmRleCA9IHt9O1xyXG4gICAgICAgIHdlYXBvbnMuZm9yRWFjaCgodywgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHcuaXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgIGFsbFdlYXBvbnNJbmRleFt3LmVudGl0eUlkXSA9IGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYWN0aXZlV2VhcG9ucy5mb3JFYWNoKCh3ZWFwb24sIGFjdGl2ZVdlYXBvbkluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZDtcclxuICAgICAgICAgICAgY29uc3Qgd2VhcG9uVHJhbnNsYXRpb24gPSBnZXRUcmFuc2xhdGlvbih3ZWFwb24udHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgY29uc3Qgd2VhcG9uSGVpZ2h0ID0gZ2V0SGVpZ2h0KGhlaWdodG1hcCwgd2VhcG9uVHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB3ZWFwb25UcmFuc2xhdGlvblsyXSA9IHdlYXBvbkhlaWdodCArIHdlYXBvbi5oZWlnaHRPdmVyR3JvdW5kO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUcmFuc2xhdGlvbiA9IGdldFRyYW5zbGF0aW9uKHRhcmdldC50cmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIZWlnaHQgPSBnZXRIZWlnaHQoaGVpZ2h0bWFwLCB0YXJnZXRUcmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIHRhcmdldFRyYW5zbGF0aW9uWzJdID0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBjb25zdCBzb2x1dGlvbiA9IHRoaXMuZ2V0RmlyaW5nU29sdXRpb24od2VhcG9uVHJhbnNsYXRpb24sIHRhcmdldFRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IHVzZXJTZXR0aW5ncy5mb250U2l6ZSAqICh1c2VyU2V0dGluZ3MudGFyZ2V0Q29tcGFjdE1vZGUgPyAxIDogMS43KTtcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgYXBwbHlUcmFuc2Zvcm0oY3R4LCB0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRTcHJlYWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkaXJkYXRhcyAmJiAoKF9iID0gKF9hID0gZGlyZGF0YXMuZ2V0KHRhcmdldC5lbnRpdHlJZCkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS51c2VySWRzKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuaW5jbHVkZXModXNlcklkIHx8ICcnKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnI2ZmMDA0ZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDIzMSwgNzYsIDYwLDAuNSknO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGlyZGF0YXMgJiYgISgoX2QgPSAoX2MgPSBkaXJkYXRhcy5nZXQodGFyZ2V0LmVudGl0eUlkKSkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLnVzZXJJZHMpID09PSBudWxsIHx8IF9kID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZC5pbmNsdWRlcyh1c2VySWQgfHwgJycpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjQUFCN0I4JztcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMTMxLCAxNDUsIDE0NiwwLjUpJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1NwcmVhZChjdHgsIHNvbHV0aW9uLCBjYW52YXNTaXplRmFjdG9yLCB1c2VyU2V0dGluZ3MudGFyZ2V0U3BsYXNoLCBkaXJkYXRhcyA9PT0gbnVsbCB8fCBkaXJkYXRhcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGlyZGF0YXMuaGFzKHRhcmdldC5lbnRpdHlJZCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRTcGxhc2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1NwbGFzaChjdHgsIGNhbnZhc1NpemVGYWN0b3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgY2FudmFzU2NhbGVUcmFuc2Zvcm0oY2FtZXJhKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlVmFsdWUgPSB0aGlzLmdldEFuZ2xlVmFsdWUoc29sdXRpb24sIHVzZXJTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgbmV3VHJhbnNsYXRpb24oMTAsIGFjdGl2ZVdlYXBvbkluZGV4ICogbGluZUhlaWdodCwgMCkpO1xyXG4gICAgICAgICAgICBpZiAodXNlclNldHRpbmdzLnRhcmdldENvbXBhY3RNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYW5nbGVUZXh0ID0gXCItLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlY2lzaW9uID0gdGhpcy5nZXRBbmdsZVByZWNpc2lvbih1c2VyU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvbHV0aW9uLmFuZ2xlICYmIGFuZ2xlVmFsdWUgPj0gMTAwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlVGV4dCA9IGFuZ2xlVmFsdWUudG9GaXhlZChwcmVjaXNpb24pLnRvU3RyaW5nKCkuc3Vic3RyKDEsIDQgKyBwcmVjaXNpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc29sdXRpb24uYW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZVZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigwLCAzICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwibWlkZGxlXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IHRoaXMuZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwiYm90dG9tXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tVGV4dCA9IHVzZXJTZXR0aW5ncy50YXJnZXREaXN0YW5jZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uZGlyLnRvRml4ZWQoMSl9wrAgJHsoc29sdXRpb24uZGlzdCAqIE1BUFNDQUxFKS50b0ZpeGVkKDApfW1gIDpcclxuICAgICAgICAgICAgICAgICAgICBgJHtzb2x1dGlvbi5kaXIudG9GaXhlZCgxKX3CsGA7XHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lVGV4dChjdHgsIGJvdHRvbVRleHQsIFwidG9wXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUgKiAyIC8gMywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRyYXdUYXJnZXRJY29uKGN0eCwgY2FtZXJhLCB0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=