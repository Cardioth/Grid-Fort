import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { fadeTexture, fadeScene} from "../graphics/sceneInitialization";

export function fadeToBlack(functionToCall) {
    //Fade to black animation
    const fadeScreen = new GUI.Rectangle();
    fadeScreen.width = "100%";
    fadeScreen.height = "100%";
    fadeScreen.thickness = 0;
    fadeScreen.background = "black";
    fadeScreen.alpha = 0;
    fadeScreen.zIndex = 10000;
    fadeTexture.addControl(fadeScreen);

    const animation = new BABYLON.Animation("fade", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 1 }
    ]);
    fadeScreen.animations = [];
    fadeScreen.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(ease);
    fadeScene.beginDirectAnimation(fadeScreen, fadeScreen.animations, 0, 10, false, 1, () => {
        functionToCall();
        fadeFromBlack();
        fadeScreen.dispose();
    });
}

export function fadeFromBlack() {
    //Fade from black animation
    const fadeScreen = new GUI.Rectangle();
    fadeScreen.width = "100%";
    fadeScreen.height = "100%";
    fadeScreen.thickness = 0;
    fadeScreen.background = "black";
    fadeScreen.alpha = 1;
    fadeScreen.zIndex = 10000;
    fadeTexture.addControl(fadeScreen);

    const animation = new BABYLON.Animation("fade", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 1 },
        { frame: 3, value: 1 },
        { frame: 10, value: 0 }
    ]);
    fadeScreen.animations = [];
    fadeScreen.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(ease);  
    fadeScene.beginDirectAnimation(fadeScreen, [fadeScreen.animations[0]], 0, 10, false, 1, () => {
        fadeScreen.dispose();
    });
}