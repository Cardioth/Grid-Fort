import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../../../common/data/config.js";
import { signOutUser } from "../network/signOutUser.js";
import { privs, socket } from "../network/connect.js";
import { createAlertMessage } from "../network/createAlertMessage.js";
import { getImage } from "../graphics/loadImages.js";
import { serverUrl } from "../network/serverURL.js";
import { setCollection } from "../managers/collectionManager.js";
import { createAdminPanel } from "./createAdminPanel.js";
import { createCustomButton } from "./createCustomButton.js";

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
        document.body.style.cursor='pointer'
        socket.emit("getCollection");
        socket.once("getCollectionResponse", (response) => {
            setCollection(response);
            fadeToBlack(() => {
                setCurrentScene("collection");
            });
        });
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

function createStartGameDialogue(){
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
    const startGameDialogueBacking = new GUI.Image("startGameDialogueBacking", getImage("startGameBacking.png"));
    startGameDialogueBacking.width = "413px";
    startGameDialogueBacking.height = "124px";
    startGameDialogueBacking.top = "65px";
    container.addControl(startGameDialogueBacking);

    // Create Start Game Button
    let startingGame = false;
    const startButton = createCustomButton("Start", () => {
        if(startingGame) return;
        startingGame = true;
        socket.emit("startGame");
        socket.once("startGameResponse", (response) => {
            if (response) {
                fadeToBlack(() => {
                    setCurrentScene("build");
                });
            } else {
                createAlertMessage("Not enough credits");
                startingGame = false;
            }
        });
    });
    startButton.left = "95px";
    startButton.top = "59px";
    container.addControl(startButton);

    // Create Cancel Button
    const cancelButton = new GUI.Image("cancelButton", getImage("cancelButton.png"));
    cancelButton.width = "14px";
    cancelButton.height = "14px";
    cancelButton.left = "188px";
    cancelButton.top = "23px";
    container.addControl(cancelButton);
    cancelButton.onPointerClickObservable.add(() => {
        //Animate container fade out
        const animation2 = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys2 = [
            { frame: 0, value: 1 },
            { frame: 10, value: 0 },
        ];
        animation2.setKeys(keys2);
        container.animations = [];
        container.animations.push(animation2);
        GUIscene.beginAnimation(container, 0, 10, false, 1, () => {
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

    // Create Credits Text
    const creditsText = new GUI.TextBlock();
    creditsText.width = "50px";
    creditsText.height = "40px";
    creditsText.text = "50uC";
    creditsText.color = "#57CDFF";
    creditsText.fontSize = 25;
    creditsText.fontFamily = "GemunuLibre-Medium";
    creditsText.top = "59px";
    creditsText.left = "-100px";
    container.addControl(creditsText);

    // Create Credits Icon
    const creditsIcon = new GUI.Image("creditsIcon", getImage("credIcon.png"));
    creditsIcon.width = "103px";
    creditsIcon.height = "69px";
    creditsIcon.top = "59px";
    creditsIcon.left = "-150px";
    creditsIcon.scaleX = 0.6;
    creditsIcon.scaleY = 0.6;
    container.addControl(creditsIcon);

    //Animate container fade in
    const animation = new BABYLON.Animation("fadeAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 0 },
        { frame: 10, value: 1 },
    ];
    animation.setKeys(keys);
    container.animations = [];
    container.animations.push(animation);
    GUIscene.beginAnimation(container, 0, 10, false, 1);

    GUITexture.addControl(container);

}

function setProfileData(data){
    const profile = {
        username: data.username,
        wallet: data.wallet,
        uniCredits: data.uniCredits,
    };
    console.log(data);
    localStorage.setItem("profile", JSON.stringify(profile));
}