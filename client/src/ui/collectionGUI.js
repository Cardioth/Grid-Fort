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

    // Create Card Container
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "900px";
    cardContainer.height = "550px";
    cardContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    cardContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    cardContainer.top = "0px";
    cardContainer.left = "0px";
    cardContainer.thickness = 1;

    // Create Cards
    const cardImages = [];
    const rowHeight = 250; // Change this value based on your desired spacing

    for(let i = 0; i < Math.min(10, collection.length); i++){
        let columnIndex = i % 5;
        let rowIndex = Math.floor(i / 5);
        collection[i].currentPosition = {x:((columnIndex) * 180)-360 + "px" ,y:rowIndex * rowHeight -150 + "px"};
        collection[i].rotation = 0;
        collection[i].zIndex = 1;
        const cardGraphic = createCardGraphic(collection[i]);
        cardImages.push(cardGraphic);
    }

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