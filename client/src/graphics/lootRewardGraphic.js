import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { getImage } from './loadImages.js';

export function createLootReward(lootLevel, position){
    const reward = calculateRewards(lootLevel);

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


    container.zIndex = 1000;
    container.width = "200px";
    container.height = "200px";
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

//TODO: Move to server side
function calculateRewards(lootLevel){
    //const rewardType = Math.floor(Math.random() * 2)> 1? "credits" : "cards"; 
    const rewardType = "credits";

    if(rewardType === "credits"){
        const baseReward = (lootLevel*25);
        const bonusReward = Math.floor(Math.random() * 4) *25;
        const credits = baseReward + bonusReward;
        const reward = {
            type: "credits",
            amount: credits
        }
        return reward;
    }

    if(rewardType === "cards"){
        const reward = {
            type: "card",
            card: getCardWithBonuses(lootLevel) //TODO: Add this function
        }
        return reward;
    }
}