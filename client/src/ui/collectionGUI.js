import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { collection } from "../managers/collectionManager.js";
import { createCardGraphic } from "../graphics/createCardGraphic.js";
import { createCustomButton } from "./uiElements/createCustomButton.js";
import { makeAnimatedClickable } from "./uiElements/makeAnimatedClickable.js";
import { getImage } from "../graphics/loadImages.js";
import { createToggleButton } from "./uiElements/createToggleButton.js";
import { createPanel } from "./uiElements/createPanel.js";

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
    container.addControl(blackScreen);

    // Create Collection Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Collection";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = "-45%";
    titleText.left = 0;
    container.addControl(titleText);

    // Create container
    createCardCollectionPanel(container);

    createDeckBuilderInterface(container);

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

function createCardCollectionPanel(container) {
    const cardSelectionContainer = new GUI.Rectangle();
    cardSelectionContainer.thickness = 0;
    cardSelectionContainer.width = "2000px";
    cardSelectionContainer.top = "0px";
    cardSelectionContainer.left = "-200px";
    cardSelectionContainer.isHitTestVisible = false;
    container.addControl(cardSelectionContainer);

    // Create Card Container Backing Graphic
    const cardContainerBacking = createPanel(1008,580);
    cardContainerBacking.top = "5px";
    cardContainerBacking.left = "1px";
    cardSelectionContainer.addControl(cardContainerBacking);

    // Create Card Container Filters Panel Backing Graphic
    const cardContainerFiltersBacking = new GUI.Image("cardContainerFiltersBacking", getImage("collectionCardPanelFilters.png"));
    cardContainerFiltersBacking.width = "830px";
    cardContainerFiltersBacking.height = "54px";
    cardContainerFiltersBacking.top = "316px";
    cardContainerFiltersBacking.left = "0px";
    cardContainerFiltersBacking.zIndex = -1;
    cardSelectionContainer.addControl(cardContainerFiltersBacking);

    // Create wires graphic
    const wires = new GUI.Image("wires", getImage("wires.png"));
    wires.width = "109px";
    wires.height = "63px";
    wires.top = "316px";
    wires.left = "-380px";
    wires.zIndex = -2;
    cardSelectionContainer.addControl(wires);

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
            if (activeFilters.includes(filterButtonNameToType[name])) {
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


    // Create Next Page Button
    const nextPageButton = new GUI.Image("nextPageButton", getImage("arrowButtonR.png"));
    nextPageButton.width = "36px";
    nextPageButton.height = "129px";
    makeAnimatedClickable(nextPageButton, () => {
        if (GUIscene.currentPage < totalPages - 1) {
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
        if (GUIscene.currentPage > 0) {
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

    // Create Card Container
    GUIscene.currentPage = 0;
    let totalPages = Math.ceil(collection.length / 10);
    let cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
    cardContainer.zIndex = 5;
    cardSelectionContainer.addControl(cardContainer);

    updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
}

function createDeckBuilderInterface(container){
    // Create container
    const deckBuilderContainer = new GUI.Rectangle();
    deckBuilderContainer.isHitTestVisible = false;
    deckBuilderContainer.top = "5px";
    deckBuilderContainer.left = "520px";
    deckBuilderContainer.thickness = 0;

    const newPanel = createPanel(354,580);
    deckBuilderContainer.addControl(newPanel);

    //Create build deck button
    const buildDeckButton = createBuildDeckButton();
    
    deckBuilderContainer.addControl(buildDeckButton);

    container.addControl(deckBuilderContainer);
}

function createBuildDeckButton() {
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.isHitTestVisible = false;

    const buildDeckButton = new GUI.Image("buildDeckButton", getImage("addDeckButton.png"));
    buildDeckButton.width = "309px";
    buildDeckButton.height = "55px";

    const buildDeckButtonHighlight = new GUI.Image("buildDeckButton", getImage("addDeckButtonOver.png"));
    buildDeckButtonHighlight.width = "309px";
    buildDeckButtonHighlight.height = "55px";
    buildDeckButtonHighlight.isHitTestVisible = false;
    buildDeckButtonHighlight.isVisible = false;

    buildDeckButton.onPointerEnterObservable.add(() => {
        document.body.style.cursor = 'pointer';
        buildDeckButtonHighlight.isVisible = true;
    });

    buildDeckButton.onPointerOutObservable.add(() => {
        document.body.style.cursor = 'default';
        buildDeckButtonHighlight.isVisible = false;
    });

    buildDeckButton.onPointerClickObservable.add(() => {
    });

    container.addControl(buildDeckButton);
    container.addControl(buildDeckButtonHighlight);

    return container;
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
    cardContainer.thickness = 0;
    cardContainer.isHitTestVisible = false;

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
        }, 1.05);

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