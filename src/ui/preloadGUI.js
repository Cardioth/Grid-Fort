import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';

export function createPreloadScreen(){
    const menuScreen = new GUI.Rectangle();
    menuScreen.width = "100%";
    menuScreen.height = "100%";
    menuScreen.thickness = 0;
    menuScreen.background = "black";
    menuScreen.alpha = 0.5;

    // Create Loading Text
    const menuText = new GUI.TextBlock();
    menuText.text = "Loading...";
    menuText.color = "white";
    menuText.fontSize = 50;
    menuText.fontFamily = "GemunuLibre-Bold";
    menuScreen.addControl(menuText);

    GUITexture.addControl(menuScreen);

    return menuScreen;
}