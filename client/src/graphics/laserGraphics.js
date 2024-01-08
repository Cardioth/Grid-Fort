import * as BABYLON from '@babylonjs/core';
import { scene, laserMaterialPool } from './sceneInitialization';
import { getMaterialFromMaterialAtlas } from '../utilities/utils';

export function createLaserGraphic(startTarget,endTarget){
    //create container
    const laserContainer = new BABYLON.TransformNode("laserContainer", scene);

    let startPosition = new BABYLON.Vector3(startTarget.position.x, startTarget.position.y+0.2, startTarget.position.z);
    let endPosition = new BABYLON.Vector3(endTarget.x, endTarget.y+0.2, endTarget.z);

    if(startTarget.turret){
        startTarget.turret.getChildren()[0].computeWorldMatrix(true);
        const startPositionY = startTarget.turret.getChildren()[0].getBoundingInfo().boundingBox.centerWorld.y;
        const startPositionX = startTarget.turret.getChildren()[0].getAbsolutePosition().x;
        const startPositionZ = startTarget.turret.getChildren()[0].getAbsolutePosition().z;
        startPosition = new BABYLON.Vector3(startPositionX, startPositionY, startPositionZ);
    }

    //calculate midpoint and distance
    const midpoint = BABYLON.Vector3.Center(startPosition, endPosition);
    const distance = BABYLON.Vector3.Distance(startPosition, endPosition);

    //create box
    const laserGraphic = BABYLON.MeshBuilder.CreateBox("laserGraphic", {height:0.03,width:0.015,depth:distance-0.25}, scene);
    laserGraphic.position = midpoint;
    laserGraphic.isPickable = false;
    laserGraphic.isVisible = true;

    laserGraphic.lookAt(endPosition);
       
    //create material
    laserGraphic.material = laserMaterialPool.pop();

    //create animation
    const rotCycle = new BABYLON.Animation("laserAnimation", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    rotCycle.setKeys([
        { frame: 0, value: 0 },
        { frame: 20, value: Math.PI*2 },
    ]);

    const fadeIn = new BABYLON.Animation("laserAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    fadeIn.setKeys([
        { frame: 0, value: 0 },
        { frame: 20, value: 0},
        { frame: 40, value: 0.8 },
    ]);
    
    laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [fadeIn], 0, 40, true);    
    laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [rotCycle], 0, 20, true);

    //add to container
    laserGraphic.parent = laserContainer;

    //create billboard glow at startPoint
    const glow = createLaserGlow(startPosition, midpoint);
    glow.parent = laserContainer;

    startTarget.laserGraphic = laserContainer;
}

function createLaserGlow(startPosition, midpoint) {
    const glow = BABYLON.MeshBuilder.CreatePlane("glow", { height: 0.2, width: 0.2 }, scene);
    glow.position = startPosition;
    glow.isPickable = false;
    glow.isVisible = true;
    glow.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    //create material
    glow.material = getMaterialFromMaterialAtlas("glowMaterial");

    //offset billboard position towards midpoint
    const glowPosition = BABYLON.Vector3.Lerp(startPosition, midpoint, 0.07);
    glow.position = glowPosition;

    return glow;
}

export function fadeOutLaserAnimation(mesh, speed){
    const animation = new BABYLON.Animation("fadeOut", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 1 },
        { frame: speed, value: 0 }
    ]);

    mesh.material.alpha = 1;
    mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
    animation.setEasingFunction(ease);

    mesh.material.animations = [];
    mesh.material.animations.push(animation);

    scene.beginDirectAnimation(mesh.material, mesh.material.animations, 0, speed, false, 1, function(){
        if(mesh.material.name === "laserMaterial"){
            mesh.material.alpha = 1;
            laserMaterialPool.push(mesh.material);
        }
        mesh.dispose();
    });
}