import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';

export function createLaserGraphic(startTarget,endTarget){
    //create container
    const laserContainer = new BABYLON.TransformNode("laserContainer", scene);

    let startPosition = new BABYLON.Vector3(startTarget.position.x, startTarget.position.y+0.2, startTarget.position.z);
    let endPosition = new BABYLON.Vector3(endTarget.position.x, endTarget.position.y+0.2, endTarget.position.z);

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

    //create billboard glow at startPoint
    const glow = BABYLON.MeshBuilder.CreatePlane("glow", {height:0.2,width:0.2}, scene);
    glow.position = startPosition;
    glow.isPickable = false;
    glow.isVisible = true;
    glow.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    const glowMaterial = new BABYLON.PBRMaterial("glowMaterial", scene);
    glowMaterial.emissiveColor = new BABYLON.Color3(.4, .65, .65);
    glowMaterial.disableLighting = true;
    glowMaterial.albedoTexture = new BABYLON.Texture("textures/laserTextureGlow.png", scene);
    glowMaterial.albedoTexture.hasAlpha = true;
    glowMaterial.useAlphaFromAlbedoTexture = true;
    glowMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    glow.material = glowMaterial;

    //offset billboard position towards midpoint
    const glowPosition = BABYLON.Vector3.Lerp(startPosition, midpoint, 0.07);
    glow.position = glowPosition;

    //create glow animation
    const glowAnimation = new BABYLON.Animation("glowAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    glowAnimation.setKeys([
        { frame: 0, value: 0 },
        { frame: 20, value: 0},
        { frame: 40, value: 0.8 },
    ]);

    glow.glowAnimation = scene.beginDirectAnimation(glow, [glowAnimation], 0, 40, false);
        
    //create material
    const laserMaterial = new BABYLON.PBRMaterial("laserMaterial", scene);
    laserMaterial.emissiveColor = new BABYLON.Color3(.7, 1, 1);
    laserMaterial.disableLighting = true;
    laserMaterial.albedoTexture = new BABYLON.Texture("textures/laserTexture.png", scene);
    laserMaterial.albedoTexture.hasAlpha = true;
    laserMaterial.alpha = 0;
    laserMaterial.useAlphaFromAlbedoTexture = true;
    laserMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
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
        { frame: 20, value: 0},
        { frame: 40, value: 0.8 },
    ]);
    
    laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [rotCycle], 0, 20, true);
    laserGraphic.laserAnimation = scene.beginDirectAnimation(laserGraphic, [fadeIn], 0, 40, false);

    //add to container
    laserGraphic.parent = laserContainer;
    glow.parent = laserContainer;

    startTarget.laserGraphic = laserContainer;
}