"use strict";
(self["webpackChunksquadstrat"] = self["webpackChunksquadstrat"] || []).push([["src_render_weaponRenderers_BM21WeaponRenderer_ts"],{

/***/ "./src/render/weaponRenderers/BM21WeaponRenderer.ts":
/*!**********************************************************!*\
  !*** ./src/render/weaponRenderers/BM21WeaponRenderer.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BM21WeaponRenderer: () => (/* binding */ BM21WeaponRenderer),
/* harmony export */   BM21_DEVIATION: () => (/* binding */ BM21_DEVIATION),
/* harmony export */   BM21_EXPLOSIVE_BASE_DAMAGE: () => (/* binding */ BM21_EXPLOSIVE_BASE_DAMAGE),
/* harmony export */   BM21_EXPLOSIVE_FALLOFF: () => (/* binding */ BM21_EXPLOSIVE_FALLOFF),
/* harmony export */   BM21_EXPLOSIVE_INNER_RADIUS: () => (/* binding */ BM21_EXPLOSIVE_INNER_RADIUS),
/* harmony export */   BM21_EXPLOSIVE_OUTER_RADIUS: () => (/* binding */ BM21_EXPLOSIVE_OUTER_RADIUS),
/* harmony export */   BM21_GRAVITY: () => (/* binding */ BM21_GRAVITY),
/* harmony export */   BM21_HIT_DAMAGE: () => (/* binding */ BM21_HIT_DAMAGE),
/* harmony export */   BM21_MIN_FLIGHT_TIME: () => (/* binding */ BM21_MIN_FLIGHT_TIME),
/* harmony export */   BM21_MOA: () => (/* binding */ BM21_MOA),
/* harmony export */   BM21_REARM_TIME_PER_ROCKET: () => (/* binding */ BM21_REARM_TIME_PER_ROCKET),
/* harmony export */   BM21_VELOCITY: () => (/* binding */ BM21_VELOCITY),
/* harmony export */   GRAVITY: () => (/* binding */ GRAVITY),
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









// BM21火箭炮相关常量
const MAPSCALE = 0.01;
const GRAVITY = 980; // cm/s^2
// BM21火箭炮特有常量
const BM21_MOA = 200;
const BM21_DEVIATION = BM21_MOA / 60 * Math.PI / 180 / 2; // cone angle from center ~ "radius angle"
const BM21_VELOCITY = 20000; // cm/s
const BM21_GRAVITY = 2 * GRAVITY; // cm/s^2
const BM21_MIN_FLIGHT_TIME = 0.5; // s
// BM21火箭弹伤害参数
const BM21_HIT_DAMAGE = 800;
const BM21_EXPLOSIVE_BASE_DAMAGE = 140;
const BM21_EXPLOSIVE_INNER_RADIUS = 100; // cm
const BM21_EXPLOSIVE_OUTER_RADIUS = 3500; // cm
const BM21_EXPLOSIVE_FALLOFF = 1;
const BM21_REARM_TIME_PER_ROCKET = 3.8; // s
/**
 * BM21多管火箭炮武器渲染器
 * "喀秋莎"火箭炮系统，具有高弧和低弧两种射击模式
 */
class BM21WeaponRenderer extends _BaseWeaponRenderer__WEBPACK_IMPORTED_MODULE_0__.BaseWeaponRenderer {
    constructor() {
        super(...arguments);
        this.weaponType = "bm21";
    }
    // 实现基类抽象方法 - 武器常量
    getVelocity() { return BM21_VELOCITY; }
    getGravity() { return BM21_GRAVITY; }
    getDeviation() { return BM21_DEVIATION; }
    getMinRange() { return 0; } // BM21无最小射程限制
    getMaxRange() { return 50000; } // 估计最大射程
    get100DamageRange() { return BM21_EXPLOSIVE_INNER_RADIUS; }
    get25DamageRange() { return BM21_EXPLOSIVE_OUTER_RADIUS; }
    getFiringSolution(weaponTranslation, targetTranslation) {
        return (0,_world_projectilePhysics__WEBPACK_IMPORTED_MODULE_2__.getBM21FiringSolution)(weaponTranslation, targetTranslation);
    }
    drawSplash(ctx, lineWidthFactor) {
        // BM21火箭弹的爆炸范围由爆炸参数定义，这里可以根据需要添加显示
    }
    drawSpread(ctx, firingSolution, lineWidthFactor, withSplash, selected = false) {
        const { highArc, lowArc } = firingSolution;
        if (lowArc.angle && lowArc.time) {
            ctx.lineWidth = 1 * lineWidthFactor;
            ctx.strokeStyle = '#00f';
            (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.drawSpreadEllipse)(ctx, lowArc.weaponToTargetVec, lowArc.horizontalSpread, lowArc.closeSpread, lowArc.farSpread);
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
    getAnglePrecision(userSettings) {
        return 1;
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
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_canvas__WEBPACK_IMPORTED_MODULE_3__.canvasScaleTransform)(camera));
            const angleValue = this.getAngleValue(solution, userSettings);
            const angleLowValue = solution.lowArc.angle / Math.PI * 180;
            (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.applyTransform)(ctx, (0,_world_transformations__WEBPACK_IMPORTED_MODULE_4__.newTranslation)(10, activeWeaponIndex * lineHeight, 0));
            if (userSettings.targetCompactMode) {
                let angleText = "-----";
                const precision = this.getAnglePrecision(userSettings);
                if (solution.lowArc.angle && angleLowValue >= 1000) {
                    angleText = angleLowValue.toFixed(precision).toString().substr(1, 4 + precision);
                }
                else if (solution.lowArc.angle) {
                    angleText = angleLowValue.toFixed(precision).toString().substr(0, 3 + precision);
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
        return false; // BM21火箭炮不支持网格显示
    }
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3JlbmRlcl93ZWFwb25SZW5kZXJlcnNfQk0yMVdlYXBvblJlbmRlcmVyX3RzLmFwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUF1QztBQUNtQjtBQUNKO0FBQ2dCO0FBQ1c7QUFDcEI7QUFDZ0I7QUFDckI7QUFDSjtBQUNwRDtBQUNPO0FBQ0EscUJBQXFCO0FBQzVCO0FBQ087QUFDQSwwREFBMEQ7QUFDMUQsNkJBQTZCO0FBQzdCLGtDQUFrQztBQUNsQyxrQ0FBa0M7QUFDekM7QUFDTztBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDLDBDQUEwQztBQUMxQztBQUNBLHdDQUF3QztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNPLGlDQUFpQyxtRUFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQixtQkFBbUI7QUFDbkIscUJBQXFCO0FBQ3JCLG9CQUFvQixZQUFZO0FBQ2hDLG9CQUFvQixnQkFBZ0I7QUFDcEMsMEJBQTBCO0FBQzFCLHlCQUF5QjtBQUN6QjtBQUNBLGVBQWUsK0VBQXFCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isa0JBQWtCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBLFlBQVksMERBQWlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixrQkFBa0I7QUFDbEM7QUFDQSxrQ0FBa0MsdUJBQXVCLElBQUkseUJBQXlCO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsaURBQWUsQ0FBQyw2Q0FBVyxJQUFJLDZEQUFvQjtBQUNwRixRQUFRLGlFQUFtQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxzQ0FBc0Msc0VBQWM7QUFDcEQsaUNBQWlDLCtEQUFTO0FBQzFDO0FBQ0Esc0NBQXNDLHNFQUFjO0FBQ3BELGlDQUFpQywrREFBUztBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0VBQWM7QUFDMUI7QUFDQTtBQUNBO0FBQ0EsWUFBWSxzRUFBYyxNQUFNLDZEQUFvQjtBQUNwRDtBQUNBO0FBQ0EsWUFBWSxzRUFBYyxNQUFNLHNFQUFjO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixvREFBVywyQkFBMkIsZ0RBQVEsRUFBRSxrREFBVTtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isb0RBQVcsMkJBQTJCLGdEQUFRLEVBQUUsa0RBQVU7QUFDMUU7QUFDQSx1QkFBdUIsZ0NBQWdDO0FBQ3ZELHVCQUF1QiwrREFBK0QsTUFBTSw2REFBNkQ7QUFDekoscURBQXFELDhDQUE4QztBQUNuRztBQUNBO0FBQ0EsZ0JBQWdCLG9EQUFXLHlCQUF5QixnREFBUSxFQUFFLGtEQUFVO0FBQ3hFO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcXVhZHN0cmF0Ly4vc3JjL3JlbmRlci93ZWFwb25SZW5kZXJlcnMvQk0yMVdlYXBvblJlbmRlcmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHZlYzMsIG1hdDQgfSBmcm9tIFwiZ2wtbWF0cml4XCI7XHJcbmltcG9ydCB7IEJhc2VXZWFwb25SZW5kZXJlciB9IGZyb20gXCIuL0Jhc2VXZWFwb25SZW5kZXJlclwiO1xyXG5pbXBvcnQgeyBnZXRIZWlnaHQgfSBmcm9tIFwiLi4vLi4vaGVpZ2h0bWFwL2hlaWdodG1hcFwiO1xyXG5pbXBvcnQgeyBnZXRCTTIxRmlyaW5nU29sdXRpb24gfSBmcm9tIFwiLi4vLi4vd29ybGQvcHJvamVjdGlsZVBoeXNpY3NcIjtcclxuaW1wb3J0IHsgY2FudmFzU2NhbGVUcmFuc2Zvcm0sIGRyYXdTcHJlYWRFbGxpcHNlLCBvdXRsaW5lVGV4dCB9IGZyb20gXCIuLi9jYW52YXNcIjtcclxuaW1wb3J0IHsgYXBwbHlUcmFuc2Zvcm0gfSBmcm9tIFwiLi4vLi4vd29ybGQvdHJhbnNmb3JtYXRpb25zXCI7XHJcbmltcG9ydCB7IGdldFRyYW5zbGF0aW9uLCBuZXdUcmFuc2xhdGlvbiB9IGZyb20gXCIuLi8uLi93b3JsZC90cmFuc2Zvcm1hdGlvbnNcIjtcclxuaW1wb3J0IHsgY2Fub25pY2FsRW50aXR5U29ydCB9IGZyb20gXCIuLi8uLi93b3JsZC93b3JsZFwiO1xyXG5pbXBvcnQgeyBURVhUX1JFRCwgVEVYVF9XSElURSB9IGZyb20gXCIuLi9jb25zdGFudHNcIjtcclxuLy8gQk0yMeeBq+eureeCruebuOWFs+W4uOmHj1xyXG5leHBvcnQgY29uc3QgTUFQU0NBTEUgPSAwLjAxO1xyXG5leHBvcnQgY29uc3QgR1JBVklUWSA9IDk4MDsgLy8gY20vc14yXHJcbi8vIEJNMjHngavnrq3ngq7nibnmnInluLjph49cclxuZXhwb3J0IGNvbnN0IEJNMjFfTU9BID0gMjAwO1xyXG5leHBvcnQgY29uc3QgQk0yMV9ERVZJQVRJT04gPSBCTTIxX01PQSAvIDYwICogTWF0aC5QSSAvIDE4MCAvIDI7IC8vIGNvbmUgYW5nbGUgZnJvbSBjZW50ZXIgfiBcInJhZGl1cyBhbmdsZVwiXHJcbmV4cG9ydCBjb25zdCBCTTIxX1ZFTE9DSVRZID0gMjAwMDA7IC8vIGNtL3NcclxuZXhwb3J0IGNvbnN0IEJNMjFfR1JBVklUWSA9IDIgKiBHUkFWSVRZOyAvLyBjbS9zXjJcclxuZXhwb3J0IGNvbnN0IEJNMjFfTUlOX0ZMSUdIVF9USU1FID0gMC41OyAvLyBzXHJcbi8vIEJNMjHngavnrq3lvLnkvKTlrrPlj4LmlbBcclxuZXhwb3J0IGNvbnN0IEJNMjFfSElUX0RBTUFHRSA9IDgwMDtcclxuZXhwb3J0IGNvbnN0IEJNMjFfRVhQTE9TSVZFX0JBU0VfREFNQUdFID0gMTQwO1xyXG5leHBvcnQgY29uc3QgQk0yMV9FWFBMT1NJVkVfSU5ORVJfUkFESVVTID0gMTAwOyAvLyBjbVxyXG5leHBvcnQgY29uc3QgQk0yMV9FWFBMT1NJVkVfT1VURVJfUkFESVVTID0gMzUwMDsgLy8gY21cclxuZXhwb3J0IGNvbnN0IEJNMjFfRVhQTE9TSVZFX0ZBTExPRkYgPSAxO1xyXG5leHBvcnQgY29uc3QgQk0yMV9SRUFSTV9USU1FX1BFUl9ST0NLRVQgPSAzLjg7IC8vIHNcclxuLyoqXHJcbiAqIEJNMjHlpJrnrqHngavnrq3ngq7mrablmajmuLLmn5PlmahcclxuICogXCLlloDnp4vojo5cIueBq+eureeCruezu+e7n++8jOWFt+aciemrmOW8p+WSjOS9juW8p+S4pOenjeWwhOWHu+aooeW8j1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJNMjFXZWFwb25SZW5kZXJlciBleHRlbmRzIEJhc2VXZWFwb25SZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMud2VhcG9uVHlwZSA9IFwiYm0yMVwiO1xyXG4gICAgfVxyXG4gICAgLy8g5a6e546w5Z+657G75oq96LGh5pa55rOVIC0g5q2m5Zmo5bi46YePXHJcbiAgICBnZXRWZWxvY2l0eSgpIHsgcmV0dXJuIEJNMjFfVkVMT0NJVFk7IH1cclxuICAgIGdldEdyYXZpdHkoKSB7IHJldHVybiBCTTIxX0dSQVZJVFk7IH1cclxuICAgIGdldERldmlhdGlvbigpIHsgcmV0dXJuIEJNMjFfREVWSUFUSU9OOyB9XHJcbiAgICBnZXRNaW5SYW5nZSgpIHsgcmV0dXJuIDA7IH0gLy8gQk0yMeaXoOacgOWwj+WwhOeoi+mZkOWItlxyXG4gICAgZ2V0TWF4UmFuZ2UoKSB7IHJldHVybiA1MDAwMDsgfSAvLyDkvLDorqHmnIDlpKflsITnqItcclxuICAgIGdldDEwMERhbWFnZVJhbmdlKCkgeyByZXR1cm4gQk0yMV9FWFBMT1NJVkVfSU5ORVJfUkFESVVTOyB9XHJcbiAgICBnZXQyNURhbWFnZVJhbmdlKCkgeyByZXR1cm4gQk0yMV9FWFBMT1NJVkVfT1VURVJfUkFESVVTOyB9XHJcbiAgICBnZXRGaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pIHtcclxuICAgICAgICByZXR1cm4gZ2V0Qk0yMUZpcmluZ1NvbHV0aW9uKHdlYXBvblRyYW5zbGF0aW9uLCB0YXJnZXRUcmFuc2xhdGlvbik7XHJcbiAgICB9XHJcbiAgICBkcmF3U3BsYXNoKGN0eCwgbGluZVdpZHRoRmFjdG9yKSB7XHJcbiAgICAgICAgLy8gQk0yMeeBq+eureW8ueeahOeIhueCuOiMg+WbtOeUseeIhueCuOWPguaVsOWumuS5ie+8jOi/memHjOWPr+S7peagueaNrumcgOimgea3u+WKoOaYvuekulxyXG4gICAgfVxyXG4gICAgZHJhd1NwcmVhZChjdHgsIGZpcmluZ1NvbHV0aW9uLCBsaW5lV2lkdGhGYWN0b3IsIHdpdGhTcGxhc2gsIHNlbGVjdGVkID0gZmFsc2UpIHtcclxuICAgICAgICBjb25zdCB7IGhpZ2hBcmMsIGxvd0FyYyB9ID0gZmlyaW5nU29sdXRpb247XHJcbiAgICAgICAgaWYgKGxvd0FyYy5hbmdsZSAmJiBsb3dBcmMudGltZSkge1xyXG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMSAqIGxpbmVXaWR0aEZhY3RvcjtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMGYnO1xyXG4gICAgICAgICAgICBkcmF3U3ByZWFkRWxsaXBzZShjdHgsIGxvd0FyYy53ZWFwb25Ub1RhcmdldFZlYywgbG93QXJjLmhvcml6b250YWxTcHJlYWQsIGxvd0FyYy5jbG9zZVNwcmVhZCwgbG93QXJjLmZhclNwcmVhZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVWYWx1ZShzb2x1dGlvbiwgdXNlclNldHRpbmdzKSB7XHJcbiAgICAgICAgcmV0dXJuIHNvbHV0aW9uLmhpZ2hBcmMuYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgfVxyXG4gICAgZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgeyBoaWdoQXJjLCBsb3dBcmMgfSA9IHNvbHV0aW9uO1xyXG4gICAgICAgIGNvbnN0IGFuZ2xlTG93VmFsdWUgPSBsb3dBcmMuYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgIHJldHVybiBoaWdoQXJjLmFuZ2xlID8gYCR7YW5nbGVWYWx1ZS50b0ZpeGVkKDEpfSB8ICR7YW5nbGVMb3dWYWx1ZS50b0ZpeGVkKDEpfWAgOiBcIi0tLS0tXCI7XHJcbiAgICB9XHJcbiAgICBnZXRBbmdsZVByZWNpc2lvbih1c2VyU2V0dGluZ3MpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIGRyYXdUYXJnZXQoY3R4LCBjYW1lcmEsIHVzZXJTZXR0aW5ncywgaGVpZ2h0bWFwLCB3ZWFwb25zLCB0YXJnZXQsIGRpcmRhdGFzLCB1c2VySWQpIHtcclxuICAgICAgICBjb25zdCBjYW52YXNTaXplRmFjdG9yID0gbWF0NC5nZXRTY2FsaW5nKHZlYzMuY3JlYXRlKCksIGNhbnZhc1NjYWxlVHJhbnNmb3JtKGNhbWVyYSkpWzBdO1xyXG4gICAgICAgIGNhbm9uaWNhbEVudGl0eVNvcnQod2VhcG9ucyk7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlV2VhcG9ucyA9IHdlYXBvbnMuZmlsdGVyKCh3KSA9PiB3LmlzQWN0aXZlKTtcclxuICAgICAgICBjb25zdCBhbGxXZWFwb25zSW5kZXggPSB7fTtcclxuICAgICAgICB3ZWFwb25zLmZvckVhY2goKHcsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh3LmlzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICBhbGxXZWFwb25zSW5kZXhbdy5lbnRpdHlJZF0gPSBpbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFjdGl2ZVdlYXBvbnMuZm9yRWFjaCgod2VhcG9uLCBhY3RpdmVXZWFwb25JbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB3ZWFwb25UcmFuc2xhdGlvbiA9IGdldFRyYW5zbGF0aW9uKHdlYXBvbi50cmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICBjb25zdCB3ZWFwb25IZWlnaHQgPSBnZXRIZWlnaHQoaGVpZ2h0bWFwLCB3ZWFwb25UcmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIHdlYXBvblRyYW5zbGF0aW9uWzJdID0gd2VhcG9uSGVpZ2h0ICsgd2VhcG9uLmhlaWdodE92ZXJHcm91bmQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRyYW5zbGF0aW9uID0gZ2V0VHJhbnNsYXRpb24odGFyZ2V0LnRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEhlaWdodCA9IGdldEhlaWdodChoZWlnaHRtYXAsIHRhcmdldFRyYW5zbGF0aW9uKTtcclxuICAgICAgICAgICAgdGFyZ2V0VHJhbnNsYXRpb25bMl0gPSB0YXJnZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHNvbHV0aW9uID0gdGhpcy5nZXRGaXJpbmdTb2x1dGlvbih3ZWFwb25UcmFuc2xhdGlvbiwgdGFyZ2V0VHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdXNlclNldHRpbmdzLmZvbnRTaXplICogKHVzZXJTZXR0aW5ncy50YXJnZXRDb21wYWN0TW9kZSA/IDEgOiAxLjcpO1xyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIHRhcmdldC50cmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICBpZiAodXNlclNldHRpbmdzLnRhcmdldFNwcmVhZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3U3ByZWFkKGN0eCwgc29sdXRpb24sIGNhbnZhc1NpemVGYWN0b3IsIHVzZXJTZXR0aW5ncy50YXJnZXRTcGxhc2gpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgY2FudmFzU2NhbGVUcmFuc2Zvcm0oY2FtZXJhKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlVmFsdWUgPSB0aGlzLmdldEFuZ2xlVmFsdWUoc29sdXRpb24sIHVzZXJTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlTG93VmFsdWUgPSBzb2x1dGlvbi5sb3dBcmMuYW5nbGUgLyBNYXRoLlBJICogMTgwO1xyXG4gICAgICAgICAgICBhcHBseVRyYW5zZm9ybShjdHgsIG5ld1RyYW5zbGF0aW9uKDEwLCBhY3RpdmVXZWFwb25JbmRleCAqIGxpbmVIZWlnaHQsIDApKTtcclxuICAgICAgICAgICAgaWYgKHVzZXJTZXR0aW5ncy50YXJnZXRDb21wYWN0TW9kZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IFwiLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByZWNpc2lvbiA9IHRoaXMuZ2V0QW5nbGVQcmVjaXNpb24odXNlclNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgIGlmIChzb2x1dGlvbi5sb3dBcmMuYW5nbGUgJiYgYW5nbGVMb3dWYWx1ZSA+PSAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGVUZXh0ID0gYW5nbGVMb3dWYWx1ZS50b0ZpeGVkKHByZWNpc2lvbikudG9TdHJpbmcoKS5zdWJzdHIoMSwgNCArIHByZWNpc2lvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzb2x1dGlvbi5sb3dBcmMuYW5nbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSBhbmdsZUxvd1ZhbHVlLnRvRml4ZWQocHJlY2lzaW9uKS50b1N0cmluZygpLnN1YnN0cigwLCAzICsgcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwibWlkZGxlXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFuZ2xlVGV4dCA9IHRoaXMuZ2V0QW5nbGVUZXh0KGFuZ2xlVmFsdWUsIHNvbHV0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVXZWFwb25zLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZVRleHQgPSAoYWxsV2VhcG9uc0luZGV4W3dlYXBvbi5lbnRpdHlJZF0gKyAxKS50b1N0cmluZygpICsgXCI6IFwiICsgYW5nbGVUZXh0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0bGluZVRleHQoY3R4LCBhbmdsZVRleHQsIFwiYm90dG9tXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tVGV4dENvbXBvbmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uaGlnaEFyYy5kaXIudG9GaXhlZCgxKX3CsGAsXHJcbiAgICAgICAgICAgICAgICAgICAgYCR7c29sdXRpb24uaGlnaEFyYy50aW1lID8gc29sdXRpb24uaGlnaEFyYy50aW1lLnRvRml4ZWQoMSkgOiBcIi1cIn1zIHwgJHtzb2x1dGlvbi5sb3dBcmMudGltZSA/IHNvbHV0aW9uLmxvd0FyYy50aW1lLnRvRml4ZWQoMSkgOiBcIi1cIn1zYCxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2V0dGluZ3MudGFyZ2V0RGlzdGFuY2UgPyBgJHsoc29sdXRpb24uaGlnaEFyYy5kaXN0ICogTUFQU0NBTEUpLnRvRml4ZWQoMCl9bWAgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvdHRvbVRleHQgPSBib3R0b21UZXh0Q29tcG9uZW50cy5qb2luKCcgJyk7XHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lVGV4dChjdHgsIGJvdHRvbVRleHQsIFwidG9wXCIsIFRFWFRfUkVELCBURVhUX1dISVRFLCB1c2VyU2V0dGluZ3MuZm9udFNpemUgKiAyIC8gMywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRyYXdUYXJnZXRJY29uKGN0eCwgY2FtZXJhLCB0YXJnZXQudHJhbnNmb3JtKTtcclxuICAgIH1cclxuICAgIHN1cHBvcnRzR3JpZCgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEJNMjHngavnrq3ngq7kuI3mlK/mjIHnvZHmoLzmmL7npLpcclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=