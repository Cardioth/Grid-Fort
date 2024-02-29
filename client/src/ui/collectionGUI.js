import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../../../common/data/config.js";
import { createAlertMessage } from "../network/createAlertMessage.js";
import { collection } from "../managers/collectionManager.js";
import { createCardGraphic } from "../graphics/createCardGraphic.js";
import { signOutUser } from "../network/signOutUser.js";
import { createCustomButton } from "./createCustomButton.js";

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

    // Create Collection Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Collection";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = "-45%";
    titleText.left = 0;
    titleText.isPointerBlocker = false;
    container.addControl(titleText);

    // Create Cards
    const cardImages = [];
    const rowHeight = 250; // Change this value based on your desired spacing
    collection.forEach(card => {
        let columnIndex = cardImages.length % 5;
        let rowIndex = Math.floor(cardImages.length / 5);
        card.currentPosition = { 
            x: ((columnIndex) * 180)-400 + "px", 
            y: rowIndex * rowHeight + "px" // y-position based on row number
        };
        
        card.rotation = 0;
        card.zIndex = 1;
        cardImages.push(createCardGraphic(card));
    });

    // Create Card Container
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "70%";
    cardContainer.height = "1000px";
    cardContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    cardContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    cardContainer.top = "-200px";
    cardContainer.left = "0px";
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

    returnButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    returnButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    returnButton.top = "-20px";
    returnButton.left = "15px";

    container.addControl(returnButton);
    

    GUITexture.addControl(container);
}