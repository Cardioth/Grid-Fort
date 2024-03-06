import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { collection } from "../managers/collectionManager.js";
import { createCardGraphic } from "../graphics/createCardGraphic.js";
import { createCustomButton } from "./createCustomButton.js";
import { makeAnimatedClickable } from "./makeAnimatedClickable.js";
import { getImage } from "../graphics/loadImages.js";
import { createToggleButton } from "./createToggleButton.js";

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

    // Create container
    const cardSelectionContainer = new GUI.Rectangle();
    cardSelectionContainer.thickness = 0;
    cardSelectionContainer.width = "1050px";
    cardSelectionContainer.height = "700px";
    cardSelectionContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    cardSelectionContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    cardSelectionContainer.top = "0px";
    cardSelectionContainer.left = "-200px";
    container.addControl(cardSelectionContainer);

    // Create Card Container Backing Graphic
    const cardContainerBacking = new GUI.Image("cardContainerBacking", getImage("collectionCardPanel.png"));
    cardContainerBacking.width = "1008px";
    cardContainerBacking.height = "627px";
    cardContainerBacking.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    cardContainerBacking.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    cardContainerBacking.top = "30px";
    cardContainerBacking.left = "0px";
    cardContainerBacking.isPointerBlocker = false;
    cardSelectionContainer.addControl(cardContainerBacking);

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
        const button = createToggleButton(name, () => {
            if(activeFilters.includes(filterButtonNameToType[name])){
                activeFilters.splice(activeFilters.indexOf(filterButtonNameToType[name]), 1);
            } else {
                activeFilters.push(filterButtonNameToType[name]);
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
            totalPages = Math.ceil(filteredCollection.length / 10);
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
            cardContainer.zIndex = 1;
            cardSelectionContainer.addControl(cardContainer);
            updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);     
        });
        button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        button.top = "320px";
        button.left = (index * 140 - 270) + "px";
        cardSelectionContainer.addControl(button);
        filterButtons.push(button);
    });

    // Create Card Container
    GUIscene.currentPage = 0;
    let totalPages = Math.ceil(collection.length / 10);
    let cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
    cardSelectionContainer.addControl(cardContainer);
    

    // Create Next Page Button
    const nextPageButton = new GUI.Image("nextPageButton", getImage("arrowButtonR.png"));
    nextPageButton.width = "36px";
    nextPageButton.height = "129px";
    makeAnimatedClickable(nextPageButton, () => {
        if(GUIscene.currentPage < totalPages - 1){
            GUIscene.currentPage++;
            cardContainer.dispose();
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
            cardSelectionContainer.addControl(cardContainer);
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
    });
    nextPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    nextPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    nextPageButton.top = "0px";
    nextPageButton.left = "504px";
    nextPageButton.zIndex = 2;
    cardSelectionContainer.addControl(nextPageButton);

    // Create Previous Page Button
    const previousPageButton = new GUI.Image("previousPageButton", getImage("arrowButton.png"));
    previousPageButton.width = "36px";
    previousPageButton.height = "129px";
    makeAnimatedClickable(previousPageButton, () => {
        if(GUIscene.currentPage > 0){
            GUIscene.currentPage--;
            cardContainer.dispose();
            cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
            cardSelectionContainer.addControl(cardContainer);
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
    });
    previousPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    previousPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    previousPageButton.top = "0px";
    previousPageButton.left = "-506px";
    previousPageButton.zIndex = 3;
    cardSelectionContainer.addControl(previousPageButton);

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

function updateNextPreviousButtonVisibility(currentPage, totalPages, nextPageButton, previousPageButton) {
    previousPageButton.isVisible = true;
    nextPageButton.isVisible = true;
    if(currentPage === 0){
        previousPageButton.isVisible = false;
    }
    if(currentPage === totalPages - 1){
        nextPageButton.isVisible = false;
    }
    if(totalPages <= 1){
        nextPageButton.isVisible = false;
        previousPageButton.isVisible = false;
    }
}

function createCardContainer(currentPage, newCollection, totalPages) {
    const cardContainer = new GUI.Rectangle();
    cardContainer.width = "900px";
    cardContainer.height = "555px";
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
        const cardGraphic = createCardGraphic(newCollection[i]);
        cardGraphic.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        makeAnimatedClickable(cardGraphic, () => {
        });

        cardImages.push(cardGraphic);
    }

    // Create Dots Container
    const dotsContainer = new GUI.Rectangle();
    dotsContainer.width = "100px";
    dotsContainer.height = "100px";
    dotsContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    dotsContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    dotsContainer.top = "-268px";
    dotsContainer.left = "0px";
    dotsContainer.thickness = 0;
    cardContainer.addControl(dotsContainer);

    // Create Dots
    for(let i = 0; i < totalPages; i++){
        const dot = new GUI.Image("emptyDot", getImage("emptyDot.png"));
        dot.width = "20px";
        dot.height = "20px";
        dot.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        dot.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        dot.left = (i * 20 - (totalPages - 1) * 10) + "px";
        dotsContainer.addControl(dot);
    }

    // Create Filled Dot
    const filledDot = new GUI.Image("filledDot", getImage("filledDot.png"));
    filledDot.width = "20px";
    filledDot.height = "20px";
    filledDot.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    filledDot.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    filledDot.left = (currentPage * 20 - (totalPages - 1) * 10) + "px";
    dotsContainer.addControl(filledDot);

    cardImages.forEach(card => {
        cardContainer.addControl(card);
    });

    return cardContainer;
}