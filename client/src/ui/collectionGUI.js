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
import { setFetchingCollection, socket, privs } from "../network/connect.js";
import { createAlertMessage } from "./uiElements/createAlertMessage.js";
import { deckSize, uniCredits } from "../../../common/data/config.js";
import { createLoadingIconScreen } from "./uiElements/createLoadingIconScreen.js";
import { createInputDialogue } from "./uiElements/createInputDialogue.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";
import { createBuildingShapeGraphic } from "./uiElements/createBuildingShapeGraphic.js";
import { createStartGameDialogue } from "./uiElements/createStartGameDialogue.js";
import { signOutUser } from "../network/signOutUser.js";
import { createAdminPanel } from "./uiElements/createAdminPanel.js";
import { setProfileData } from "./menuGUI.js";
import { createConfirmDialogue } from "./uiElements/createConfirmDialogue.js";
import { createPlayButton } from "./uiElements/createPlayButton.js";

let filteredCollection = [];
let newTempCollection = []; //This layer of separation between collection and filtered collection is no longer needed as the cards are no longer removed when added to the deck in deck builder mode, but I'm too lazy to change it
let totalPages;
let cardContainer;
let deckBuilderContainer;
let cardSelectionContainer;
let deckCompleteness;
let miniCardContainer;
let nextPageButton;
let previousPageButton;
let buildDeckButton;
let defaultDeckMiniDeck;
export let selectedDeck = "Default Deck";

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
    blackScreen.alpha = 0.4;
    container.addControl(blackScreen);

    // Black backing
    const blackBacking = new GUI.Rectangle();
    blackBacking.width = "100%";
    blackBacking.height = "80px";
    blackBacking.thickness = 1;
    blackBacking.background = "black";
    blackBacking.color = "black";
    blackBacking.alpha = 0.4;
    blackBacking.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    container.addControl(blackBacking);

    // Create Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Grid Fort";
    titleText.height = "80px";
    titleText.width = "180px";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = "50px";
    titleText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    titleText.left = 0;
    titleText.zIndex = 30;
    container.addControl(titleText);

    // Create Collection Text
    const collectionText = new GUI.TextBlock();
    collectionText.text = "Collection";
    collectionText.color = "white";
    collectionText.width = "150px";
    collectionText.height = "50px";
    collectionText.fontSize = 30;
    collectionText.fontFamily = "GemunuLibre-Bold";
    collectionText.top = "-300px";
    collectionText.left = "-550px";
    collectionText.zIndex = 30;
    container.addControl(collectionText);

    // Create Deck Text
    const deckText = new GUI.TextBlock();
    deckText.text = "Deck";
    deckText.color = "white";
    deckText.width = "150px";
    deckText.height = "50px";
    deckText.fontSize = 30;
    deckText.fontFamily = "GemunuLibre-Bold";
    deckText.top = "-300px";
    deckText.left = "465px";
    deckText.zIndex = 30;
    container.addControl(deckText);

    // Create Card Collection Panel
    createCardCollectionPanel(container);

    // Create Deck Builder Interface
    createDeckBuilderInterface(container);
  
    // Refresh Collection Button
    const refreshButton = createRefreshButton(container);
    container.addControl(refreshButton);

    // Create Play Button
    
    const playButton = createPlayButton(() => {
        createStartGameDialogue(selectedDeck);
    });
    playButton.top = "345px";
    playButton.left = "520px";
    playButton.name = "playButton";
    container.addControl(playButton);

    // Create Profile Button
    const profileButton = createCustomButton("Profile", () => {
        document.body.style.cursor='pointer'
        socket.emit("getProfile");
        socket.once("getProfileResponse", (response) => {
            setProfileData(response);
            fadeToBlack(() => {
                setCurrentScene("profile");
            });
        });
    });
    profileButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    profileButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    profileButton.top = "-20px";
    profileButton.left = "-160px";
    profileButton.name = "profileButton";
    container.addControl(profileButton);

    // Sign Out Button
    const signOutButton = createCustomButton("Sign Out", () => {
        signOutUser();
    });
    signOutButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    signOutButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    signOutButton.top = "-20px";
    signOutButton.left = "-10px";
    signOutButton.name = "signOutButton";
    container.addControl(signOutButton);

    // Create Uni Credits Text
    const uniCreditsText = new GUI.TextBlock();
    uniCreditsText.width = "130px";
    uniCreditsText.height = "40px";
    uniCreditsText.text = uniCredits;
    uniCreditsText.color = "white";
    uniCreditsText.fontSize = 25;
    uniCreditsText.fontFamily = "GemunuLibre-Medium";
    uniCreditsText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    uniCreditsText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    uniCreditsText.top = "-20px";
    uniCreditsText.left = "-550px";
    uniCreditsText.name = "uniCreditsText";
    container.addControl(uniCreditsText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    creditsIcon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    creditsIcon.top = "-5px";
    creditsIcon.left = "-640px";
    creditsIcon.scaleX = 0.6;
    creditsIcon.scaleY = 0.6;
    container.addControl(creditsIcon);

    // Create Username Text
    const usernameText = new GUI.TextBlock();
    const profile = JSON.parse(localStorage.getItem("profile"));
    usernameText.width = "150px";
    usernameText.height = "40px";
    usernameText.text = profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
    usernameText.color = "white";
    usernameText.fontSize = 25;
    usernameText.fontFamily = "GemunuLibre-Medium";
    usernameText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    usernameText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    usernameText.top = "-20px";
    usernameText.left = "-300px";
    usernameText.zIndex = 30;
    container.addControl(usernameText);
    
    if(privs === "admin"){
        const adminPanel = createAdminPanel();
        adminPanel.zIndex = 100;
    }

    GUITexture.addControl(container);
}

function createRefreshButton(container) {
    const loadingIcon = createLoadingIcon();
    loadingIcon.zIndex = 10;
    loadingIcon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    loadingIcon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    loadingIcon.top = "10px";
    loadingIcon.left = "150px";
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
        setFetchingCollection(true);
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
    refreshButton.left = "10px";
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
        const deckIndex = decks.findIndex(d => d.deckName === deck.deckName);
        miniDeck.top = (deckIndex * 50)-((decks.length-1) * 50/2) + "px";
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

    const miniDeckBacking = new GUI.Image("miniDeckBacking", getImage("miniDeckBackingOff.png"));
    miniDeckBacking.width = "320px";
    miniDeckBacking.height = "42px";
    miniDeckBacking.name = "miniDeckBacking";

    container.selected = false;
    if (localStorage.getItem("selectedDeck") === deck.deckName){
        container.selected = true;
        selectedDeck = deck;
        miniDeckBacking.source = getImage("miniDeckBackingOn.png");
    }
    if (localStorage.getItem("selectedDeck") === null && deck.deckName === "Default Deck"){
        container.selected = true;
        selectedDeck = deck;
        miniDeckBacking.source = getImage("miniDeckBackingOn.png");
    }
    if(deck.deckName === "Default Deck"){
        defaultDeckMiniDeck = container;
    }

    makeAnimatedClickable(container, () => {
        miniCardContainer.miniDecks.forEach(deckMiniCard => {
            deckMiniCard.selected = false;
            deckMiniCard.children[0].source = getImage("miniDeckBackingOff.png");
        });
        if(container.selected){
            container.selected = false;
            miniDeckBacking.source = getImage("miniDeckBackingOff.png");
        }
        else{
            container.selected = true;
            selectedDeck = deck;
            miniDeckBacking.source = getImage("miniDeckBackingOn.png");
            localStorage.setItem("selectedDeck", deck.deckName);
        }
    },1.01);
    
    const miniDeckText = new GUI.TextBlock();
    miniDeckText.text = deck.deckName;
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
    if(deck.deckName !== "Default Deck"){
        const removeButton = new GUI.Image("removeButton", getImage("binIcon.png"));
        removeButton.width = "14px";
        removeButton.height = "16px";
        removeButton.left = "60px";
        removeButton.top = "-2px";
        removeButton.zIndex = 4;
        makeAnimatedClickable(removeButton, () => {
            createConfirmDialogue(() => {
                socket.emit("deleteDeck", deck.deckName);
                const loadingScreen = createLoadingIconScreen("Deleting Deck...");
                loadingScreen.zIndex = 10;
                GUITexture.addControl(loadingScreen);
                if(container.selected){
                    selectedDeck = "Default Deck";
                    localStorage.setItem("selectedDeck", "Default Deck");
                    defaultDeckMiniDeck.selected = true;
                    defaultDeckMiniDeck.children[0].source = getImage("miniDeckBackingOn.png");
                }
                socket.once("deleteDeckResponse", (response) => {
                    createAlertMessage(response, null, 30, true);
                    loadingScreen.dispose();
                    if(response === "Deck deleted"){
                        const decks = JSON.parse(localStorage.getItem("decks"));
                        const deckIndex = decks.findIndex(d => d.deckName === deck.deckName);
                        if (deckIndex !== -1) {
                          decks.splice(deckIndex, 1);
                          localStorage.setItem("decks", JSON.stringify(decks));
                        }
                        container.dispose();
                        miniCardContainer.miniDecks.splice(miniCardContainer.miniDecks.indexOf(container), 1);
                        updateMiniDeckPositions();
                    }
                });
            }, "delete this deck");
        });
        container.addControl(removeButton);
    }


    container.addControl(miniDeckBacking);
    container.addControl(miniDeckText);

    return container;
}

function enterBuildMode(input) {
    if (input.length > 0 && input !== "Deck Name") {
        socket.emit("createDeck", input);
        socket.once("createDeckResponse", (response) => {
            if(response === "Deck created"){
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
            } else {
                createAlertMessage(response, null, 30, true);
            }
        });
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
            createAlertMessage(response, null, 30, true);
            if(response === "Deck saved successfully"){
                GUIscene.buildMode = false;
                GUIscene.newDeck.cards.forEach(card => {
                    card.miniCardContainer.dispose();
                });

                const decks = JSON.parse(localStorage.getItem("decks"));
                decks.push({deckName:GUIscene.newDeck.name, deckCards:deckCardList});
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
    createPageIndicator(cardContainer, totalPages, currentPage);

    cardImages.forEach(card => {
        cardContainer.addControl(card);
    });

    return cardContainer;
}

function createPageIndicator(cardContainer, totalPages, currentPage) {
    const containerWidth = 880;
    const gap = 10;
    const totalGapWidth = (totalPages - 1) * gap;
    const availableWidthForRectangles = containerWidth - totalGapWidth;
    const rectangleWidth = availableWidthForRectangles / totalPages;

    const rectanglesContainer = new GUI.Rectangle();
    rectanglesContainer.width = containerWidth + "px";
    rectanglesContainer.height = "5px";
    rectanglesContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    rectanglesContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    rectanglesContainer.top = "257px";
    rectanglesContainer.left = "0px";
    rectanglesContainer.thickness = 0;
    cardContainer.addControl(rectanglesContainer);

    // Create rectangles for each page
    for (let i = 0; i < totalPages; i++) {
        const rectangle = new GUI.Rectangle();
        rectangle.width = rectangleWidth + "px";
        rectangle.height = "5px";
        rectangle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        rectangle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        rectangle.left = (i * (rectangleWidth + gap)) + "px";
        rectangle.thickness = 0;
        rectangle.background = i === currentPage ? "#50D7F4" : "#030A13";
        rectanglesContainer.addControl(rectangle);
    }
}


function addCardToDeck(card, cardGraphic) {
    if (GUIscene.buildMode && GUIscene.newDeck.cards.length < deckSize) {
        GUIscene.newDeck.cards.push(card);
        const miniCard = createMiniCard(card);
        card.miniCard = miniCard;
        miniCardContainer.addControl(miniCard);
        updateMiniCardPositions();

        // Fade out the card graphic and disable clickability
        cardGraphic.alpha = 0.2;
        cardGraphic.isEnabled = false;
        cardGraphic.isHitTestVisible = false;

        // Store the original position and zIndex of the card graphic
        card.originalPosition = { ...card.currentPosition };
        card.originalZIndex = card.zIndex;
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

function updateMiniDeckPositions(){
    for(let i = 0; i < miniCardContainer.miniDecks.length; i++){
        miniCardContainer.miniDecks[i].top = (i * 50)-((miniCardContainer.miniDecks.length-1) * 50/2) + "px";
        miniCardContainer.height = (miniCardContainer.miniDecks.length * 50) + "px";
        miniCardContainer.top = (miniCardContainer.miniDecks.length * 50) / 2 + "px";
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

        // Restore the card graphic's visibility and clickability
        const cardGraphic = cardContainer.children.find(child => child.card === card);
        if (cardGraphic) {
            cardGraphic.alpha = 1;
            cardGraphic.isEnabled = true;
            cardGraphic.isHitTestVisible = true;
        }
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

    // Restore the original position and zIndex of the cards in the new deck
    if(GUIscene.newDeck){
        GUIscene.newDeck.cards.forEach(card => {
            const cardGraphic = cardContainer.children.find(child => child.card === card);
            if (cardGraphic) {
                cardGraphic.alpha = 0.2;
                cardGraphic.isEnabled = false;
                cardGraphic.isHitTestVisible = false;
                cardGraphic.currentPosition = { ...card.originalPosition };
                cardGraphic.zIndex = card.originalZIndex;
            }
        });
    }
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

    const cardTextContainer = new GUI.Rectangle();
    cardTextContainer.thickness = 0;

    //Card description text
    const cardDescription = new GUI.TextBlock();
    cardDescription.textWrapping = true;
    cardDescription.width = "600px";
    cardDescription.text = card.description;
    cardDescription.color = "white";
    cardDescription.fontSize = 30;
    cardDescription.fontFamily = "GemunuLibre-Medium";
    cardDescription.top = "0px";
    cardDescription.left = "200px";
    cardDescription.zIndex = 2;
    cardTextContainer.addControl(cardDescription);


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
                effectsText.top = 80 + lineHeight + "px";
                effectsText.left = column === 0 ? "100px" : "200px";
                effectsText.scaleX = 1;
                effectsText.fontFamily = "GemunuLibre-Medium";
                effectsText.zIndex = 10;
                cardTextContainer.addControl(effectsText);
                lineHeight += 35;
                if (lineHeight > 80) {
                    lineHeight = 0;
                    column++;
                }
            }
        }
    }

    cardTextContainer.zIndex = 20;

    //Create building shape graphic
    //const buildingShape = createBuildingShapeGraphic(card);

    //Animate Card Description fade in
    cardTextContainer.alpha = 0;
    const fadeInAnimationText = new BABYLON.Animation("fadeIn", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const fadeInKeysText = [
        { frame: 0, value: 0 },
        { frame: 50, value: 1 },
    ];
    fadeInAnimationText.setKeys(fadeInKeysText);
    cardTextContainer.animations = [];
    cardTextContainer.animations.push(fadeInAnimationText);
    GUIscene.beginAnimation(cardTextContainer, 0, 50, false, 1);

    container.addControl(cardTextContainer);

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