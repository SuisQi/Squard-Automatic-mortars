import { mat4 } from 'gl-matrix';
import { getWorldLocation, moveWorldLocation, changeZoom } from '../camera/camera';
const assertEq = (a:any , b:any) => {
  console.assert(a == b, "not equal: ", a, b)
} 


export const runTests = () => {
  (() => {
    // test getWorldLocation
    let  testCamera = {
      transform: mat4.create()
    }
    let testLoc = getWorldLocation(testCamera);
    [0, 1, 2].map(i => assertEq(testLoc[i], 0))
    //
    mat4.translate(testCamera.transform, testCamera.transform, [-100, -100, 0])
    testLoc = getWorldLocation(testCamera);
    [0, 1].map(i => assertEq(testLoc[i], 100))
    //
    mat4.scale(testCamera.transform, testCamera.transform, [2, 2, 1])
    testLoc = getWorldLocation(testCamera);
    // scaling != zooming.
    [0, 1].map(i => assertEq(testLoc[i], 50))
  
  })();
  (() => {
    let camera = {
      transform: mat4.create()
    }
    let testLoc = getWorldLocation(camera);
    [0, 1, 2].map(i => assertEq(testLoc[i], 0))
    //
    mat4.translate(camera.transform, camera.transform, [-100, -100, 0])
    testLoc = getWorldLocation(camera);
    [0, 1].map(i => assertEq(testLoc[i], 100))
    //
    let newCam = changeZoom(camera, 2, [10, 10, 0]);
    testLoc = getWorldLocation(newCam);
    [0, 1].map(i => assertEq(testLoc[i], 105))


    let newCam2 = changeZoom(camera, 3.5, [10, 10, 0]);
    testLoc = getWorldLocation(newCam2);
    [0, 1].map(i => assertEq(testLoc[i], 100 + (1-1/3.5) * 10))

  })();
}