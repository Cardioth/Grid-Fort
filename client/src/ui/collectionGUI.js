import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../../../common/data/config.js";
import { createAlertMessage } from "../network/createAlertMessage.js";
import { collection } from "../managers/collectionManager.js";
import { createCardGraphic } from "../graphics/createCardGraphic.js";
import { signOutUser } from "../network/signOutUser.js";
import { createCustomButton } from "./createCustomButton.js";
import { makeAnimatedClickable } from "./makeAnimatedClickable.js";
import { getImage } from "../graphics/loadImages.js";

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

    // Create Card Container Backing Graphic
    const cardContainerBacking = new GUI.Image("cardContainerBacking", getImage("collectionCardPanel.png"));
    cardContainerBacking.width = "1008px";
    cardContainerBacking.height = "627px";
    cardContainerBacking.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    cardContainerBacking.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    cardContainerBacking.top = "30px";
    cardContainerBacking.left = "0px";
    cardContainerBacking.isPointerBlocker = false;
    container.addControl(cardContainerBacking);

    // Create filter buttons
    const filterButtons = [];
    const filterButtonNames = ["Weapons", "Boosters", "Shields", "Repairs", "Radars"];
    const filterButtonNameToType = {
        "Weapons": "Weapon",
        "Boosters": "Booster",
        "Shields": "Shield",
        "Repairs": "Repair",
        "Radars": "Radar"
    };
    const activeFilters = [];
    let filteredCollection = [...collection];
    filterButtonNames.forEach((name, index) => {
        const button = createCustomButton(name, () => { //toggle button
            if(activeFilters.includes(filterButtonNameToType[name])){
                // Remove filter
                activeFilters.splice(activeFilters.indexOf(filterButtonNameToType[name]), 1);
                // Remove selected graphic around button
                const selectorGraphic = container.getChildByName(filterButtonNameToType[name]);
                selectorGraphic.dispose();
            } else {
                // Add filter
                activeFilters.push(filterButtonNameToType[name]);
                // Create selected graphic around button
                const selectorGraphic = createSelectorGraphic(filterButtonNameToType[name], button);
                container.addControl(selectorGraphic);
            }
            // Filter Collection
            filteredCollection = [];
            activeFilters.forEach(filterTest => {
                filteredCollection = filteredCollection.concat(...collection.filter(card => card.class === filterTest));
            });
            if (activeFilters.length === 0) {
                filteredCollection = [...collection];
            }
            // Update Card Container
            GUIscene.currentPage = 0;
            cardContainer.dispose();
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection);
            cardContainer.zIndex = 1;
            container.addControl(cardContainer);
            totalPages = Math.ceil(filteredCollection.length / 10);           
        });
        button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        button.top = "320px";
        button.left = (index * 140 - 290) + "px";
        container.addControl(button);
        filterButtons.push(button);
    });

    // Create Card Container
    GUIscene.currentPage = 0;
    let cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection);
    container.addControl(cardContainer);
    let totalPages = Math.ceil(collection.length / 10);

    // Create Next Page Button
    const nextPageButton = new GUI.Image("nextPageButton", getImage("arrowButtonR.png"));
    nextPageButton.width = "36px";
    nextPageButton.height = "129px";
    makeAnimatedClickable(nextPageButton, () => {
        if(GUIscene.currentPage < totalPages - 1){
            GUIscene.currentPage++;
            cardContainer.dispose();
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection);
            container.addControl(cardContainer);
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
    });
    nextPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    nextPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    nextPageButton.top = "0px";
    nextPageButton.left = "504px";
    nextPageButton.zIndex = 2;
    container.addControl(nextPageButton);

    // Create Previous Page Button
    const previousPageButton = new GUI.Image("previousPageButton", getImage("arrowButton.png"));
    previousPageButton.width = "36px";
    previousPageButton.height = "129px";
    makeAnimatedClickable(previousPageButton, () => {
        if(GUIscene.currentPage > 0){
            GUIscene.currentPage--;
            cardContainer.dispose();
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection);
            container.addControl(cardContainer);
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
    });
    previousPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    previousPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    previousPageButton.top = "0px";
    previousPageButton.left = "-506px";
    previousPageButton.zIndex = 3;
    container.addControl(previousPageButton);

    updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);

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

function createSelectorGraphic(name, attachTo) {
    const selectorGraphic = new GUI.Rectangle();
    selectorGraphic.width = "150px";
    selectorGraphic.height = "50px";
    selectorGraphic.horizontalAlignment = attachTo.horizontalAlignment;
    selectorGraphic.verticalAlignment = attachTo.verticalAlignment;
    selectorGraphic.top = attachTo.top;
    selectorGraphic.left = attachTo.left;
    selectorGraphic.thickness = 1;
    selectorGraphic.name = name;
    selectorGraphic.zIndex = attachTo.zIndex - 1;
    return selectorGraphic;
}

function updateNextPreviousButtonVisibility(currentPage, totalPages, nextPageButton, previousPageButton) {
    previousPageButton.isVisible = true;
    nextPageButton.isVisible = true;
    if(currentPage === 0){
        previousPageButton.isVisible = false;
    }
    if(currentPage === totalPages - 1){
        nextPageButton.isVisible = false;
    }
}

function createCardContainer(currentPage, newCollection) {
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "900px";
    cardContainer.height = "510px";
    cardContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    cardContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    cardContainer.left = "0px";
    cardContainer.thickness = 0;

    // Create Cards
    const cardImages = [];
    const rowHeight = 250;

    const itemsPerPage = 10;
    let startIndex = currentPage * itemsPerPage;
    let endIndex = Math.min(startIndex + itemsPerPage, newCollection.length);

    // Loop through the items for the current page
    for(let i = startIndex; i < endIndex; i++){
        let columnIndex = i % 5;
        let rowIndex = Math.floor((i - startIndex) / 5);
        newCollection[i].currentPosition = { x: ((columnIndex) * 180) - 360 + "px", y: rowIndex * rowHeight - 125 + "px" };
        newCollection[i].rotation = 0;
        newCollection[i].zIndex = 1;
        const cardGraphic = createCardGraphic(newCollection[i], true);

        makeAnimatedClickable(cardGraphic, () => {
            // Select Card
            console.log("Selected Card: ", newCollection[i].class);
        });

        cardImages.push(cardGraphic);
    }

    cardImages.forEach(card => {
        cardContainer.addControl(card);
    });

    return cardContainer;
}