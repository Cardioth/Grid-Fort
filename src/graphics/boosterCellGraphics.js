import { boostedCellGraphic } from "./sceneInitialization";
import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene, scene } from '../graphics/sceneInitialization.js';

// createBoosterCellGraphic
export function createBoosterCellGraphic(cell){
    const clone = boostedCellGraphic.clone();
    clone.position.x = (cell.x-8)/4;
    clone.position.y = -(cell.y-8)/4;
    cell.boosterGraphic = clone;
    clone.material.alpha = 0.35;
    clone.cell = cell;
    clone.setEnabled(true);
}

export function removeBoosterCellGraphicsByCell(cell){
    if(cell.boosterGraphic){
        cell.boosterGraphic.dispose();
        cell.boosterGraphic = undefined;
    }
}

function addBoosterCellIcon(mesh){
    const cellIcon = new GUI.Image("boostSymbol", "boostSymbol.png");
    cellIcon.width = "32px";
    cellIcon.height = "32px";
    cellIcon.scaleX = 0.5;
    cellIcon.scaleY = 0.5;

    GUITexture.addControl(cellIcon);
    cellIcon.linkWithMesh(mesh);

    // Define the offsetY animation
    const offsetYAnimation = new BABYLON.Animation("offsetYAnimation", "linkOffsetY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_YOYO);
    offsetYAnimation.setKeys([
        { frame: 0, value: 0 },
        { frame: 60, value: -6 },
    ]);

    // Define the alpha animation
    const alphaAnimation = new BABYLON.Animation("alphaAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_YOYO);
    alphaAnimation.setKeys([
        { frame: 0, value: .2 },
        { frame: 30, value: 1 },
    ]);

    // Apply easing function to both animations
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);
    offsetYAnimation.setEasingFunction(ease);

    // Start both animations simultaneously
    GUIscene.beginDirectAnimation(cellIcon, [alphaAnimation], 0, 60, true);

    return cellIcon;
}

export function boosterRisingAnimation(cell){
    const locationMesh = new BABYLON.Mesh("locationMesh", scene);
    locationMesh.position.x = -(cell.x-8)/4;
    locationMesh.position.z = (cell.y-8)/4;
    locationMesh.setEnabled(false);

    const cellIcon = new GUI.Image("boostSymbol", "boostSymbol.png");
    cellIcon.width = "32px";
    cellIcon.height = "32px";
    cellIcon.scaleX = 0.9;
    cellIcon.scaleY = 0.9;

    GUITexture.addControl(cellIcon);
    cellIcon.linkWithMesh(locationMesh);

    // Define the offsetY animation
    const offsetYAnimation = new BABYLON.Animation("offsetYAnimation", "linkOffsetY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    offsetYAnimation.setKeys([
        { frame: 0, value: 0 },
        { frame: 30, value: -25 },
    ]);

    // Define the alpha animation
    const alphaAnimation = new BABYLON.Animation("alphaAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    alphaAnimation.setKeys([
        { frame: 0, value: 1 },
        { frame: 30, value: 0 },
    ]);

    // Apply easing function to both animations
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    offsetYAnimation.setEasingFunction(ease);

    // Start both animations simultaneously
    GUIscene.beginDirectAnimation(cellIcon, [alphaAnimation,offsetYAnimation], 0, 60, true, 1, () => {
        locationMesh.dispose();
        cellIcon.dispose();
    });
}