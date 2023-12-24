import { boostedCellGraphic } from "./sceneInitialization";
import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';

// createBoosterCellGraphic
export function createBoosterCellGraphic(cell){
    const clone = boostedCellGraphic.clone();
    clone.position.x = (cell.x-8)/4;
    clone.position.y = -(cell.y-8)/4;
    cell.boosterGraphic = clone;
    clone.cell = cell;
    clone.setEnabled(true);
    clone.boosterIcon = addBoosterCellIcon(clone);
}

export function removeBoosterCellGraphicsByCell(cell){
    cell.boosterGraphic.dispose();
    cell.boosterGraphic.boosterIcon.dispose();
    cell.boosterGraphic = undefined;
}

function addBoosterCellIcon(mesh){
    const cellIcon = new GUI.Image("boostSymbol", "boostSymbol.png");
    cellIcon.width = "32px";
    cellIcon.height = "32px";

    GUITexture.addControl(cellIcon);
    cellIcon.linkWithMesh(mesh);

    //Add animation to booster icon
    const animation = new BABYLON.Animation("boostAnimation", "linkOffsetY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_YOYO);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 30, value: -10 },
    ]);
    cellIcon.animations = [];
    cellIcon.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(ease);
    GUIscene.beginDirectAnimation(cellIcon, [cellIcon.animations[0]], 0, 120, true, 1);


    return cellIcon;
}