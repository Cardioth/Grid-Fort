import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';

export function createLaserGraphic(startTarget,endTarget){
    let startPosition = new BABYLON.Vector3(startTarget.position.x, startTarget.position.y+0.2, startTarget.position.z);
    let endPosition = new BABYLON.Vector3(endTarget.position.x, endTarget.position.y+0.2, endTarget.position.z);

    if(startTarget.turret){
        startTarget.turret.getChildren()[0].computeWorldMatrix(true);
        const startPositionY = startTarget.turret.getChildren()[0].getBoundingInfo().boundingBox.centerWorld.y;
        startPosition = new BABYLON.Vector3(startTarget.position.x, startPositionY, startTarget.position.z);
    }

    //calculate midpoint and distance
    const midpoint = BABYLON.Vector3.Center(startPosition, endPosition);
    const distance = BABYLON.Vector3.Distance(startPosition, endPosition);

    //create box
    const laserGraphic = BABYLON.MeshBuilder.CreateBox("laserGraphic", {height:0.03,width:0.01,depth:distance-0.35}, scene);
    laserGraphic.position = midpoint;
    laserGraphic.isPickable = false;
    laserGraphic.isVisible = true;

    laserGraphic.lookAt(endPosition);

    //create material
    const laserMaterial = new BABYLON.StandardMaterial("laserMaterial", scene);
    laserMaterial.emissiveColor = new BABYLON.Color3(.7, 1, 1);
    laserMaterial.disableLighting = true;
    laserMaterial.alpha = 0;
    laserGraphic.material = laserMaterial;

    //create animation
    const rotCycle = new BABYLON.Animation("laserAnimation", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    rotCycle.setKeys([
        { frame: 0, value: 0 },
        { frame: 20, value: Math.PI*2 },
    ]);

    const fadeIn = new BABYLON.Animation("laserAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    fadeIn.setKeys([
        { frame: 0, value: 0 },
        { frame: 30, value: 1 },
    ]);

    var nextAnimation = function() {
        laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [rotCycle], 0, 20, true);
    }

    laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [fadeIn], 0, 30, false, 1, nextAnimation);

    startTarget.laserGraphic = laserGraphic;
}