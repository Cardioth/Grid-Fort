import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";


export function createAlertMessage(messageText, endOfMessageFunction, displayTime = 30, backing = false) {
    // Remove any previous message text blocks
    const previousMessage = GUITexture.getControlByName("messageText");
    if (previousMessage) {
        previousMessage.dispose();
    }
    const message = new GUI.TextBlock();
    message.width = "600px";
    message.height = "40px";
    message.text = messageText;
    message.color = "white";
    message.fontSize = 20;
    message.fontFamily = "GemunuLibre-Medium";
    message.top = 210;
    message.left = 0;
    message.zIndex = 9;
    message.name = "messageText";

    const animation = new BABYLON.Animation("messageAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 1 },
        { frame: displayTime, value: 1 },
        { frame: displayTime+30, value: 0 },
    ];
    animation.setKeys(keys);
    message.animations = [];
    message.animations.push(animation);
    GUIscene.beginAnimation(message, 0, displayTime+30, false, 1, () => {
        message.dispose();
        if (endOfMessageFunction) {
            endOfMessageFunction();
        }
    });

    GUITexture.addControl(message);
}
