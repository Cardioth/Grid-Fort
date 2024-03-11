import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, GUIscene, canvas } from '../graphics/sceneInitialization.js';
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

let filteredCollection = [];
let newTempCollection = [];
let totalPages;
let cardContainer;
let deckBuilderContainer;
let cardSelectionContainer;
let deckCompleteness;
let miniCardContainer;

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
            if(refreshButton){
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
            if(GUIscene.buildMode){
                GUIscene.newDeck.cards.forEach(card => {
                    card.miniCardContainer.dispose();
                });
                GUIscene.newDeck.cards = [];
                updateMiniCardPositions();
            }
            resetCardContainer();
            loadingIcon.isVisible = false;
        });

    });

    refreshButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    refreshButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    refreshButton.top = "-20px";
    refreshButton.left = "150px";

    container.addControl(refreshButton);
    
    GUITexture.addControl(container);
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
            resetCardContainer();
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
            resetCardContainer();
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
    totalPages = Math.ceil(filteredCollection.length / 10);
    cardContainer = createCardContainer(GUIscene.currentPage, filteredCollection, totalPages);
    cardContainer.zIndex = 5;
    cardSelectionContainer.addControl(cardContainer);

    cardSelectionContainer.zIndex = 4;

    updateNextPreviousButtonVisibility(GUIscene.currentPage, totalPages, nextPageButton, previousPageButton);
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

    //Create build deck button
    const buildDeckButton = createBuildDeckButton();
    buildDeckButton.top = "231px";
    buildDeckButton.left = "-9px";
    deckBuilderContainer.addControl(buildDeckButton);

    container.addControl(deckBuilderContainer);
}

function createDeckNameDialogue(buildDeckButton){
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
    const deckNameDialogueBacking = new GUI.Image("startGameDialogueBacking", getImage("gameDialogueBacking.png"));
    deckNameDialogueBacking.width = "516px";
    deckNameDialogueBacking.height = "136px";
    container.addControl(deckNameDialogueBacking);

    // Create Deck Name Input
    const deckNameInput = new GUI.InputText();
    deckNameInput.width = "270px";
    deckNameInput.height = "40px";
    deckNameInput.color = "white";
    deckNameInput.background = "rgba(0, 0, 0, 0.3)";
    deckNameInput.focusedBackground = "rgba(0, 0, 0, 0.4)";
    deckNameInput.thickness = 0;
    deckNameInput.left = "-80px";
    deckNameInput.top = "-12px";
    deckNameInput.text = "Deck Name";
    deckNameInput.fontFamily = "GemunuLibre-Medium";
    deckNameInput.onTextChangedObservable.add(function () {
        deckNameInput.text = deckNameInput.text.replace(/[^a-zA-Z]/g, '');
    });
    deckNameInput.onFocusObservable.add(function () {
        deckNameInput.text = "";
    });

    deckNameInput.onKeyboardEventProcessedObservable.add((eventData) => {
        if(eventData.key === "Enter"){
            eventData.preventDefault();
            enterBuildMode();
        }
    });


    container.addControl(deckNameInput);

    // Create Continue Button
    const continueButton = createCustomButton("Continue", () => {
        enterBuildMode();
    });

    
    continueButton.left = "135px";
    continueButton.top = "-10px";
    container.addControl(continueButton);

    // Create Cancel Button
    const cancelButton = new GUI.Image("cancelButton", getImage("cancelButton.png"));
    cancelButton.width = "14px";
    cancelButton.height = "14px";
    cancelButton.left = "230px";
    cancelButton.top = "-49px";
    container.addControl(cancelButton);
    cancelButton.onPointerClickObservable.add(() => {
        GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 10, false, 1, () => {
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

    //Animate container fade in
    const animation = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const animation2 = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    const keys2 = [
        { frame: 0, value: 1 },
        { frame: 10, value: 0 },
    ];
    animation.setKeys(keys);
    animation2.setKeys(keys2);
    container.animations = [];
    container.animations.push(animation, animation2);
    GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 10, false, 1);

    GUITexture.addControl(container);

    function enterBuildMode() {
        if (deckNameInput.text.length > 0 && deckNameInput.text !== "Deck Name") {
            buildDeckButton.isVisible = false;
            GUIscene.buildMode = true;
            GUIscene.newDeck = {
                name: deckNameInput.text,
                cards: []
            };
            const saveDeckButton = createSaveDeckButton();
            saveDeckButton.top = "231px";
            saveDeckButton.left = "-9px";
            deckBuilderContainer.addControl(saveDeckButton);
            GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 10, false, 1, () => {
                container.dispose();
            });
        }
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
        createDeckNameDialogue(container);
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

    saveDeckButton.onPointerEnterObservable.add(() => {
        document.body.style.cursor = 'pointer';
        buildDeckButtonHighlight.isVisible = true;
    });

    saveDeckButton.onPointerOutObservable.add(() => {
        document.body.style.cursor = 'default';
        buildDeckButtonHighlight.isVisible = false;
    });

    saveDeckButton.onPointerClickObservable.add(() => {
    });

    deckCompleteness = new GUI.TextBlock();
    deckCompleteness.text = GUIscene.newDeck.cards.length + "/ 16";
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
        cardGraphic.card = newCollection[i];
        cardGraphic.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        makeAnimatedClickable(cardGraphic, () => {
            addCardToDeck(cardGraphic.card, cardGraphic);
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
    if (GUIscene.buildMode && GUIscene.newDeck.cards.length < 16) {
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
    deckCompleteness.text = GUIscene.newDeck.cards.length + "/ 16";
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
