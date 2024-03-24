import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene } from '../../graphics/sceneInitialization.js';
import { getImage } from "../../graphics/loadImages.js";
import { makeAnimatedClickable } from "./makeAnimatedClickable.js";
import { createCardGraphic } from "../../graphics/createCardGraphic.js";
import { drawSpecificCardFromDeckToHand } from "../../components/deck.js";
import { socket } from "../../network/connect.js";

export function createDraftScreen(cards) {
    const container = new GUI.Rectangle();
    container.thickness = 0;
    
    // Create Dark Screen
    const darkScreen = new GUI.Rectangle();
    darkScreen.width = "100%";
    darkScreen.height = "100%";
    darkScreen.thickness = 0;
    darkScreen.background = "black";
    darkScreen.alpha = 0.7;
    container.addControl(darkScreen);

    // Create Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Pick Two Cards";
    titleText.color = "white";
    titleText.fontSize = 30;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = -200;
    titleText.left = 0;
    container.addControl(titleText);

    // Create Card Container
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "100%";
    cardContainer.height = "100%";
    cardContainer.thickness = 0;
    container.addControl(cardContainer);


    const pickedCards = [];
    const cardGraphics = [];
    // Create Card Buttons
    for(let i = 0; i < cards.length; i++){
        const card = cards[i];
        card.currentPosition = {
            x: ((i - (cards.length - 1) / 2) * 200) + "px",
            y: "0px"
        };
        card.rotation = 0;
        card.zIndex = 10;
        const cardGraphic = createCardGraphic(card);
        cardGraphic.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        cardGraphic.scale = 0.8;
        cardGraphics.push(cardGraphic);
        container.addControl(cardGraphic);
        makeAnimatedClickable(cardGraphic, () => {
            pickedCards.push(card.UID);
            cardGraphic.alpha = 0.5;
            cardGraphic.isEnabled = false;
            if(pickedCards.length === 2){
                socket.emit("draftCards", pickedCards);
                container.dispose();
                pickedCards.forEach(cardUID => {
                    drawSpecificCardFromDeckToHand(cardUID);
                });
                GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 10, false, 1, () => {
                    container.dispose();
                });
            }
        });
    }

    //Animate container fade out
    const animationOUT = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keysOUT = [
        { frame: 0, value: 1 },
        { frame: 10, value: 0 },
    ];
    animationOUT.setKeys(keysOUT);
    container.animations = [];
    container.animations.push(animationOUT);

    //Animate container fade in
    const animationIN = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keysIN = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    animationIN.setKeys(keysIN);
    container.animations.push(animationIN);
    GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 10, false, 1);

    container.zIndex = 1000;

    GUITexture.addControl(container);
}
