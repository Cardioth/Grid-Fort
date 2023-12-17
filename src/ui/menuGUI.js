import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { setCurrentScene } from "../managers/sceneManager.js";

export function createMenuScreen(){
    const menuScreen = new GUI.Rectangle();
    menuScreen.width = "100%";
    menuScreen.height = "100%";
    menuScreen.color = "white";
    menuScreen.thickness = 0;
    menuScreen.background = "black";
    menuScreen.alpha = 0.5;

    // Create Menu Text
    const menuText = new GUI.TextBlock();
    menuText.text = "Grid Fort";
    menuText.color = "white";
    menuText.fontSize = 50;
    menuText.fontFamily = "GemunuLibre-Bold";
    menuText.top = -30;
    menuText.left = 0;
    menuScreen.addControl(menuText);

    // Create Play Button
    const playButton = GUI.Button.CreateSimpleButton("playButton", "Play");
    playButton.width = 0.2;
    playButton.height = "40px";
    playButton.color = "white";
    playButton.fontSize = 30;
    playButton.fontFamily = "GemunuLibre-Bold";
    playButton.top = 30;
    playButton.left = 0;
    playButton.thickness = 0;
    playButton.background = "black";
    playButton.onPointerClickObservable.add(() => {
        setCurrentScene("build");
    });
    menuScreen.addControl(playButton);
    GUITexture.addControl(menuScreen);
    return menuScreen;
}