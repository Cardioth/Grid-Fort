import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUIscene } from '../../graphics/sceneInitialization.js';
import { getImage } from "../../graphics/loadImages.js";
import { load } from "webfontloader";

export function createLoadingIconScreen(message) {
    const container = new GUI.Rectangle();
    container.thickness = 0;
    
    // Create Dark Screen
    const darkScreen = new GUI.Rectangle();
    darkScreen.width = "100%";
    darkScreen.height = "100%";
    darkScreen.thickness = 0;
    darkScreen.background = "black";
    darkScreen.alpha = 0.7;
    container.addControl(darkScreen);

    // Create Loading Text
    const loadingText = new GUI.TextBlock();
    loadingText.text = message;
    loadingText.color = "white";
    loadingText.fontSize = 30;
    loadingText.fontFamily = "GemunuLibre-Bold";
    loadingText.top = 70;
    loadingText.left = 0;
    container.addControl(loadingText);

    // Create Loading Icon
    const loadingIconFront = new GUI.Image("loadingIcon1", getImage("loadIcon1.png"));
    loadingIconFront.width = "100px";
    loadingIconFront.height = "100px";
    loadingIconFront.scaleX = 0.7;
    loadingIconFront.scaleY = 0.7;

    const loadingIconBack = new GUI.Image("loadingIcon2", getImage("loadIcon2.png"));
    loadingIconBack.width = "100px";
    loadingIconBack.height = "100px";
    loadingIconBack.scaleX = 0.7;
    loadingIconBack.scaleY = 0.7;

    container.addControl(loadingIconBack);
    container.addControl(loadingIconFront);

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

    //Animate container fade in
    const animation = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    animation.setKeys(keys);
    container.animations = [];
    container.animations.push(animation);
    GUIscene.beginAnimation(container, 0, 10, false, 1);

    return container;

}
