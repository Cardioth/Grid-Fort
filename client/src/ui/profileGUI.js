import * as GUI from "@babylonjs/gui";
import { GUITexture, GUIscene } from '../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";
import { setCurrentScene } from "../managers/sceneManager.js";
import { fadeToBlack } from "./generalGUI.js";
import { uniCredits } from "../data/config.js";
import { createAlertMessage } from "../network/createAlertMessage.js";
import { createCustomButton } from "./createCustomButton.js";
import { connectWallet } from "../network/solana/connectWallet.js";
import { socket } from "../network/connect.js";

export function createProfileInterface(){
    const profile = JSON.parse(localStorage.getItem("profile"));

    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    // Create Black Screen
    const blackScreen = new GUI.Rectangle();
    blackScreen.width = "100%";
    blackScreen.height = "100%";
    blackScreen.thickness = 0;
    blackScreen.background = "black";
    blackScreen.alpha = 0.5;
    container.addControl(blackScreen);

    // Create Backing Box
    const backingBox = new GUI.Rectangle();
    backingBox.width = "300px";
    backingBox.height = "300px";
    backingBox.thickness = 1;
    backingBox.background = "black";
    backingBox.alpha = 0.5;
    backingBox.color = "black";
    container.addControl(backingBox);

    // Create Title
    const titleText = new GUI.TextBlock();
    titleText.text = "Profile";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = "-45%";
    titleText.left = 0;
    container.addControl(titleText);

    // Create Username Text
    const usernameText = new GUI.TextBlock();
    usernameText.text = "Username: " + profile.username.charAt(0).toUpperCase() + profile.username.slice(1);
    usernameText.color = "white";
    usernameText.fontSize = 25;
    usernameText.fontFamily = "GemunuLibre-Bold";
    usernameText.top = "-50px";
    usernameText.left = 0;
    container.addControl(usernameText);

    // Create Credits Text
    const creditsText = new GUI.TextBlock();
    creditsText.text = "Credits: " + profile.uniCredits;
    creditsText.color = "white";
    creditsText.fontSize = 25;
    creditsText.fontFamily = "GemunuLibre-Bold";
    creditsText.top = "0px";
    creditsText.left = 0;
    container.addControl(creditsText);

    if(profile.wallet === "unlinked"){
        // Create Link Wallet Button
        createLinkWalletButton(container);
    } else {
        // Create Wallet Address Text
        createWalletAddressAndUnlinkButton();
    }

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

export function createWalletAddressAndUnlinkButton() {
    // Create Container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "300px";
    container.height = "300px";
    container.zIndex = 3;

    // Create Wallet Address Text
    const walletAddressText = new GUI.TextBlock();
    walletAddressText.text = "Wallet Connected";
    walletAddressText.color = "white";
    walletAddressText.fontSize = 25;
    walletAddressText.fontFamily = "GemunuLibre-Medium";
    walletAddressText.top = "50px";
    walletAddressText.left = 0;
    container.addControl(walletAddressText);

    // Create Unlink Wallet Button
    // const unlinkWalletButton = createCustomButton("Unlink", () => {
    //     socket.emit("unlinkWallet");
    //     localStorage.removeItem('solanaPublicKey');
    // });
    // unlinkWalletButton.top = "100px";
    // unlinkWalletButton.left = "0px";
    // container.addControl(unlinkWalletButton);

    // socket.on("unlinkWalletResponse", (response) => {
    //     if (response === true) {
    //         createLinkWalletButton();
    //         container.dispose();
    //         createAlertMessage("Wallet unlinked successfully");
    //     } else {
    //         createAlertMessage("Error unlinking wallet");
    //     }
    // });

    GUITexture.addControl(container);
}

export function hideLinkWalletButton(){
    const linkWalletButton = GUITexture.getControlByName("linkWalletButton");
    linkWalletButton.isVisible = false;

}

function createLinkWalletButton() {
    const linkWalletButton = createCustomButton("Link Wallet", () => {
        connectWallet();
    });
    linkWalletButton.name = "linkWalletButton";
    linkWalletButton.top = "50px";
    linkWalletButton.left = "0px";
    linkWalletButton.zIndex = 3;
    GUITexture.addControl(linkWalletButton);
}
