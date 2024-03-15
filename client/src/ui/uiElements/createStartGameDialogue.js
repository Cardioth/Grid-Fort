import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../../managers/sceneManager.js";
import { fadeToBlack } from "../generalGUI.js";
import { socket } from "../../network/connect.js";
import { createAlertMessage } from "./createAlertMessage.js";
import { getImage } from "../../graphics/loadImages.js";
import { createCustomButton } from "./createCustomButton.js";

export function createStartGameDialogue() {
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
    const startGameDialogueBacking = new GUI.Image("startGameDialogueBacking", getImage("startGameBacking.png"));
    startGameDialogueBacking.width = "413px";
    startGameDialogueBacking.height = "124px";
    startGameDialogueBacking.top = "65px";
    container.addControl(startGameDialogueBacking);

    // Create Start Game Button
    let startingGame = false;
    const startButton = createCustomButton("Start", () => {
        if (startingGame) return;
        startingGame = true;
        socket.emit("startGame");
        socket.once("startGameResponse", (response) => {
            if (response) {
                fadeToBlack(() => {
                    setCurrentScene("build");
                });
            } else {
                createAlertMessage("Not enough credits", null, 30, true);
                startingGame = false;
            }
        });
    });
    startButton.left = "95px";
    startButton.top = "59px";
    container.addControl(startButton);

    // Create Cancel Button
    const cancelButton = new GUI.Image("cancelButton", getImage("cancelButton.png"));
    cancelButton.width = "14px";
    cancelButton.height = "14px";
    cancelButton.left = "188px";
    cancelButton.top = "23px";
    container.addControl(cancelButton);
    cancelButton.onPointerClickObservable.add(() => {
        //Animate container fade out
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
    });
    cancelButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor = 'pointer';
    });
    cancelButton.onPointerOutObservable.add(function () {
        document.body.style.cursor = 'default';
    });

    container.alpha = 0;

    // Create Credits Text
    const creditsText = new GUI.TextBlock();
    creditsText.width = "50px";
    creditsText.height = "40px";
    creditsText.text = "100uC";
    creditsText.color = "#57CDFF";
    creditsText.fontSize = 25;
    creditsText.fontFamily = "GemunuLibre-Medium";
    creditsText.top = "59px";
    creditsText.left = "-100px";
    container.addControl(creditsText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.top = "59px";
    creditsIcon.left = "-150px";
    creditsIcon.scaleX = 0.6;
    creditsIcon.scaleY = 0.6;
    container.addControl(creditsIcon);

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

    GUITexture.addControl(container);

}
