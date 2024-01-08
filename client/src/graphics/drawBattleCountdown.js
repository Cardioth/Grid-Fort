import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from './sceneInitialization.js';
import { GUIscene } from "./sceneInitialization.js";
import { getImage } from "./loadImages.js";

export function drawBattleCountdown(countdownNumber){

    let countDownNumberGraphic;
    //Countdown Number
    if(countdownNumber === 3){
        countDownNumberGraphic = new GUI.Image("but", getImage("countdown_three.png"));
    } else if(countdownNumber === 2){
        countDownNumberGraphic = new GUI.Image("but", getImage("countdown_two.png"));
    } else if(countdownNumber === 1){
        countDownNumberGraphic = new GUI.Image("but", getImage("countdown_one.png"));
    }
    if(countdownNumber > 0){

        //Background
        let countDownNumberBackground = new GUI.Image("but", getImage("countdown_background.png"));
        countDownNumberBackground.width = "865px";
        countDownNumberBackground.height = "181px";
        countDownNumberBackground.scaleX = 0.8;
        countDownNumberBackground.scaleY = 0.8;
        countDownNumberBackground.zIndex = 120;
        GUITexture.addControl(countDownNumberBackground);

        const animationBackgroundAlpha = new BABYLON.Animation("backgroundAlpha", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animationBackgroundAlpha.setKeys([
            {frame:0, value:0.5},
            {frame:2, value:1},
            {frame:30, value:0}
        ]);
        countDownNumberBackground.animations = [];
        countDownNumberBackground.animations.push(animationBackgroundAlpha);

        const backgroundEasingFunction = new BABYLON.CubicEase();
        backgroundEasingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animationBackgroundAlpha.setEasingFunction(backgroundEasingFunction);

        GUIscene.beginDirectAnimation(countDownNumberBackground, countDownNumberBackground.animations, 0, 30, false, 1, function(){
            countDownNumberBackground.dispose();
        });

        countDownNumberGraphic.width = "150px";
        countDownNumberGraphic.height = "181px";
        countDownNumberGraphic.zIndex = 121;

        GUITexture.addControl(countDownNumberGraphic);

        const animationAlpha = new BABYLON.Animation("alphaAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animationAlpha.setKeys([
            {frame:0, value:1},
            {frame:10, value:1},
            {frame:30, value:0}
        ]);
        countDownNumberGraphic.animations = [];
        countDownNumberGraphic.animations.push(animationAlpha);

        //Animate Scale
        const animationScaleX = new BABYLON.Animation("scaleAnimation", "scaleX", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animationScaleX.setKeys([
            {frame:0, value:0.7},
            {frame:1, value:.9},
            {frame:5, value:.8},
            {frame:30, value:.8}
        ]);
        countDownNumberGraphic.animations.push(animationScaleX);

        const animationScaleY = new BABYLON.Animation("scaleAnimation", "scaleY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animationScaleY.setKeys([
            {frame:0, value:0.7},
            {frame:1, value:.9},
            {frame:5, value:.8},
            {frame:30, value:.8}
        ]);
        countDownNumberGraphic.animations.push(animationScaleY);
        //add easing

        const easingFunction = new BABYLON.CubicEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        countDownNumberGraphic.animations.forEach(animation => {
            animation.setEasingFunction(easingFunction);
        });

        GUIscene.beginDirectAnimation(countDownNumberGraphic, countDownNumberGraphic.animations, 0, 30, false, 1, function(){
            countDownNumberGraphic.dispose();
        });
    }
}