import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, setOrthoSize } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { getImage } from "../graphics/loadImages.js";
import { enemyBoard, medals, playerBoard } from "../managers/gameSetup.js";
import { currentScene, setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { clearBoard } from "../utilities/utils.js";

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
    medalText.text = "Medals: " + medals;
    medalText.color = "white";
    medalText.fontSize = 20;
    medalText.top = "30%";
    medalText.fontFamily = "GemunuLibre-Bold";
    medalText.zIndex = 4;
    container.addControl(medalText);

    //Continue Button
    const continueButton = new GUI.Image("continueButton", getImage("continueButton.png"));
    continueButton.width = "137px";
    continueButton.height = "33px";
    continueButton.top = "35%";
    continueButton.zIndex = 20;
    continueButton.onPointerClickObservable.add( () => {
        if(currentScene === "endBattle"){
            fadeToBlack(()=> {
                setCurrentScene("menu");
            });
        }
    });

    //Change cursor on hover
    continueButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    continueButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

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