import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../../../common/data/config.js";
import { signOutUser } from "../network/signOutUser.js";
import { fetchingCollection, privs, setFetchingCollection, socket } from "../network/connect.js";
import { getImage } from "../graphics/loadImages.js";
import { createAdminPanel } from "./uiElements/createAdminPanel.js";
import { createCustomButton } from "./uiElements/createCustomButton.js";
import { createLoadingIconScreen } from "./uiElements/createLoadingIconScreen.js";
import { createStartGameDialogue } from "./uiElements/createStartGameDialogue.js";

export function createMenuScreen(){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    const menuScreen = new GUI.Rectangle();
    menuScreen.width = "100%";
    menuScreen.height = "100%";
    menuScreen.thickness = 0;
    menuScreen.background = "black";
    menuScreen.alpha = 0.5;
    container.addControl(menuScreen);

    // Create Game Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Grid Fort";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = -30;
    titleText.left = 0;
    container.addControl(titleText);

    // Create Play Button
    const playButton = createCustomButton("Play", () => {
        createStartGameDialogue();
    });
    playButton.top = 30;
    playButton.left = 0;
    playButton.name = "playButton";
    container.addControl(playButton);

    // Create Collection Button
    const collectionButton = createCustomButton("Collection", () => {
        hideMenuButtons();
        goToCollection(container);
    });
    collectionButton.top = 80;
    collectionButton.left = 0;
    collectionButton.name = "collectionButton";
    container.addControl(collectionButton);

    // Create Profile Button
    const profileButton = createCustomButton("Profile", () => {
        hideMenuButtons();
        document.body.style.cursor='pointer'
        socket.emit("getProfile");
        socket.once("getProfileResponse", (response) => {
            setProfileData(response);
            fadeToBlack(() => {
                setCurrentScene("profile");
            });
        });
    });
    profileButton.top = 130;
    profileButton.left = 0;
    profileButton.name = "profileButton";
    container.addControl(profileButton);

    // Sign Out Button
    const signOutButton = createCustomButton("Sign Out", () => {
        hideMenuButtons();
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
    uniCreditsText.text = uniCredits + "uC";
    uniCreditsText.color = "white";
    uniCreditsText.fontSize = 25;
    uniCreditsText.fontFamily = "GemunuLibre-Medium";
    uniCreditsText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    uniCreditsText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    uniCreditsText.top = "-20px";
    uniCreditsText.left = "-150px";
    uniCreditsText.name = "uniCreditsText";
    container.addControl(uniCreditsText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    creditsIcon.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    creditsIcon.top = "-5px";
    creditsIcon.left = "-240px";
    creditsIcon.scaleX = 0.6;
    creditsIcon.scaleY = 0.6;
    container.addControl(creditsIcon);
    
    GUITexture.addControl(container);

    if(privs === "admin"){
        createAdminPanel();
    }

    return menuScreen;
}

export function goToCollection() {
    document.body.style.cursor = 'pointer';
    if (fetchingCollection) {
        const loadingScreen = createLoadingIconScreen("Loading Collection...");
        GUITexture.addControl(loadingScreen);
        socket.once("getCollectionResponse", () => {
            getDecks();
            loadingScreen.dispose();
        });
    } else {
        getDecks();
    }
    function getDecks() {
        const loadingScreen = createLoadingIconScreen("Loading Decks...");
        GUITexture.addControl(loadingScreen);
        socket.emit("getDecks");
        socket.once("getDecksResponse", (response) => {
            response.forEach((deck) => {
                deck.deckCards = JSON.parse(deck.deckCards);
            });
            localStorage.setItem("decks", JSON.stringify(response));
            fadeToBlack(() => {
                loadingScreen.dispose();
                setCurrentScene("collection");
            });
        });
    }
}

export function hideMenuButtons(){
    const playButton = GUITexture.getControlByName("playButton");
    const collectionButton = GUITexture.getControlByName("collectionButton");
    const signOutButton = GUITexture.getControlByName("signOutButton");
    const profileButton = GUITexture.getControlByName("profileButton");

    playButton.isVisible = false;
    collectionButton.isVisible = false;
    signOutButton.isVisible = false;
    profileButton.isVisible = false;
}

export function setProfileData(data){
    const profile = {
        username: data.username,
        wallet: data.wallet,
        uniCredits: data.uniCredits,
    };
    localStorage.setItem("profile", JSON.stringify(profile));
}