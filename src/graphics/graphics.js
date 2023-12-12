import { setOrthoSize } from "./initScene.js";

let zoomTarget = 1;
let zoom = 1;

export function setZoomTarget(size){
    zoomTarget = size;
}

// Gets called every frame
export function updateGraphics(){
    zoom += (zoomTarget - zoom) * 0.05;
    setOrthoSize(zoom);
}    