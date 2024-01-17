import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUI3Dscene, GUITexture, setOrthoSize } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { getImage } from "../graphics/loadImages.js";
import { enemyBoard, medals, playerBoard } from "../managers/gameSetup.js";
import { currentScene, setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { clearBoard } from "../utilities/utils.js";
import { createLootBoxes } from "../graphics/createLootBoxes.js";
import { createMedalExplosionParticleSystem } from "../graphics/particleEffects/createMedalExplosion.js";

export function createEndGameScreen(){
    //container
    const container = new GUI.Rectangle();
    container.width = "100%";
    container.height = "100%";
    container.thickness = 0;

    const endBattleDarkness = new GUI.Rectangle();
    endBattleDarkness.width = "100%";
    endBattleDarkness.height = "100%";
    endBattleDarkness.thickness = 0;
    endBattleDarkness.background = "black";
    endBattleDarkness.alpha = 0.7;
    endBattleDarkness.zIndex = 1;
    container.addControl(endBattleDarkness);

    //Medals Text
    const medalText = new GUI.TextBlock();
    medalText.text = "Medals: 0";
    medalText.color = "white";
    medalText.fontSize = 30;
    medalText.fontFamily = "GemunuLibre-Bold";
    medalText.zIndex = 4;
    container.addControl(medalText);

    //Continue Button
    const continueButton = new GUI.Image("continueButton", getImage("continueButton.png"));
    continueButton.width = "137px";
    continueButton.height = "33px";
    continueButton.top = "8%";
    continueButton.zIndex = 20;
    continueButton.alpha = 0;
    continueButton.onPointerClickObservable.add( () => {
        if(currentScene === "endBattle"){
            fadeToBlack(()=> {
                setCurrentScene("menu");
            });
        }
    });

    //Fade in continue button animation
    const continueButtonAnimation = new BABYLON.Animation("containerFadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    continueButtonAnimation.setKeys([
        { frame: 0, value: 0 },
        { frame: 40, value: 1 }
    ]);
    continueButton.animations = [];
    continueButton.animations.push(continueButtonAnimation);

    //Change cursor on hover
    continueButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    continueButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    GUIscene.continueButtonEndGame = continueButton;

    container.addControl(continueButton);

    //Medal Icons
    function getMedalImage(medalCount) {
        if (medalCount < 6) {
            return "medalIcon1.png"; // Level 1 Medal
        } else if (medalCount < 12) {
            return "medalIcon2.png"; // Level 2 Medal
        } else {
            return "medalIcon3.png"; // Level 3 Medal
        }
    }
    if(medals > 0){
        let medalTextCount = 0;
        for (let i = 0; i < medals; i++) {
            const level = Math.floor(i / 6);
            const medalImage = getMedalImage(level * 6);
            const medalIcon = new GUI.Image("medalIcon", getImage(medalImage));
            medalIcon.width = "60px";
            medalIcon.height = "45px";
            medalIcon.top = "-36px";
            medalIcon.left = 85 + (i % 6) * 63;
            medalIcon.zIndex = 10;
            container.addControl(medalIcon);

            medalIcon.animations = [];

            // Create swirl keyframe data
            const keyFrameData = createSwirlKeyFrameData(-36, 85 + (i % 6) * 63, i);
            const keyFrameDataX = keyFrameData[0];
            const keyFrameDataY = keyFrameData[1];

            // Medal icons swirl to the centre
            const medalAnimationX = new BABYLON.Animation("medalAnimation", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            medalAnimationX.setKeys(keyFrameDataX);

            const medalAnimationY = new BABYLON.Animation("medalAnimation", "left", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            medalAnimationY.setKeys(keyFrameDataY);
            
            medalIcon.animations.push(medalAnimationX);
            medalIcon.animations.push(medalAnimationY);

            GUIscene.beginDirectAnimation(medalIcon, [medalAnimationX, medalAnimationY], 0, 300, false, 1, function () {
                medalIcon.dispose();
                medalTextCount++;
                medalText.text = "Medals: " + medalTextCount;
                createMedalExplosionParticleSystem(new BABYLON.Vector3(0,0,0));

                if(medalTextCount >= medals){
                    createLootBoxes(GUI3Dscene, medals);
                }
            });
        }
    } else {
        createLootBoxes(GUI3Dscene, medals);
    }

    container.zIndex = 300;

    GUITexture.addControl(container);

    // Animate container fade in
    container.alpha = 0;
    const animation = new BABYLON.Animation("containerFadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 40, value: 1 }
    ]);
    container.animations = [];
    container.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    animation.setEasingFunction(ease); 

    GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 40, false, 1);
}

export function fadeInContinueButton(continueButton) {
    GUIscene.beginDirectAnimation(continueButton, [continueButton.animations[0]], 0, 40, false, 1);
}

export function createSwirlKeyFrameData(dummyX, dummyY, index) {
    let dummy = {
        x: dummyX,
        y: dummyY,
        xVel: -30,
        yVel: -15,
        drag: 0.92,
    }
    let swirlKeyframesX = [];
    let swirlKeyframesY = [];
    for (let i = 0; i < 300; i++) {
        if(i > index * 6){
            dummy.xVel += (0 - dummy.x) * 0.015;
            dummy.yVel += (0 - dummy.y) * 0.015;

            dummy.x += dummy.xVel;
            dummy.y += dummy.yVel;

            dummy.xVel *= dummy.drag;
            dummy.yVel *= dummy.drag;

            if(Math.abs(dummy.xVel) > 2 && Math.abs(dummy.yVel) > 2){
                swirlKeyframesX.push({ frame: i, value: dummy.x });
                swirlKeyframesY.push({ frame: i, value: dummy.y });
            }
        } else {
            swirlKeyframesX.push({ frame: i, value: dummy.x });
            swirlKeyframesY.push({ frame: i, value: dummy.y });
        }
    }
    
    const combinedXYKeyframes = [swirlKeyframesX, swirlKeyframesY];

    return combinedXYKeyframes;
}
