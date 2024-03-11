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
import { createLoadingIcon } from "./uiElements/createLoadingIcon.js";
import { socket } from "../network/connect.js";
import { createAlertMessage } from "../network/createAlertMessage.js";
import { deckSize } from "../../../common/data/config.js";
import { createLoadingIconScreen } from "./uiElements/createLoadingIconScreen.js";
import { createInputDialogue } from "./createInputDialogue.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";

let filteredCollection = [];
let newTempCollection = [];
let totalPages;
let cardContainer;
let deckBuilderContainer;
let cardSelectionContainer;
let deckCompleteness;
let miniCardContainer;
let nextPageButton;
let previousPageButton;
let buildDeckButton;

export function createCollectionInterface(){
    newTempCollection = [...collection];
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

    // Create Card Collection Panel
    createCardCollectionPanel(container);

    // Create Deck Builder Interface
    createDeckBuilderInterface(container);

    // Return to Menu Button
    const returnButton = createReturnButton();
    container.addControl(returnButton);
    
    // Refresh Collection Button
    const refreshButton = createRefreshButton(container);
    container.addControl(refreshButton);
    
    GUITexture.addControl(container);
}

function createReturnButton() {
    const returnButton = createCustomButton("Return", () => {
        fadeToBlack(() => {
            setCurrentScene("menu");
        });
    });

    returnButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    returnButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    returnButton.top = "-20px";
    returnButton.left = "15px";
    return returnButton;
}

function createRefreshButton(container) {
    const loadingIcon = createLoadingIcon();
    loadingIcon.zIndex = 10;
    loadingIcon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    loadingIcon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    loadingIcon.top = "10px";
    loadingIcon.left = "320px";
    loadingIcon.scaleX = 0.5;
    loadingIcon.scaleY = 0.5;
    loadingIcon.isHitTestVisible = false;
    loadingIcon.isVisible = false;
    container.addControl(loadingIcon);

    // Refresh Collection Button
    const refreshButton = createCustomButton("Refresh", () => {
        loadingIcon.isVisible = true;
        refreshButton.alpha = 0.5;
        refreshButton.isDisabled = true;
        setTimeout(() => {
            if (refreshButton) {
                refreshButton.alpha = 1;
                refreshButton.isDisabled = false;
            }
        }, 30000);
        socket.emit("getCollection");
        socket.once("getCollectionResponse", () => {
            // Refresh Collection
            GUIscene.currentPage = 0;
            newTempCollection = [...collection];
            filteredCollection = [...newTempCollection];
            if (GUIscene.buildMode) {
                GUIscene.newDeck.cards.forEach(card => {
                    card.miniCardContainer.dispose();
                });
                GUIscene.newDeck.cards = [];
                updateMiniCardPositions();
            }
            resetCardContainer();
            GUIscene.currentPage = 0;
            updateNextPreviousButtonVisibility(GUIscene.currentPage);
            loadingIcon.isVisible = false;
        });

    });

    refreshButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    refreshButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    refreshButton.top = "-20px";
    refreshButton.left = "150px";
    return refreshButton;
}

function createCardCollectionPanel(container) {
    cardSelectionContainer = new GUI.Rectangle();
    cardSelectionContainer.thickness = 0;
    cardSelectionContainer.width = "4000px";
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
    filteredCollection = [...newTempCollection];
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
                filteredCollection = filteredCollection.concat(...newTempCollection.filter(card => card.class === filterTest));
            });
            if (activeFilters.length === 0) {
                filteredCollection = [...newTempCollection];
            }
            // Update Card Container
            GUIscene.currentPage = 0;
            resetCardContainer();
            updateNextPreviousButtonVisibility(GUIscene.currentPage);
        });
        button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        button.top = "320px";
        button.left = (index * 140 - 270) + "px";
        cardSelectionContainer.addControl(button);
        filterButtons.push(button);
    });


    // Create Next Page Button
    nextPageButton = new GUI.Image("nextPageButton", getImage("arrowButtonR.png"));
    nextPageButton.width = "36px";
    nextPageButton.height = "129px";
    makeAnimatedClickable(nextPageButton, () => {
        if (GUIscene.currentPage < totalPages - 1) {
            GUIscene.currentPage++;
            resetCardContainer();
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage);
    });
    nextPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    nextPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    nextPageButton.top = "0px";
    nextPageButton.left = "504px";
    nextPageButton.zIndex = 2;
    cardSelectionContainer.addControl(nextPageButton);

    // Create Previous Page Button
    previousPageButton = new GUI.Image("previousPageButton", getImage("arrowButton.png"));
    previousPageButton.width = "36px";
    previousPageButton.height = "129px";
    makeAnimatedClickable(previousPageButton, () => {
        if (GUIscene.currentPage > 0) {
            GUIscene.currentPage--;
            resetCardContainer();
        }
        updateNextPreviousButtonVisibility(GUIscene.currentPage);
    });
    previousPageButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    previousPageButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    previousPageButton.top = "0px";
    previousPageButton.left = "-506px";
    previousPageButton.zIndex = 3;
    cardSelectionContainer.addControl(previousPageButton);

    // Create Card Container
    GUIscene.currentPage = 0;
    totalPages = Math.ceil(filteredCollection.length / 10);
    cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
    cardContainer.zIndex = 5;
    cardSelectionContainer.addControl(cardContainer);

    cardSelectionContainer.zIndex = 4;

    updateNextPreviousButtonVisibility(GUIscene.currentPage);
}

function createDeckBuilderInterface(container){
    // Create container
    deckBuilderContainer = new GUI.Rectangle();
    deckBuilderContainer.isHitTestVisible = false;
    deckBuilderContainer.top = "5px";
    deckBuilderContainer.left = "520px";
    deckBuilderContainer.thickness = 0;
    deckBuilderContainer.isHitTestVisible = false;

    const newPanel = createPanel(354,580);
    deckBuilderContainer.addControl(newPanel);

    // Create Scroll Viewer
    const scrollViewer = new GUI.ScrollViewer(null, true);
    scrollViewer.width = "327px";
    scrollViewer.height = "450px";
    scrollViewer.thumbImage = new GUI.Image("but", getImage("scrollBarHandle.png"));
    scrollViewer.zIndex = 10;
    scrollViewer.color = "#081526";
    scrollViewer.barSize = 12;
    scrollViewer.thumbHeight = 0.4;
    scrollViewer.thumbLength = 0.7;
    scrollViewer.thickness = 0;
    scrollViewer.top = "-25px";
    scrollViewer.left = "-3px";
    deckBuilderContainer.addControl(scrollViewer);

    // Create mini Card container
    miniCardContainer = new GUI.Rectangle();
    miniCardContainer.thickness = 0;
    miniCardContainer.width = "315px";
    miniCardContainer.height = "50px";
    miniCardContainer.top = "-30px";
    miniCardContainer.left = "-2px";
    miniCardContainer.isHitTestVisible = false;
    scrollViewer.addControl(miniCardContainer);

    addDecksToMiniCardContainer();

    //Create build deck button
    buildDeckButton = createBuildDeckButton();
    buildDeckButton.top = "231px";
    buildDeckButton.left = "-9px";
    deckBuilderContainer.addControl(buildDeckButton);

    container.addControl(deckBuilderContainer);
}

function addDecksToMiniCardContainer(){
    const decks = JSON.parse(localStorage.getItem("decks"));
    miniCardContainer.miniDecks =[];
    decks.forEach(deck => {
        const miniDeck = createMiniDeck(deck);
        miniCardContainer.addControl(miniDeck);
        miniCardContainer.miniDecks.push(miniDeck);

        miniDeck.top = (decks.indexOf(deck) * 50)-((decks.length-1) * 50/2) + "px";
        miniCardContainer.height = (decks.length * 50) + "px";
        miniCardContainer.top = (decks.length * 50) / 2 + "px";
    });
}

function clearMiniCardContainer(){
    miniCardContainer.miniDecks.forEach(deck => {
        deck.dispose();
    });
    miniCardContainer.miniDecks = [];
}

function createMiniDeck(deck){
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "320px";
    container.height = "42px";
    container.isHitTestVisible = false;
    container.left = "3px";

    const miniDeckBacking = new GUI.Image("miniDeckBacking", getImage("miniDeckBacking.png"));
    miniDeckBacking.width = "320px";
    miniDeckBacking.height = "42px";
    
    const miniDeckText = new GUI.TextBlock();
    miniDeckText.text = deck;
    miniDeckText.color = "white";
    miniDeckText.fontSize = 20;
    miniDeckText.fontFamily = "GemunuLibre-Medium";
    miniDeckText.shadowBlur = 0;
    miniDeckText.shadowColor = "#262626";
    miniDeckText.shadowOffsetX = 0;
    miniDeckText.shadowOffsetY = 2;
    miniDeckText.top = "-3px";
    miniDeckText.left = "-10px";
    miniDeckText.zIndex = 3;

    // Create Remove Button
    const removeButton = new GUI.Image("removeButton", getImage("cancelButton.png"));
    removeButton.width = "14px";
    removeButton.height = "14px";
    removeButton.left = "120px";
    removeButton.top = "-2px";
    removeButton.zIndex = 4;
    makeAnimatedClickable(removeButton, () => {
        socket.emit("deleteDeck", deck);
        const loadingScreen = createLoadingIconScreen("Deleting Deck...");
        loadingScreen.zIndex = 10;
        GUITexture.addControl(loadingScreen);
        socket.once("deleteDeckResponse", (response) => {
            createAlertMessage(response);
            loadingScreen.dispose();
            if(response === "Deck deleted"){
                const decks = JSON.parse(localStorage.getItem("decks"));
                decks.splice(decks.indexOf(deck), 1);
                localStorage.setItem("decks", JSON.stringify(decks));
                container.dispose();
                miniCardContainer.miniDecks.splice(miniCardContainer.miniDecks.indexOf(container), 1);
                miniCardContainer.height = (miniCardContainer.miniDecks.length * 50) + "px";
                miniCardContainer.top = (miniCardContainer.miniDecks.length * 50) / 2 + "px";
            }
        });
    });

    container.addControl(removeButton);
    container.addControl(miniDeckBacking);
    container.addControl(miniDeckText);

    return container;
}

function enterBuildMode(input) {
    if (input.length > 0 && input !== "Deck Name") {
        clearMiniCardContainer();
        buildDeckButton.isVisible = false;
        GUIscene.buildMode = true;
        GUIscene.newDeck = {
            name: input,
            cards: []
        };
        const saveDeckButton = createSaveDeckButton();
        saveDeckButton.top = "231px";
        saveDeckButton.left = "-9px";
        deckBuilderContainer.addControl(saveDeckButton);
    }
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
        createInputDialogue(enterBuildMode, "Deck Name");
    });

    container.addControl(buildDeckButton);
    container.addControl(buildDeckButtonHighlight);

    return container;
}

function createSaveDeckButton() {
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.isHitTestVisible = false;

    const saveDeckButton = new GUI.Image("saveDeckButton", getImage("saveDeckButton.png"));
    saveDeckButton.width = "309px";
    saveDeckButton.height = "55px";

    const buildDeckButtonHighlight = new GUI.Image("buildDeckButton", getImage("saveDeckButtonOver.png"));
    buildDeckButtonHighlight.width = "309px";
    buildDeckButtonHighlight.height = "55px";
    buildDeckButtonHighlight.isHitTestVisible = false;
    buildDeckButtonHighlight.isVisible = false;

    saveDeckButton.isDisabled = false;
    saveDeckButton.onPointerEnterObservable.add(() => {
        if(saveDeckButton.isDisabled) return;
        document.body.style.cursor = 'pointer';
        buildDeckButtonHighlight.isVisible = true;
    });

    saveDeckButton.onPointerOutObservable.add(() => {
        if(saveDeckButton.isDisabled) return;
        document.body.style.cursor = 'default';
        buildDeckButtonHighlight.isVisible = false;
    });

    saveDeckButton.onPointerClickObservable.add(() => {
        if(saveDeckButton.isDisabled) return;
        saveDeckButton.isDisabled = true;
        document.body.style.cursor = 'default';
        const loadingScreen = createLoadingIconScreen("Saving Deck...");
        loadingScreen.zIndex = 10;
        GUITexture.addControl(loadingScreen);

        const deckCardList = GUIscene.newDeck.cards.map(card => card.UID);
        socket.emit("saveDeck", {deck:deckCardList, name:GUIscene.newDeck.name});
        socket.once("saveDeckResponse", (response) => {
            createAlertMessage(response);
            if(response === "Deck saved successfully"){
                GUIscene.buildMode = false;
                GUIscene.newDeck.cards.forEach(card => {
                    card.miniCardContainer.dispose();
                });

                const decks = JSON.parse(localStorage.getItem("decks"));
                decks.push(GUIscene.newDeck.name);
                localStorage.setItem("decks", JSON.stringify(decks));
                
                GUIscene.newDeck.cards = [];
                GUIscene.newDeck.name = "";
                GUIscene.currentPage = 0;
                newTempCollection = [...collection];
                filteredCollection = [...newTempCollection];
                totalPages = Math.ceil(filteredCollection.length / 10);
                resetCardContainer();
                updateNextPreviousButtonVisibility(GUIscene.currentPage);
                addDecksToMiniCardContainer();
                container.dispose();
                buildDeckButton.isVisible = true;
                loadingScreen.dispose();
            } else {
                saveDeckButton.isDisabled = false;
                loadingScreen.dispose();
            }
        });
    });

    deckCompleteness = new GUI.TextBlock();
    deckCompleteness.text = GUIscene.newDeck.cards.length + "/ " + deckSize;
    deckCompleteness.name = "deckCompleteness";
    deckCompleteness.color = "white";
    deckCompleteness.fontSize = 20;
    deckCompleteness.fontFamily = "GemunuLibre-Medium";
    deckCompleteness.top = "3px";
    deckCompleteness.left = "-110px";
    deckCompleteness.zIndex = 3;
    deckCompleteness.isHitTestVisible = false;
    container.addControl(deckCompleteness);

    container.addControl(saveDeckButton);
    container.addControl(buildDeckButtonHighlight);

    return container;
}

function updateNextPreviousButtonVisibility(currentPage) {
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
        cardGraphic.card = newCollection[i];
        cardGraphic.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        makeAnimatedClickable(cardGraphic, () => {
            if(!GUIscene.buildMode){
                displayCard(cardGraphic.card)
            } else {
                addCardToDeck(cardGraphic.card, cardGraphic);
            }
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

function addCardToDeck(card, cardGraphic) {
    if (GUIscene.buildMode && GUIscene.newDeck.cards.length < deckSize) {
        GUIscene.newDeck.cards.push(card);
        const miniCard = createMiniCard(card);
        card.miniCard = miniCard;
        miniCardContainer.addControl(miniCard);
        updateMiniCardPositions();
        //remove from collection
        newTempCollection.splice(newTempCollection.indexOf(card), 1);
        filteredCollection.splice(filteredCollection.indexOf(card), 1);
        totalPages = Math.ceil(filteredCollection.length / 10);
        cardGraphic.dispose();
    }
}

function updateMiniCardPositions(){
    deckCompleteness.text = GUIscene.newDeck.cards.length + "/ " + deckSize;
    for(let i = 0; i < GUIscene.newDeck.cards.length; i++){
        GUIscene.newDeck.cards[i].miniCard.top = (i * 45)-((GUIscene.newDeck.cards.length-1) * 45/2) + "px";
        GUIscene.newDeck.cards[i].miniCard.left = "7px";
        miniCardContainer.height = (GUIscene.newDeck.cards.length * 45) + "px";
        miniCardContainer.top = (-GUIscene.newDeck.cards.length * 45/2) + "px";
    }
}

function createMiniCard(card) {
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "330px";
    container.height = "43px";
    container.isHitTestVisible = false;

    // Create Backing Image
    const backingImage = new GUI.Image("miniCardBacking", getImage("miniCard"+ card.level +".png"));
    backingImage.thickness = 0;
    backingImage.width = "330px";
    backingImage.height = "43px";
    backingImage.zIndex = 1;
    backingImage.isHitTestVisible = false;

    // Create Name Text
    const nameText = new GUI.TextBlock();
    nameText.text = card.name;
    if(card.tradable){
        nameText.color = "#f0ec84";
    } else {
        nameText.color = "white";
    }
    nameText.fontSize = 20;
    nameText.top = "-3px";
    nameText.left = "-10px";
    nameText.shadowBlur = 0;
    nameText.shadowColor = "#262626";
    nameText.shadowOffsetX = 0;
    nameText.shadowOffsetY = 2;
    nameText.fontFamily = "GemunuLibre-Medium";
    nameText.zIndex = 2;
    nameText.isHitTestVisible = false;
    container.addControl(nameText);

    // Create Remove Button
    const removeButton = new GUI.Image("removeButton", getImage("cancelButton.png"));
    removeButton.width = "14px";
    removeButton.height = "14px";
    removeButton.left = "120px";
    removeButton.top = "-2px";
    removeButton.zIndex = 4;
    makeAnimatedClickable(removeButton, () => {
        GUIscene.newDeck.cards.splice(GUIscene.newDeck.cards.indexOf(card), 1);
        container.dispose();
        updateMiniCardPositions();
        filteredCollection.push(card);
        newTempCollection.push(card);
        resetCardContainer();
        updateNextPreviousButtonVisibility(GUIscene.currentPage);
    });
    container.addControl(removeButton);

    // Create class icon
    const classIcon = new GUI.Image("classIcon", getImage(card.class.toLowerCase()+"Icon.png"));
    classIcon.width = "30px";
    classIcon.height = "30px";
    classIcon.left = "-147px";
    classIcon.top = "-3px";
    classIcon.zIndex = 4;
    container.addControl(classIcon);

    card.miniCardContainer = container;

    container.addControl(backingImage);

    return container;
}

function resetCardContainer() {
    totalPages = Math.ceil(filteredCollection.length / 10);
    cardContainer.dispose();
    cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
    cardContainer.zIndex = 5;
    cardSelectionContainer.addControl(cardContainer);
}

function displayCard(card) {
    //Container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    
    //Black Screen
    const blackScreen = new GUI.Rectangle();
    blackScreen.width = "100%";
    blackScreen.height = "100%";
    blackScreen.thickness = 0;
    blackScreen.background = "black";
    blackScreen.alpha = 0.8;
    blackScreen.zIndex = 1;
    container.addControl(blackScreen);

    //Card Graphic
    const cardGraphic = createCardGraphic(card);
    cardGraphic.zIndex = 2;
    cardGraphic.scaleX = .7;
    cardGraphic.scaleY = .7;
    cardGraphic.top = "-80px";
    cardGraphic.left = "-450px";
    container.addControl(cardGraphic);

    //Card description text
    const cardDescription = new GUI.TextBlock();
    cardDescription.text = card.description;
    cardDescription.color = "white";
    cardDescription.fontSize = 30;
    cardDescription.fontFamily = "GemunuLibre-Medium";
    cardDescription.top = "0px";
    cardDescription.left = "200px";
    cardDescription.zIndex = 2;
    container.addControl(cardDescription);
  
    //card effects text
    if(Object.keys(card.effects).length > 0){
        let lineHeight = 0;
        let column = 0;
        for(let key in card.effects){
            if(card.effects[key] !== 0){
                const text = camelCaseToTitleCase(key) + ": " + card.effects[key];
                const effectsText = new GUI.TextBlock();
                effectsText.text = text;
                effectsText.color = "white";
                effectsText.fontSize = 22;
                effectsText.top = 40 + lineHeight + "px";
                effectsText.left = column === 0 ? "200px" : "300px";
                effectsText.scaleX = 1;
                effectsText.fontFamily = "GemunuLibre-Medium";
                effectsText.zIndex = 10;
                container.addControl(effectsText);
                lineHeight += 22;
                if (lineHeight > 80) {
                    lineHeight = 0;
                    column++;
                }
            }
        }
    }


    //Animate Card Description fade in
    cardDescription.alpha = 0;
    const fadeInAnimationText = new BABYLON.Animation("fadeIn", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const fadeInKeysText = [
        { frame: 0, value: 0 },
        { frame: 50, value: 1 },
    ];
    fadeInAnimationText.setKeys(fadeInKeysText);
    cardDescription.animations = [];
    cardDescription.animations.push(fadeInAnimationText);
    GUIscene.beginAnimation(cardDescription, 0, 50, false, 1);

    //Animate container fade in
    container.alpha = 0;
    const fadeInAnimation = new BABYLON.Animation("fadeIn", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const fadeInKeys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    fadeInAnimation.setKeys(fadeInKeys);
    container.animations = [];
    container.animations.push(fadeInAnimation);
    GUIscene.beginAnimation(container, 0, 10, false, 1);
    
    //Animate Card slide in from left with easing
    const slideInAnimation = new BABYLON.Animation("slideIn", "left", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const slideInKeys = [
        { frame: 0, value: -650 },
        { frame: 10, value: -450 },
    ];
    slideInAnimation.setKeys(slideInKeys);
    const easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    slideInAnimation.setEasingFunction(easingFunction);
    cardGraphic.animations = [];
    cardGraphic.animations.push(slideInAnimation);
    GUIscene.beginAnimation(cardGraphic, 0, 10, false, 1);

    //On mouse click remove the container
    makeAnimatedClickable(container, () => {
        //Animate container fade out
        const fadeOutAnimation = new BABYLON.Animation("fadeOut", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const fadeOutKeys = [
            { frame: 0, value: 1 },
            { frame: 10, value: 0 },
        ];
        fadeOutAnimation.setKeys(fadeOutKeys);
        container.animations = [];
        container.animations.push(fadeOutAnimation);
        GUIscene.beginAnimation(container, 0, 10, false, 1, () => {
            container.dispose();
        });
    },1);

    GUITexture.addControl(container);
}