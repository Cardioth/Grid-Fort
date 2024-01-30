import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../data/config.js";
import { createAuthMessage } from "../network/createAuthMessage.js";
import { getImage } from "../graphics/loadImages.js";
import { collection } from "../managers/collectionManager.js";
import { createCardGraphic } from "../graphics/createCardGraphic.js";
import { signOutUser } from "../network/signOutUser.js";

export function createCollectionInterface(){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    const blackScreen = new GUI.Rectangle();
    blackScreen.width = "100%";
    blackScreen.height = "100%";
    blackScreen.thickness = 0;
    blackScreen.background = "black";
    blackScreen.alpha = 0.5;
    blackScreen.isPointerBlocker = false;
    container.addControl(blackScreen);

    // Create Game Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Collection";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = "-45%";
    titleText.left = 0;
    titleText.isPointerBlocker = false;
    container.addControl(titleText);

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

    // Create Cards
    const cardImages = [];
    const rowHeight = 30; // Change this value based on your desired spacing
    collection.forEach(card => {
        let columnIndex = cardImages.length % 5;
        let rowIndex = Math.floor(cardImages.length / 5);
        card.currentPosition = { 
            x: ((columnIndex - 3) * 12) + "%", 
            y: rowIndex * rowHeight + "%" // y-position based on row number
        };
        card.rotation = 0;
        card.zIndex = 1;
        cardImages.push(createCardGraphic(card));
    });

    // Create Card Container
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "100%";
    cardContainer.height = "100%";
    cardContainer.top = "-20%";
    cardContainer.thickness = 1;

    cardImages.forEach(card => {
        cardContainer.addControl(card);
    });

    container.addControl(cardContainer);

    // Return to Menu Button
    const returnButton = createCustomButton("Return", () => {
        fadeToBlack(() => {
            setCurrentScene("menu");
        });
    });

    returnButton.top = "46%";
    returnButton.left = "-44%";

    container.addControl(returnButton);
    

    GUITexture.addControl(container);
}

export function createCustomButton(text, functionToCall){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "134px";
    container.height = "33px";

    // Create Button
    const buttonGraphic = new GUI.Image("emptyButton", getImage("emptyButton.png"));
    buttonGraphic.width = "134px";
    buttonGraphic.height = "33px";
    container.addControl(buttonGraphic);

    // Create Button Text
    const buttonText = new GUI.TextBlock();
    buttonText.width = "134px";
    buttonText.height = "33px";
    buttonText.text = text;
    buttonText.color = "white";
    buttonText.fontSize = 20;
    buttonText.fontFamily = "GemunuLibre-Medium";
    container.addControl(buttonText);

    container.onPointerClickObservable.add(() => {
        document.body.style.cursor='default'
        functionToCall();
    });
    container.onPointerEnterObservable.add(function () {
        document.body.style.cursor='pointer'
    });
    container.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    return container;
}