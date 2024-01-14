import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../data/config.js";
import { signOutUser } from "../network/signOutUser.js";
import { socket } from "../network/connect.js";
import { createAuthMessage } from "../network/createAuthMessage.js";
import { getImage } from "../graphics/loadImages.js";

export function createMenuScreen(){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    const menuScreen = new GUI.Rectangle();
    menuScreen.width = "100%";
    menuScreen.height = "100%";
    menuScreen.thickness = 0;
    menuScreen.background = "black";
    menuScreen.alpha = 0.5;
    container.addControl(menuScreen);

    // Create Game Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Grid Fort";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = -30;
    titleText.left = 0;
    container.addControl(titleText);

    // Create Play Button

    const playButton = GUI.Button.CreateSimpleButton("playButton", "Play");
    playButton.width = 0.2;
    playButton.height = "40px";
    playButton.color = "white";
    playButton.fontSize = 30;
    playButton.fontFamily = "GemunuLibre-Bold";
    playButton.top = 30;
    playButton.left = 0;
    playButton.thickness = 0;
    playButton.background = "black";
    playButton.name = "playButton";
    playButton.onPointerClickObservable.add(() => {
        createStartGameDialogue();
    });
    playButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    playButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    container.addControl(playButton);

    // Create Collection Button
    const collectionButton = GUI.Button.CreateSimpleButton("collectionButton", "Collection");
    collectionButton.width = 0.2;
    collectionButton.height = "40px";
    collectionButton.color = "white";
    collectionButton.fontSize = 30;
    collectionButton.fontFamily = "GemunuLibre-Bold";
    collectionButton.top = 80;
    collectionButton.left = 0;
    collectionButton.thickness = 0;
    collectionButton.background = "black";
    collectionButton.name = "collectionButton";
    collectionButton.onPointerClickObservable.add(() => {
        // fadeToBlack(() => {
        //     //setCurrentScene("collection");
        // });
    });
    collectionButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    collectionButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });
    container.addControl(collectionButton);

    // Sign Out Button
    const signOutButton = GUI.Button.CreateSimpleButton("signOutButton", "Sign Out");
    signOutButton.width = 0.09;
    signOutButton.height = "40px";
    signOutButton.color = "white";
    signOutButton.fontSize = 30;
    signOutButton.fontFamily = "GemunuLibre-Medium";
    signOutButton.top = "45%";
    signOutButton.left = "43%";
    signOutButton.thickness = 0;
    signOutButton.background = "#0E1016";
    signOutButton.name = "signOutButton";
    signOutButton.onPointerClickObservable.add(() => {
        hideMenuButtons();
        signOutUser();
    });
    signOutButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    signOutButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });
    container.addControl(signOutButton);

    // Create Uni Credits Text
    const uniCreditsText = new GUI.TextBlock();
    uniCreditsText.width = 0.09;
    uniCreditsText.height = "40px";
    uniCreditsText.text = uniCredits + "uC";
    uniCreditsText.color = "white";
    uniCreditsText.fontSize = 25;
    uniCreditsText.fontFamily = "GemunuLibre-Medium";
    uniCreditsText.top = "45%";
    uniCreditsText.left = "30%";
    uniCreditsText.name = "uniCreditsText";
    container.addControl(uniCreditsText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.top = "45%";
    creditsIcon.left = "26%";
    creditsIcon.scaleX = 0.6;
    creditsIcon.scaleY = 0.6;
    container.addControl(creditsIcon);
    
    GUITexture.addControl(container);
    return menuScreen;
}

export function hideMenuButtons(){
    const playButton = GUITexture.getControlByName("playButton");
    const collectionButton = GUITexture.getControlByName("collectionButton");
    const signOutButton = GUITexture.getControlByName("signOutButton");

    playButton.isVisible = false;
    collectionButton.isVisible = false;
    signOutButton.isVisible = false;
}

function createStartGameDialogue(){
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
    const startGameDialogueBacking = new GUI.Image("startGameDialogueBacking", getImage("startGameBacking.png"));
    startGameDialogueBacking.width = "413px";
    startGameDialogueBacking.height = "124px";
    startGameDialogueBacking.top = "65px";
    container.addControl(startGameDialogueBacking);

    // Create Start Game Button
    const startButton = new GUI.Image("startButton", getImage("startButton.png"));
    startButton.width = "134px";
    startButton.height = "33px";
    startButton.left = "95px";
    startButton.top = "59px";
    container.addControl(startButton);
    let startingGame = false;
    startButton.onPointerClickObservable.add(() => {
        /*
        fadeToBlack(() => {
            setCurrentScene("build");
        });
        */
        if(startingGame) return;
        startingGame = true;
        socket.emit("startGame");
        socket.on("startGameResponse", (response) => {
            if (response) {
                fadeToBlack(() => {
                    setCurrentScene("build");
                });
            } else {
                createAuthMessage("Not enough credits");
                startingGame = false;
            }
        });
    });
    startButton.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    startButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

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
        document.body.style.cursor='pointer'
    });
    cancelButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    container.alpha = 0;

    // Create Credits Text
    const creditsText = new GUI.TextBlock();
    creditsText.width = "50px";
    creditsText.height = "40px";
    creditsText.text = "50uC";
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