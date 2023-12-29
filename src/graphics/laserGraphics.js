import * as BABYLON from '@babylonjs/core';

function createLaserGraphic(start,end){
    const laserGraphic = new BABYLON.MeshBuilder.CreateLines("laserGraphic", {points: [start,end]}, scene);
    laserGraphic.color = new BABYLON.Color3(1,0,0);
    laserGraphic.alpha = 0.5;
    laserGraphic.isPickable = false;
    laserGraphic.isVisible = false;
    return laserGraphic;
}