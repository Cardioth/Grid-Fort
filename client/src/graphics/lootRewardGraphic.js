import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { getImage } from './loadImages.js';
import { createCardGraphic } from './createCardGraphic.js';
import { createCardFromData } from '../managers/createCardFromData.js';

export function createLootReward(reward, position){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    if(reward.type === "credits"){
        // Circle Backing
        const circleBacking = new GUI.Image("circleBacking", getImage("circleBacking.png"));
        circleBacking.width = "200px";
        circleBacking.height = "200px";
        circleBacking.scaleX = 0.8;
        circleBacking.scaleY = 0.8;
        container.addControl(circleBacking);

        // Create Credits Icon
        const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
        creditsIcon.width = "103px";
        creditsIcon.height = "69px";
        creditsIcon.top = -10;
        creditsIcon.scaleX = 1;
        creditsIcon.scaleY = 1;
        container.addControl(creditsIcon);

        // Create Credits Text
        const creditsText = new GUI.TextBlock();
        creditsText.width = "100px";
        creditsText.height = "40px";
        creditsText.text = reward.amount + "uC";
        creditsText.color = "#57CDFF";
        creditsText.fontSize = 25;
        creditsText.fontFamily = "GemunuLibre-Medium";
        creditsText.top = 45;
        container.addControl(creditsText);
    }

    if(reward.type === "card"){
        const card = createCardFromData(reward.card);
        card.currentPosition = {x: 0, y: 0};
        card.rotation = 0;
        card.zIndex = 5;
        const cardGraphic = createCardGraphic(card);
        cardGraphic.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        container.addControl(cardGraphic);
    }

    container.zIndex = 1000;
    container.width = "300px";
    container.height = "300px";
    container.scaleX = 0;
    container.scaleY = 0;
    container.top = -position.y * 95;
    container.left = position.z * 95;

    //Container animation zoom in scale
    const containerAnimationScaleX = new BABYLON.Animation("containerAnimation", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keysX = [
        { frame: 0, value: 0 },
        { frame: 30, value: 1 },
    ];
    containerAnimationScaleX.setKeys(keysX);

    const containerAnimationScaleY = new BABYLON.Animation("containerAnimation", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keysY = [
        { frame: 0, value: 0 },
        { frame: 30, value: 1 },
    ];
    containerAnimationScaleY.setKeys(keysY);

    container.animations = [];
    container.animations.push(containerAnimationScaleX);
    container.animations.push(containerAnimationScaleY);

    //Add easing
    let easingFunction = new BABYLON.CircleEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    containerAnimationScaleX.setEasingFunction(easingFunction);
    containerAnimationScaleY.setEasingFunction(easingFunction);

    GUIscene.beginAnimation(container, 0, 30, false, 1);
    GUITexture.addControl(container);

}