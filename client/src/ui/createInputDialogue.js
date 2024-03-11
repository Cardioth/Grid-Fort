import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { createCustomButton } from "./uiElements/createCustomButton.js";
import { getImage } from "../graphics/loadImages.js";

export function createInputDialogue(functionToCall, defaultText = "") {
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    // Create Dark Screen
    const darkScreen = new GUI.Rectangle();
    darkScreen.width = "100%";
    darkScreen.height = "100%";
    darkScreen.thickness = 0;
    darkScreen.background = "black";
    darkScreen.alpha = 0.5;
    container.addControl(darkScreen);

    // Create Game Dialogue Backing
    const dialogueBacking = new GUI.Image("gameDialogueBacking", getImage("gameDialogueBacking.png"));
    dialogueBacking.width = "516px";
    dialogueBacking.height = "136px";
    container.addControl(dialogueBacking);

    // Create Input
    const input = new GUI.InputText();
    input.width = "270px";
    input.height = "40px";
    input.color = "white";
    input.background = "rgba(0, 0, 0, 0.3)";
    input.focusedBackground = "rgba(0, 0, 0, 0.4)";
    input.thickness = 0;
    input.left = "-80px";
    input.top = "-12px";
    input.text = defaultText;
    input.fontFamily = "GemunuLibre-Medium";
    input.onTextChangedObservable.add(function () {
        input.text = input.text.replace(/[^a-zA-Z]/g, '');
    });
    input.onFocusObservable.add(function () {
        input.text = "";
    });

    input.onKeyboardEventProcessedObservable.add((eventData) => {
        if (eventData.key === "Enter") {
            eventData.preventDefault();
            checkAndCall();
        }
    });

    container.addControl(input);

    // Create Continue Button
    const continueButton = createCustomButton("Continue", () => {
        checkAndCall();
    });

    continueButton.left = "135px";
    continueButton.top = "-10px";
    container.addControl(continueButton);

    function checkAndCall() {
        if (input.text.length > 0 && input.text !== defaultText) {
            functionToCall(input.text);
            GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 10, false, 1, () => {
                container.dispose();
            });
        }
    }

    // Create Cancel Button
    const cancelButton = new GUI.Image("cancelButton", getImage("cancelButton.png"));
    cancelButton.width = "14px";
    cancelButton.height = "14px";
    cancelButton.left = "230px";
    cancelButton.top = "-49px";
    container.addControl(cancelButton);
    cancelButton.onPointerClickObservable.add(() => {
        GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 10, false, 1, () => {
            container.dispose();
        });
    });
    cancelButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor = 'pointer';
    });
    cancelButton.onPointerOutObservable.add(function () {
        document.body.style.cursor = 'default';
    });

    container.alpha = 0;

    //Animate container fade in
    const animation = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const animation2 = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    const keys2 = [
        { frame: 0, value: 1 },
        { frame: 10, value: 0 },
    ];
    animation.setKeys(keys);
    animation2.setKeys(keys2);
    container.animations = [];
    container.animations.push(animation, animation2);
    GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 10, false, 1);

    GUITexture.addControl(container);

}
