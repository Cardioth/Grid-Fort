import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../../managers/sceneManager.js";
import { fadeToBlack } from "../generalGUI.js";
import { socket } from "../../network/connect.js";
import { createAlertMessage } from "./createAlertMessage.js";
import { getImage } from "../../graphics/loadImages.js";
import { createCustomButton } from "./createCustomButton.js";

export function createStartGameDialogue(deck) {
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
    const gameDialogueBacking = new GUI.Image("gameDialogueBacking", getImage("gameDialogueBacking.png"));
    gameDialogueBacking.width = "413px";
    gameDialogueBacking.height = "250px";
    gameDialogueBacking.top = "65px";
    container.addControl(gameDialogueBacking);

    // Create Confirm Button
    let startingGame = false;
    const confirmButton = createCustomButton("Confirm", () => {
        if (startingGame) return;
        startingGame = true;
        confirmButton.alpha = 0.5;
        socket.emit("startGame", { deckName: deck.deckName });
        socket.once("startGameResponse", (response) => {
            if (response === "success") {
                fadeToBlack(() => {
                    setCurrentScene("build");
                });
            } else {
                createAlertMessage(response, null, 30, true);
                startingGame = false;
            }
        });
    });
    confirmButton.left = "92px";
    confirmButton.top = "128px";
    container.addControl(confirmButton);

    // Create Cancel Button
    const cancelButton = new GUI.Image("cancelButton", getImage("cancelButton.png"));
    cancelButton.width = "14px";
    cancelButton.height = "14px";
    cancelButton.left = "188px";
    cancelButton.top = "-40px";
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

    // Create Fee Text Title
    const feeTextTitle = new GUI.TextBlock();
    feeTextTitle.width = "150px";
    feeTextTitle.height = "40px";
    feeTextTitle.text = "Entry Fee:";
    feeTextTitle.color = "white";
    feeTextTitle.fontSize = 25;
    feeTextTitle.fontFamily = "GemunuLibre-Medium";
    feeTextTitle.top = "10px";
    feeTextTitle.left = "-120px";
    container.addControl(feeTextTitle);

    // Create Deck Title
    const deckTitle = new GUI.TextBlock();
    deckTitle.width = "150px";
    deckTitle.height = "40px";
    deckTitle.text = "Deck:";
    deckTitle.color = "white";
    deckTitle.fontSize = 25;
    deckTitle.fontFamily = "GemunuLibre-Medium";
    deckTitle.top = "70px";
    deckTitle.left = "-139px";
    container.addControl(deckTitle);

    // Create Deck Name
    const deckName = new GUI.TextBlock();
    deckName.width = "150px";
    deckName.height = "40px";
    deckName.text = deck.deckName;
    deckName.color = "#57CDFF";
    deckName.fontSize = 25;
    deckName.fontFamily = "GemunuLibre-Medium";
    deckName.top = "70px";
    deckName.left = "80px";
    container.addControl(deckName);

    // Create Fee Amount
    const feeText = new GUI.TextBlock();
    feeText.width = "50px";
    feeText.height = "40px";
    feeText.text = "100";
    feeText.color = "#57CDFF";
    feeText.fontSize = 25;
    feeText.fontFamily = "GemunuLibre-Medium";
    feeText.top = "10px";
    feeText.left = "60px";
    container.addControl(feeText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.top = "10px";
    creditsIcon.left = "110px";
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