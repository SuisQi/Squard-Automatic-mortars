"use strict";
(self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || []).push([["src_render_weaponRenderers_HellCannonWeaponRenderer_ts"],{

/***/ "./src/render/weaponRenderers/HellCannonWeaponRenderer.ts":
/*!****************************************************************!*\
  !*** ./src/render/weaponRenderers/HellCannonWeaponRenderer.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HELL_CANNON_100_DAMAGE_RANGE: () => (/* binding */ HELL_CANNON_100_DAMAGE_RANGE),
/* harmony export */   HELL_CANNON_25_DAMAGE_RANGE: () => (/* binding */ HELL_CANNON_25_DAMAGE_RANGE),
/* harmony export */   HELL_CANNON_DEVIATION: () => (/* binding */ HELL_CANNON_DEVIATION),
/* harmony export */   HELL_CANNON_MAX_RANGE: () => (/* binding */ HELL_CANNON_MAX_RANGE),
/* harmony export */   HELL_CANNON_MOA: () => (/* binding */ HELL_CANNON_MOA),
/* harmony export */   HELL_CANNON_VELOCITY: () => (/* binding */ HELL_CANNON_VELOCITY),
/* harmony export */   HellCannonWeaponRenderer: () => (/* binding */ HellCannonWeaponRenderer),
/* harmony export */   MAPSCALE: () => (/* binding */ MAPSCALE)
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









// 地狱火炮相关常量
const MAPSCALE = 0.01;
// 地狱火炮特有常量
const HELL_CANNON_VELOCITY = 9500; // cm/s
const HELL_CANNON_MOA = 100;
const HELL_CANNON_DEVIATION = HELL_CANNON_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
const HELL_CANNON_MAX_RANGE = 92400; // cm, approx
const HELL_CANNON_100_DAMAGE_RANGE = 1000; // cm
const HELL_CANNON_25_DAMAGE_RANGE = 4000; // cm
/**
 * 地狱火炮武器渲染器
 * 即兴爆炸装置(IED)炮，具有高弧和低弧两种射击模式
 */
class HellCannonWeaponRenderer extends _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__.BaseWeaponRenderer {
    constructor() {
        super(...arguments);
        this.weaponType = "hellCannon";
    }
    // 实现基类抽象方法 - 武器常量
    getVelocity() { return HELL_CANNON_VELOCITY; }
    getGravity() { return 980; } // 使用标准重力
    getDeviation() { return HELL_CANNON_DEVIATION; }
    getMinRange() { return 0; } // 地狱火炮无最小射程限制
    getMaxRange() { return HELL_CANNON_MAX_RANGE; }
    get100DamageRange() { return HELL_CANNON_100_DAMAGE_RANGE; }
    get25DamageRange() { return HELL_CANNON_25_DAMAGE_RANGE; }
    getFiringSolution(weaponTranslation, targetTranslation) {
        return (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.getHellCannonFiringSolution)(weaponTranslation, targetTranslation);
    }
    drawSplash(ctx, lineWidthFactor) {
        ctx.lineWidth = 1 * lineWidthFactor;
        ctx.strokeStyle = '#f00';
        // 绘制100%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, HELL_CANNON_100_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
        // 绘制25%伤害范围
        ctx.beginPath();
        ctx.arc(0, 0, HELL_CANNON_25_DAMAGE_RANGE, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected = false) {
        const { highArc, lowArc } = firingSolution;
        ctx.lineWidth = 1 * lineWidthFactor;
        ctx.strokeStyle = '#00f';
        // 绘制高弧精度椭圆
        (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, highArc.weaponToTargetVec, highArc.horizontalSpread, highArc.closeSpread, highArc.closeSpread);
        // 绘制低弧精度椭圆
        (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, lowArc.weaponToTargetVec, lowArc.horizontalSpread, lowArc.closeSpread, lowArc.closeSpread);
        if (withSplash) {
            ctx.strokeStyle = '#f00';
            // 绘制高弧100%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, highArc.weaponToTargetVec, highArc.horizontalSpread + HELL_CANNON_100_DAMAGE_RANGE, highArc.closeSpread + HELL_CANNON_100_DAMAGE_RANGE, highArc.closeSpread + HELL_CANNON_100_DAMAGE_RANGE);
            // 绘制高弧25%伤害范围椭圆
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, highArc.weaponToTargetVec, highArc.horizontalSpread + HELL_CANNON_25_DAMAGE_RANGE, highArc.closeSpread + HELL_CANNON_25_DAMAGE_RANGE, highArc.closeSpread + HELL_CANNON_25_DAMAGE_RANGE);
        }
    }
    getAngleValue(solution, userSettings) {
        return solution.highArc.angle / Math.PI * 180;
    }
    getAngleText(angleValue, solution) {
        const { highArc, lowArc } = solution;
        const angleLowValue = lowArc.angle / Math.PI * 180;
        return highArc.angle ? `${angleValue.toFixed(1)} | ${angleLowValue.toFixed(1)}` : "-----";
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
                this.drawSpread(ctx, solution, canvasSizeFactor, userSettings.targetSplash);
            }
            else if (userSettings.targetSplash) {
                this.drawSplash(ctx, canvasSizeFactor);
            }
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.canvasScaleTransform)(camera));
            const angleValue = this.getAngleValue(solution, userSettings);
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.newTranslation)(10, activeWeaponIndex * lineHeight, 0));
            if (userSettings.targetCompactMode) {
                let angleText = "-----";
                const precision = 1;
                if (solution.highArc.angle && angleValue >= 1000) {
                    angleText = angleValue.toFixed(precision).toString().substr(1, 4 + precision);
                }
                else if (solution.highArc.angle) {
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
                const bottomTextComponents = [
                    `${solution.highArc.dir.toFixed(1)}°`,
                    `${solution.highArc.time ? solution.highArc.time.toFixed(1) : "-"}s | ${solution.lowArc.time ? solution.lowArc.time.toFixed(1) : "-"}s`,
                    userSettings.targetDistance ? `${(solution.highArc.dist * MAPSCALE).toFixed(0)}m` : "",
                ];
                const bottomText = bottomTextComponents.join(' ');
                (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.outlineText)(ctx, bottomText, "top", _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_RED, _constants__WEBPACK_IMPORTED_MODULE_6__.TEXT_WHITE, userSettings.fontSize * 2 / 3, true);
            }
            ctx.restore();
        });
        this.drawTargetIcon(ctx, camera, target.transform);
    }
    supportsGrid() {
        return false; // 地狱火炮不支持网格显示
    }
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlbmRlcl93ZWFwb25SZW5kZXJlcnNfSGVsbENhbm5vbldlYXBvblJlbmRlcmVyX3RzLmFwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF1QztBQUNtQjtBQUNKO0FBQ3NCO0FBQ0s7QUFDcEI7QUFDZ0I7QUFDckI7QUFDSjtBQUNwRDtBQUNPO0FBQ1A7QUFDTyxtQ0FBbUM7QUFDbkM7QUFDQSx3RUFBd0U7QUFDeEUscUNBQXFDO0FBQ3JDLDJDQUEyQztBQUMzQywwQ0FBMEM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDTyx1Q0FBdUMsbUVBQWtCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0I7QUFDcEIsbUJBQW1CLGNBQWM7QUFDakMscUJBQXFCO0FBQ3JCLG9CQUFvQixZQUFZO0FBQ2hDLG9CQUFvQjtBQUNwQiwwQkFBMEI7QUFDMUIseUJBQXlCO0FBQ3pCO0FBQ0EsZUFBZSxxRkFBMkI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0EsUUFBUSwwREFBaUI7QUFDekI7QUFDQSxRQUFRLDBEQUFpQjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSxZQUFZLDBEQUFpQjtBQUM3QjtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQSxrQ0FBa0MsdUJBQXVCLElBQUkseUJBQXlCO0FBQ3RGO0FBQ0E7QUFDQSxpQ0FBaUMsaURBQWUsQ0FBQyw2Q0FBVyxJQUFJLDZEQUFvQjtBQUNwRixRQUFRLGlFQUFtQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxzQ0FBc0Msc0VBQWM7QUFDcEQsaUNBQWlDLCtEQUFTO0FBQzFDO0FBQ0Esc0NBQXNDLHNFQUFjO0FBQ3BELGlDQUFpQywrREFBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0VBQWM7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzRUFBYyxNQUFNLDZEQUFvQjtBQUNwRDtBQUNBLFlBQVksc0VBQWMsTUFBTSxzRUFBYztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isb0RBQVcsMkJBQTJCLGdEQUFRLEVBQUUsa0RBQVU7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG9EQUFXLDJCQUEyQixnREFBUSxFQUFFLGtEQUFVO0FBQzFFO0FBQ0EsdUJBQXVCLGdDQUFnQztBQUN2RCx1QkFBdUIsK0RBQStELE1BQU0sNkRBQTZEO0FBQ3pKLHFEQUFxRCw4Q0FBOEM7QUFDbkc7QUFDQTtBQUNBLGdCQUFnQixvREFBVyx5QkFBeUIsZ0RBQVEsRUFBRSxrREFBVTtBQUN4RTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3F1YWRzdHJhdC8uL3NyYy9yZW5kZXIvd2VhcG9uUmVuZGVyZXJzL0hlbGxDYW5ub25XZWFwb25SZW5kZXJlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB2ZWMzLCBtYXQ0IH0gZnJvbSBcImdsLW1hdHJpeFwiO1xyXG5pbXBvcnQgeyBCYXNlV2VhcG9uUmVuZGVyZXIgfSBmcm9tIFwiLi9CYXNlV2VhcG9uUmVuZGVyZXJcIjtcclxuaW1wb3J0IHsgZ2V0SGVpZ2h0IH0gZnJvbSBcIi4uLy4uL2hlaWdodG1hcC9oZWlnaHRtYXBcIjtcclxuaW1wb3J0IHsgZ2V0SGVsbENhbm5vbkZpcmluZ1NvbHV0aW9uIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3Byb2plY3RpbGVQaHlzaWNzXCI7XHJcbmltcG9ydCB7IGNhbnZhc1NjYWxlVHJhbnNmb3JtLCBkcmF3U3ByZWFkRWxsaXBzZSwgb3V0bGluZVRleHQgfSBmcm9tIFwiLi4vY2FudmFzXCI7XHJcbmltcG9ydCB7IGFwcGx5VHJhbnNmb3JtIH0gZnJvbSBcIi4uLy4uL3dvcmxkL3RyYW5zZm9ybWF0aW9uc1wiO1xyXG5pbXBvcnQgeyBnZXRUcmFuc2xhdGlvbiwgbmV3VHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vd29ybGQvdHJhbnNmb3JtYXRpb25zXCI7XHJcbmltcG9ydCB7IGNhbm9uaWNhbEVudGl0eVNvcnQgfSBmcm9tIFwiLi4vLi4vd29ybGQvd29ybGRcIjtcclxuaW1wb3J0IHsgVEVYVF9SRUQsIFRFWFRfV0hJVEUgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XHJcbi8vIOWcsOeLseeBq+eCruebuOWFs+W4uOmHj1xyXG5leHBvcnQgY29uc3QgTUFQU0NBTEUgPSAwLjAxO1xyXG4vLyDlnLDni7Hngavngq7nibnmnInluLjph49cclxuZXhwb3J0IGNvbnN0IEhFTExfQ0FOTk9OX1ZFTE9DSVRZID0gOTUwMDsgLy8gY20vc1xyXG5leHBvcnQgY29uc3QgSEVMTF9DQU5OT05fTU9BID0gMTAwO1xyXG5leHBvcnQgY29uc3QgSEVMTF9DQU5OT05fREVWSUFUSU9OID0gSEVMTF9DQU5OT05fTU9BIC8gNjAgKiBNYXRoLlBJIC8gMTgwIC8gMjsgLy8gY29uZSBhbmdsZSBmcm9tIGNlbnRlciB+IFwicmFkaXVzIGFuZ2xlXCJcclxuZXhwb3J0IGNvbnN0IEhFTExfQ0FOTk9OX01BWF9SQU5HRSA9IDkyNDAwOyAvLyBjbSwgYXBwcm94XHJcbmV4cG9ydCBjb25zdCBIRUxMX0NBTk5PTl8xMDBfREFNQUdFX1JBTkdFID0gMTAwMDsgLy8gY21cclxuZXhwb3J0IGNvbnN0IEhFTExfQ0FOTk9OXzI1X0RBTUFHRV9SQU5HRSA9IDQwMDA7IC8vIGNtXHJcbi8qKlxyXG4gKiDlnLDni7Hngavngq7mrablmajmuLLmn5PlmahcclxuICog5Y2z5YW054iG54K46KOF572uKElFRCnngq7vvIzlhbfmnInpq5jlvKflkozkvY7lvKfkuKTnp43lsITlh7vmqKHlvI9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBIZWxsQ2Fubm9uV2VhcG9uUmVuZGVyZXIgZXh0ZW5kcyBCYXNlV2VhcG9uUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB0aGlzLndlYXBvblR5cGUgPSBcImhlbGxDYW5ub25cIjtcclxuICAgIH1cclxuICAgIC8vIOWunueOsOWfuuexu+aKveixoeaWueazlSAtIOatpuWZqOW4uOmHj1xyXG4gICAgZ2V0VmVsb2NpdHkoKSB7IHJldHVybiBIRUxMX0NBTk5PTl9WRUxPQ0lUWTsgfVxyXG4gICAgZ2V0R3Jhdml0eSgpIHsgcmV0dXJuIDk4MDsgfSAvLyDkvb/nlKjmoIflh4bph43liptcclxuICAgIGdldERldmlhdGlvbigpIHsgcmV0dXJuIEhFTExfQ0FOTk9OX0RFVklBVElPTjsgfVxyXG4gICAgZ2V0TWluUmFuZ2UoKSB7IHJldHVybiAwOyB9IC8vIOWcsOeLseeBq+eCruaXoOacgOWwj+WwhOeoi+mZkOWItlxyXG4gICAgZ2V0TWF4UmFuZ2UoKSB7IHJldHVybiBIRUxMX0NBTk5PTl9NQVhfUkFOR0U7IH1cclxuICAgIGdldDEwMERhbWFnZVJhbmdlKCkgeyByZXR1cm4gSEVMTF9DQU5OT05fMTAwX0RBTUFHRV9SQU5HRTsgfVxyXG4gICAgZ2V0MjVEYW1hZ2VSYW5nZSgpIHsgcmV0dXJuIEhFTExfQ0FOTk9OXzI1X0RBTUFHRV9SQU5HRTsgfVxyXG4gICAgZ2V0RmlyaW5nU29sdXRpb24od2VhcG9uVHJhbnNsYXRpb24sIHRhcmdldFRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldEhlbGxDYW5ub25GaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pO1xyXG4gICAgfVxyXG4gICAgZHJhd1NwbGFzaChjdHgsIGxpbmVXaWR0aEZhY3Rvcikge1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxICogbGluZVdpZHRoRmFjdG9yO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjZjAwJztcclxuICAgICAgICAvLyDnu5jliLYxMDAl5Lyk5a6z6IyD5Zu0XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5hcmMoMCwgMCwgSEVMTF9DQU5OT05fMTAwX0RBTUFHRV9SQU5HRSwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgICAvLyDnu5jliLYyNSXkvKTlrrPojIPlm7RcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYygwLCAwLCBIRUxMX0NBTk5PTl8yNV9EQU1BR0VfUkFOR0UsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBkcmF3U3ByZWFkKGN0eCwgZmlyaW5nU29sdXRpb24sIGxpbmVXaWR0aEZhY3Rvciwgd2l0aFNwbGFzaCwgc2VsZWN0ZWQgPSBmYWxzZSkge1xyXG4gICAgICAgIGNvbnN0IHsgaGlnaEFyYywgbG93QXJjIH0gPSBmaXJpbmdTb2x1dGlvbjtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwZic7XHJcbiAgICAgICAgLy8g57uY5Yi26auY5byn57K+5bqm5qSt5ZyGXHJcbiAgICAgICAgZHJhd1NwcmVhZEVsbGlwc2UoY3R4LCBoaWdoQXJjLndlYXBvblRvVGFyZ2V0VmVjLCBoaWdoQXJjLmhvcml6b250YWxTcHJlYWQsIGhpZ2hBcmMuY2xvc2VTcHJlYWQsIGhpZ2hBcmMuY2xvc2VTcHJlYWQpO1xyXG4gICAgICAgIC8vIOe7mOWItuS9juW8p+eyvuW6puakreWchlxyXG4gICAgICAgIGRyYXdTcHJlYWRFbGxpcHNlKGN0eCwgbG93QXJjLndlYXBvblRvVGFyZ2V0VmVjLCBsb3dBcmMuaG9yaXpvbnRhbFNwcmVhZCwgbG93QXJjLmNsb3NlU3ByZWFkLCBsb3dBcmMuY2xvc2VTcHJlYWQpO1xyXG4gICAgICAgIGlmICh3aXRoU3BsYXNoKSB7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjZjAwJztcclxuICAgICAgICAgICAgLy8g57uY5Yi26auY5bynMTAwJeS8pOWus+iMg+WbtOakreWchlxyXG4gICAgICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGhpZ2hBcmMud2VhcG9uVG9UYXJnZXRWZWMsIGhpZ2hBcmMuaG9yaXpvbnRhbFNwcmVhZCArIEhFTExfQ0FOTk9OXzEwMF9EQU1BR0VfUkFOR0UsIGhpZ2hBcmMuY2xvc2VTcHJlYWQgKyBIRUxMX0NBTk5PTl8xMDBfREFNQUdFX1JBTkdFLCBoaWdoQXJjLmNsb3NlU3ByZWFkICsgSEVMTF9DQU5OT05fMTAwX0RBTUFHRV9SQU5HRSk7XHJcbiAgICAgICAgICAgIC8vIOe7mOWItumrmOW8pzI1JeS8pOWus+iMg+WbtOakreWchlxyXG4gICAgICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGhpZ2hBcmMud2VhcG9uVG9UYXJnZXRWZWMsIGhpZ2hBcmMuaG9yaXpvbnRhbFNwcmVhZCArIEhFTExfQ0FOTk9OXzI1X0RBTUFHRV9SQU5HRSwgaGlnaEFyYy5jbG9zZVNwcmVhZCArIEhFTExfQ0FOTk9OXzI1X0RBTUFHRV9SQU5HRSwgaGlnaEFyYy5jbG9zZVNwcmVhZCArIEhFTExfQ0FOTk9OXzI1X0RBTUFHRV9SQU5HRSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVWYWx1ZShzb2x1dGlvbiwgdXNlclNldHRpbmdzKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uLmhpZ2hBcmMuYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgeyBoaWdoQXJjLCBsb3dBcmMgfSA9IHNvbHV0aW9uO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlTG93VmFsdWUgPSBsb3dBcmMuYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgIHJldHVybiBoaWdoQXJjLmFuZ2xlID8gYCR7YW5nbGVWYWx1ZS50b0ZpeGVkKDEpfSB8ICR7YW5nbGVMb3dWYWx1ZS50b0ZpeGVkKDEpfWAgOiBcIi0tLS0tXCI7XHJcbiAgICB9XHJcbiAgICBkcmF3VGFyZ2V0KGN0eCwgY2FtZXJhLCB1c2VyU2V0dGluZ3MsIGhlaWdodG1hcCwgd2VhcG9ucywgdGFyZ2V0LCBkaXJkYXRhcywgdXNlcklkKSB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzU2l6ZUZhY3RvciA9IG1hdDQuZ2V0U2NhbGluZyh2ZWMzLmNyZWF0ZSgpLCBjYW52YXNTY2FsZVRyYW5zZm9ybShjYW1lcmEpKVswXTtcclxuICAgICAgICBjYW5vbmljYWxFbnRpdHlTb3J0KHdlYXBvbnMpO1xyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVdlYXBvbnMgPSB3ZWFwb25zLmZpbHRlcigodykgPT4gdy5pc0FjdGl2ZSk7XHJcbiAgICAgICAgY29uc3QgYWxsV2VhcG9uc0luZGV4ID0ge307XHJcbiAgICAgICAgd2VhcG9ucy5mb3JFYWNoKCh3LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAody5pc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgYWxsV2VhcG9uc0luZGV4W3cuZW50aXR5SWRdID0gaW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBhY3RpdmVXZWFwb25zLmZvckVhY2goKHdlYXBvbiwgYWN0aXZlV2VhcG9uSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgd2VhcG9uVHJhbnNsYXRpb24gPSBnZXRUcmFuc2xhdGlvbih3ZWFwb24udHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgY29uc3Qgd2VhcG9uSGVpZ2h0ID0gZ2V0SGVpZ2h0KGhlaWdodG1hcCwgd2VhcG9uVHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB3ZWFwb25UcmFuc2xhdGlvblsyXSA9IHdlYXBvbkhlaWdodCArIHdlYXBvbi5oZWlnaHRPdmVyR3JvdW5kO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUcmFuc2xhdGlvbiA9IGdldFRyYW5zbGF0aW9uKHRhcmdldC50cmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIZWlnaHQgPSBnZXRIZWlnaHQoaGVpZ2h0bWFwLCB0YXJnZXRUcmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIHRhcmdldFRyYW5zbGF0aW9uWzJdID0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBjb25zdCBzb2x1dGlvbiA9IHRoaXMuZ2V0RmlyaW5nU29sdXRpb24od2VhcG9uVHJhbnNsYXRpb24sIHRhcmdldFRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IHVzZXJTZXR0aW5ncy5mb250U2l6ZSAqICh1c2VyU2V0dGluZ3MudGFyZ2V0Q29tcGFjdE1vZGUgPyAxIDogMS43KTtcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgYXBwbHlUcmFuc2Zvcm0oY3R4LCB0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRTcHJlYWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1NwcmVhZChjdHgsIHNvbHV0aW9uLCBjYW52YXNTaXplRmFjdG9yLCB1c2VyU2V0dGluZ3MudGFyZ2V0U3BsYXNoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1c2VyU2V0dGluZ3MudGFyZ2V0U3BsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdTcGxhc2goY3R4LCBjYW52YXNTaXplRmFjdG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpO1xyXG4gICAgICAgICAgICBjb25zdCBhbmdsZVZhbHVlID0gdGhpcy5nZXRBbmdsZVZhbHVlKHNvbHV0aW9uLCB1c2VyU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIG5ld1RyYW5zbGF0aW9uKDEwLCBhY3RpdmVXZWFwb25JbmRleCAqIGxpbmVIZWlnaHQsIDApKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRDb21wYWN0TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IFwiLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29sdXRpb24uaGlnaEFyYy5hbmdsZSAmJiBhbmdsZVZhbHVlID49IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZVZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigxLCA0ICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNvbHV0aW9uLmhpZ2hBcmMuYW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZVZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigwLCAzICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwibWlkZGxlXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IHRoaXMuZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwiYm90dG9tXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tVGV4dENvbXBvbmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uaGlnaEFyYy5kaXIudG9GaXhlZCgxKX3CsGAsXHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uaGlnaEFyYy50aW1lID8gc29sdXRpb24uaGlnaEFyYy50aW1lLnRvRml4ZWQoMSkgOiBcIi1cIn1zIHwgJHtzb2x1dGlvbi5sb3dBcmMudGltZSA/IHNvbHV0aW9uLmxvd0FyYy50aW1lLnRvRml4ZWQoMSkgOiBcIi1cIn1zYCxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2V0dGluZ3MudGFyZ2V0RGlzdGFuY2UgPyBgJHsoc29sdXRpb24uaGlnaEFyYy5kaXN0ICogTUFQU0NBTEUpLnRvRml4ZWQoMCl9bWAgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdHRvbVRleHQgPSBib3R0b21UZXh0Q29tcG9uZW50cy5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lVGV4dChjdHgsIGJvdHRvbVRleHQsIFwidG9wXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUgKiAyIC8gMywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRyYXdUYXJnZXRJY29uKGN0eCwgY2FtZXJhLCB0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgIH1cclxuICAgIHN1cHBvcnRzR3JpZCgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIOWcsOeLseeBq+eCruS4jeaUr+aMgee9keagvOaYvuekulxyXG4gICAgfVxyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==