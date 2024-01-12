import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits, updateUniCredits } from "../data/config.js";
import { signOutUser } from "../network/signOutUser.js";

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
        fadeToBlack(() => {
            if(uniCredits > 150){
                updateUniCredits(-150);
                setCurrentScene("build");
            }
        });
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
    container.addControl(collectionButton);

    // Sign Out Button
    const signOutButton = GUI.Button.CreateSimpleButton("signOutButton", "Sign Out");
    signOutButton.width = 0.2;
    signOutButton.height = "40px";
    signOutButton.color = "white";
    signOutButton.fontSize = 30;
    signOutButton.fontFamily = "GemunuLibre-Bold";
    signOutButton.top = 130;
    signOutButton.left = 0;
    signOutButton.thickness = 0;
    signOutButton.background = "black";
    signOutButton.name = "signOutButton";
    signOutButton.onPointerClickObservable.add(() => {
        hideMenuButtons();
        signOutUser();
    });

    GUITexture.addControl(container);
    return menuScreen;
}

export function hideMenuButtons(){
    const menuScreen = GUITexture.getControlByName("menuScreen");
    menuScreen.isVisible = false;
}