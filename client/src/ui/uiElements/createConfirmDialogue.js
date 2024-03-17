import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { getImage } from "../../graphics/loadImages.js";
import { createCustomButton } from "./createCustomButton.js";

export function createConfirmDialogue(functionToCall, confirmText = "continue") {
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    // Create Dark Screen
    const darkScreen = new GUI.Rectangle();
    darkScreen.width = "100%";
    darkScreen.height = "100%";
    darkScreen.thickness = 0;
    darkScreen.background = "black";
    darkScreen.alpha = 0.8;
    container.addControl(darkScreen);

    // Create Game Dialogue Backing
    const gameDialogueBacking = new GUI.Image("gameDialogueBacking", getImage("gameDialogueBacking2.png"));
    gameDialogueBacking.width = "413px";
    gameDialogueBacking.height = "250px";
    gameDialogueBacking.top = "65px";
    container.addControl(gameDialogueBacking);

    // Create Confirm Button
    const confirmButton = createCustomButton("Confirm", () => {
        closeDialogue();
        functionToCall();
    });
    confirmButton.left = "92px";
    confirmButton.top = "128px";
    container.addControl(confirmButton);

    // Create Cancel Button
    const cancelButton = createCustomButton("Cancel", () => {
        //Animate container fade out
        closeDialogue();
    });
    cancelButton.left = "-95px";
    cancelButton.top = "128px";
    container.addControl(cancelButton);

    // Create confirmation text
    const confirmationText = new GUI.TextBlock();
    confirmationText.width = "400px";
    confirmationText.height = "40px";
    confirmationText.text = "Are you sure you want to " + confirmText + "?";
    confirmationText.color = "white";
    confirmationText.fontSize = 22;
    confirmationText.fontFamily = "GemunuLibre-Medium";
    confirmationText.top = "30px";
    confirmationText.left = "0px";
    container.addControl(confirmationText);

    //Animate container fade in
    container.alpha = 0;
    const animation = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    animation.setKeys(keys);
    container.animations = [];
    container.animations.push(animation);
    GUIscene.beginAnimation(container, 0, 10, false, 1);

    GUITexture.addControl(container);


    function closeDialogue() {
        const animation2 = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys2 = [
            { frame: 0, value: 1 },
            { frame: 10, value: 0 },
        ];
        animation2.setKeys(keys2);
        container.animations = [];
        container.animations.push(animation2);
        GUIscene.beginAnimation(container, 0, 10, false, 1, () => {
            container.dispose();
        });
    }
}