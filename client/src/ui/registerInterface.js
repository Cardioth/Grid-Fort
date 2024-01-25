import * as GUI from "@babylonjs/gui";
import { GUITexture, initGUIScene } from '../graphics/sceneInitialization.js';
import { createLoginInterface } from "./loginInterface.js";
import { registerUser } from "../network/registerUser.js";
import { createAuthMessage } from "../network/createAuthMessage.js";


export function createRegisterInterface(){
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
        container.addControl(darkScreen);

        // Create Backing Box
        const backingBox = new GUI.Rectangle();
        backingBox.width = "30%";
        backingBox.height = "60%";
        backingBox.thickness = 1;
        backingBox.background = "black";
        backingBox.alpha = 0.5;
        backingBox.color = "black";
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
        interfaceContainer.addControl(titleText);

        // Create Username Text
        const usernameText = new GUI.TextBlock();
        usernameText.text = "Username";
        usernameText.color = "white";
        usernameText.fontSize = 25;
        usernameText.fontFamily = "GemunuLibre-Bold";
        usernameText.top = -45;
        usernameText.left = 0;
        interfaceContainer.addControl(usernameText);

        // Create Username Input
        const usernameInput = new GUI.InputText();
        usernameInput.width = 0.2;
        usernameInput.maxWidth = 0.2;
        usernameInput.height = "40px";
        usernameInput.color = "white";
        usernameInput.fontSize = 25;
        usernameInput.fontFamily = "GemunuLibre-Bold";
        usernameInput.top = -5;
        usernameInput.left = 0;
        usernameInput.thickness = 0;
        usernameInput.background = "black";
        usernameInput.zIndex = 1000;
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
        interfaceContainer.addControl(passwordText);

        // Create Password Input
        const passwordInput = new GUI.InputPassword();
        passwordInput.width = 0.2;
        passwordInput.height = "40px";
        passwordInput.color = "white";
        passwordInput.fontSize = 25;
        passwordInput.fontFamily = "GemunuLibre-Bold";
        passwordInput.top = 90;
        passwordInput.left = 0;
        passwordInput.thickness = 0;
        passwordInput.background = "black";
        passwordInput.zIndex = 1000;
        passwordInput.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        interfaceContainer.addControl(passwordInput);
        passwordInput.onKeyboardEventProcessedObservable.add((eventData) => {
            if(eventData.key === "Enter" || eventData.key === "Tab"){
                eventData.preventDefault();
                confirmPasswordInput.focus();
            }
        });

        // Confirm Password Text
        const confirmPasswordText = new GUI.TextBlock();
        confirmPasswordText.text = "Confirm Password";
        confirmPasswordText.color = "white";
        confirmPasswordText.fontSize = 25;
        confirmPasswordText.fontFamily = "GemunuLibre-Bold";
        confirmPasswordText.top = 145;
        confirmPasswordText.left = 0;
        interfaceContainer.addControl(confirmPasswordText);

        // Create Confirm Password Input
        const confirmPasswordInput = new GUI.InputPassword();
        confirmPasswordInput.width = 0.2;
        confirmPasswordInput.height = "40px";

        confirmPasswordInput.color = "white";
        confirmPasswordInput.fontSize = 25;
        confirmPasswordInput.fontFamily = "GemunuLibre-Bold";
        confirmPasswordInput.top = 185;
        confirmPasswordInput.left = 0;
        confirmPasswordInput.thickness = 0;
        confirmPasswordInput.background = "black";
        confirmPasswordInput.zIndex = 1000;
        confirmPasswordInput.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        interfaceContainer.addControl(confirmPasswordInput);
        confirmPasswordInput.onKeyboardEventProcessedObservable.add((eventData) => {
            if(eventData.key === "Tab"){
                eventData.preventDefault();
                usernameInput.focus();
            }
            if(eventData.key === "Enter"){
                eventData.preventDefault();
                registerButton.isVisible = false;
                returnToSignInText.isVisible = false;
                register(usernameInput.text, passwordInput.text, confirmPasswordInput.text);
            }
        });
    
        // Create Register Button
        const registerButton = GUI.Button.CreateSimpleButton("registerButton", "Register");
        registerButton.width = 0.12;
        registerButton.height = "40px";
        registerButton.color = "white";
        registerButton.fontSize = 25;
        registerButton.fontFamily = "GemunuLibre-Bold";
        registerButton.top = 255;
        registerButton.left = 100;
        registerButton.thickness = 0;
        registerButton.background = "black";
        registerButton.onPointerClickObservable.add(() => {
            registerButton.isVisible = false;
            returnToSignInText.isVisible = false;
            register(usernameInput.text, passwordInput.text, confirmPasswordInput.text);
        });
        registerButton.onPointerEnterObservable.add(() => {
            document.body.style.cursor = "pointer";
        });
        registerButton.onPointerOutObservable.add(() => {
            document.body.style.cursor = "default";
        });
        interfaceContainer.addControl(registerButton);

        // Return To Sign In Text
        const returnToSignInText = new GUI.TextBlock();
        returnToSignInText.text = "Return to Sign In";
        returnToSignInText.width = .095;
        returnToSignInText.height = "40px";
        returnToSignInText.color = "white";
        returnToSignInText.fontSize = 20;
        returnToSignInText.fontFamily = "GemunuLibre-Medium";
        returnToSignInText.top = 255;
        returnToSignInText.left = -100;
        returnToSignInText.zIndex = 5;
        returnToSignInText.name = "returnToSignInText";
        returnToSignInText.onPointerClickObservable.add(() => {
            initGUIScene();
            createLoginInterface();
            document.body.style.cursor = "default";
        });
        returnToSignInText.onPointerEnterObservable.add(() => {
            document.body.style.cursor = "pointer";
        });
        returnToSignInText.onPointerOutObservable.add(() => {
            document.body.style.cursor = "default";
        });

        interfaceContainer.addControl(returnToSignInText);

        
        GUITexture.addControl(container);
}

function register(username, password, confirmPassword){
    if(password === confirmPassword){
        createAuthMessage("Registering...");
        registerUser(username, password);
    }
    else{
        createAuthMessage("Passwords do not match", unhideRegisterButtons);
    }
}

export function returnToLoginFromRegister(){
    initGUIScene();
    createLoginInterface();
}

export function unhideRegisterButtons(){
    const registerButton = GUITexture.getControlByName("registerButton");
    const returnToSignInText = GUITexture.getControlByName("returnToSignInText");
    registerButton.isVisible = true;
    returnToSignInText.isVisible = true;
}