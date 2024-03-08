import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture, initGUIScene } from '../../graphics/sceneInitialization.js';
import { GUIscene } from "../../graphics/sceneInitialization.js";
import { createRegisterInterface } from "./registerInterface.js";
import { loginUser } from "../../network/loginUser.js";
import { createCustomButton } from "./createCustomButton.js";


export function createLoginInterface(){
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;

    // Darken Screen
    const darkScreen = new GUI.Rectangle();
    darkScreen.width = "100%";
    darkScreen.height = "100%";
    darkScreen.thickness = 0;
    darkScreen.background = "black";
    darkScreen.alpha = 0.5;
    darkScreen.zIndex = 1;
    container.addControl(darkScreen);

    // Create Backing Box
    const backingBox = new GUI.Rectangle();
    backingBox.width = "500px";
    backingBox.height = "500px";
    backingBox.thickness = 1;
    backingBox.background = "black";
    backingBox.alpha = 0.5;
    backingBox.color = "black";
    backingBox.zIndex = 2;
    container.addControl(backingBox);

    // Interface Container
    const interfaceContainer = new GUI.Rectangle();
    interfaceContainer.thickness = 0;
    interfaceContainer.zIndex = 3;
    interfaceContainer.top = -45;
    container.addControl(interfaceContainer);

    // Create Title Text
    const titleText = new GUI.TextBlock();
    titleText.text = "Grid Fort";
    titleText.color = "white";
    titleText.fontSize = 50;
    titleText.fontFamily = "GemunuLibre-Bold";
    titleText.top = -132;
    titleText.left = 0;
    titleText.zIndex = 3;
    interfaceContainer.addControl(titleText);

    // Create Username Text
    const usernameText = new GUI.TextBlock();
    usernameText.text = "Username";
    usernameText.color = "white";
    usernameText.fontSize = 25;
    usernameText.fontFamily = "GemunuLibre-Bold";
    usernameText.top = -45;
    usernameText.left = 0;
    usernameText.zIndex = 4;
    interfaceContainer.addControl(usernameText);

    // Create Username Input
    const usernameInput = new GUI.InputText();
    usernameInput.width = "300px";
    usernameInput.height = "40px";
    usernameInput.color = "white";
    usernameInput.fontSize = 25;
    usernameInput.fontFamily = "GemunuLibre-Medium";
    usernameInput.top = -5;
    usernameInput.left = 0;
    usernameInput.thickness = 0;
    usernameInput.background = "black";
    usernameInput.zIndex = 101;
    usernameInput.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    interfaceContainer.addControl(usernameInput);
    usernameInput.onKeyboardEventProcessedObservable.add((eventData) => {
        if(eventData.key === "Enter" || eventData.key === "Tab"){
            eventData.preventDefault();
            passwordInput.focus();
        }
    });

    // Create Password Text
    const passwordText = new GUI.TextBlock();
    passwordText.text = "Password";
    passwordText.color = "white";
    passwordText.fontSize = 25;
    passwordText.fontFamily = "GemunuLibre-Bold";
    passwordText.top = 50;
    passwordText.left = 0;
    passwordText.zIndex = 5;
    interfaceContainer.addControl(passwordText);

    // Create Password Input
    const passwordInput = new GUI.InputPassword();
    passwordInput.width = "300px";
    passwordInput.height = "40px";
    passwordInput.color = "white";
    passwordInput.fontSize = 25;
    passwordInput.fontFamily = "GemunuLibre-Medium";
    passwordInput.top = 90;
    passwordInput.left = 0;
    passwordInput.thickness = 0;
    passwordInput.background = "black";
    passwordInput.zIndex = 100;
    passwordInput.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    interfaceContainer.addControl(passwordInput);
    passwordInput.onKeyboardEventProcessedObservable.add((eventData) => {
        if(eventData.key === "Tab"){
            eventData.preventDefault();
            usernameInput.focus();
        }
        if(eventData.key === "Enter"){
            eventData.preventDefault();
            loginButton.isVisible = false;
            registerText.isVisible = false;
            loginUser(usernameInput.text, passwordInput.text);
        }
    });

    // Create Login Button
    const loginButton = createCustomButton("Login", () => {
        loginButton.isVisible = false;
        registerText.isVisible = false;
        loginUser(usernameInput.text, passwordInput.text);
    });
    loginButton.top = 180;
    loginButton.left = 0;
    loginButton.zIndex = 102;
    loginButton.name = "loginButton";
    interfaceContainer.addControl(loginButton);

    // Register Button
    const registerText = new GUI.TextBlock();
    registerText.text = "Register";
    registerText.width = "200px";
    registerText.height = "40px";
    registerText.color = "white";
    registerText.fontSize = 20;
    registerText.fontFamily = "GemunuLibre-Medium";
    registerText.top = 255;
    registerText.left = 0;
    registerText.zIndex = 9;
    registerText.name = "registerText";
    registerText.onPointerClickObservable.add(() => {
        initGUIScene();
        createRegisterInterface();
        document.body.style.cursor = "default";
    });
    registerText.onPointerEnterObservable.add(() => {
        document.body.style.cursor = "pointer";
    });
    registerText.onPointerOutObservable.add(() => {
        document.body.style.cursor = "default";
    });
    interfaceContainer.addControl(registerText);
            
    GUITexture.addControl(container);
}

export function unhideLoginButtons(){
    const loginButton = GUITexture.getControlByName("loginButton");
    const registerText = GUITexture.getControlByName("registerText");
    loginButton.isVisible = true;
    registerText.isVisible = true;
}