import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { returnToBuildScene } from "../gameplay/endBattle.js";

export function createEndBattleScreen(victory){
    //container
    const container = new GUI.Rectangle();
    container.width = "100%";
    container.height = "100%";
    container.thickness = 0;

    const endBattleScreen = new GUI.Rectangle();
    endBattleScreen.width = "100%";
    endBattleScreen.height = "100%";
    endBattleScreen.thickness = 0;
    endBattleScreen.background = "black";
    endBattleScreen.alpha = 0.3;
    endBattleScreen.zIndex = 101;

    const victoryText = new GUI.TextBlock();

    if(victory){
        victoryText.text = "Victory!";
    } else {
        victoryText.text = "Defeat!";
    }
    victoryText.color = "white";
    victoryText.fontSize = 48;
    victoryText.fontFamily = "GemunuLibre-Bold";
    victoryText.zIndex = 102;
    victoryText.alpha = 1;
    victoryText.top = "-5%";
    container.addControl(victoryText);
 

    const endBattleButton = GUI.Button.CreateSimpleButton("endBattleButton", "Continue");
    endBattleButton.width = "10%";
    endBattleButton.height = "40px";
    endBattleButton.color = "white";
    endBattleButton.fontSize = 30;
    endBattleButton.fontFamily = "GemunuLibre-Bold";
    endBattleButton.background = "black";
    endBattleButton.thickness = 0;
    endBattleButton.zIndex = 103;
    endBattleButton.top = "5%";
    endBattleButton.onPointerUpObservable.add(function(){
        returnToBuildScene();
        container.dispose();
    });

    container.addControl(endBattleScreen);
    container.addControl(endBattleButton);
    GUITexture.addControl(container);

    return endBattleScreen;
}