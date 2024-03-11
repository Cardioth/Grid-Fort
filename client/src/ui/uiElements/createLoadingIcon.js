import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUIscene } from '../../graphics/sceneInitialization.js';
import { getImage } from "../../graphics/loadImages.js";

export function createLoadingIcon() {
    const iconContainer = new GUI.Rectangle();
    iconContainer.thickness = 0;
    iconContainer.width = "100px";
    iconContainer.height = "100px";

    const loadingIconFront = new GUI.Image("loadingIcon1", getImage("loadIcon1.png"));
    loadingIconFront.width = "100px";
    loadingIconFront.height = "100px";

    const loadingIconBack = new GUI.Image("loadingIcon2", getImage("loadIcon2.png"));
    loadingIconBack.width = "100px";
    loadingIconBack.height = "100px";

    iconContainer.addControl(loadingIconBack);
    iconContainer.addControl(loadingIconFront);

    //Make them spin!
    const animationFront = new BABYLON.Animation("spin", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keysFront = [
        { frame: 0, value: 0 },
        { frame: 50, value: Math.PI * 2 }
    ];
    animationFront.setKeys(keysFront);
    const easingFunction = new BABYLON.SineEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animationFront.setEasingFunction(easingFunction);
    loadingIconFront.animations = [];
    loadingIconFront.animations.push(animationFront);
    GUIscene.beginDirectAnimation(loadingIconFront, [animationFront], 0, 50, true);

    const animationBack = new BABYLON.Animation("spin", "rotation2", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keysBack = [
        { frame: 0, value: 0 },
        { frame: 20, value: -Math.PI * 2 }
    ];
    animationBack.setKeys(keysBack);
    loadingIconBack.animations = [];
    loadingIconBack.animations.push(animationBack);
    GUIscene.beginDirectAnimation(loadingIconBack, [animationBack], 0, 20, true);



    return iconContainer;

}
