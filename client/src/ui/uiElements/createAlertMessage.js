import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from '../../graphics/sceneInitialization.js';
import { GUIscene } from "../../graphics/sceneInitialization.js";


export function createAlertMessage(messageText, endOfMessageFunction = null, displayTime = 30, backing = false) {
    // Remove any previous message text blocks
    const previousMessage = GUITexture.getControlByName("alertMessageContainer");
    if (previousMessage) {
        previousMessage.dispose();
    }

    // Container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.name = "alertMessageContainer";
    container.zIndex = 1000;
    container.isHitTestVisible = false;

    if(backing){
        const backingBox = new GUI.Rectangle();
        backingBox.width = "300px";
        backingBox.height = "50px";
        backingBox.thickness = 0;
        backingBox.background = "black";
        backingBox.alpha = 0.9;
        backingBox.zIndex = 8;
        container.addControl(backingBox);
    }

    const message = new GUI.TextBlock();
    message.width = "300px";
    message.height = "40px";
    message.text = messageText;
    message.color = "white";
    message.fontSize = 20;
    message.fontFamily = "GemunuLibre-Medium";
    if(backing){
        message.top = 0;
    } else {
        message.top = 210;
    }
    message.left = 0;
    message.zIndex = 9;
    message.name = "messageText";
    message.isHitTestVisible = false;
    container.addControl(message);

    const animation = new BABYLON.Animation("messageAnimation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
        { frame: 0, value: 1 },
        { frame: displayTime, value: 1 },
        { frame: displayTime+30, value: 0 },
    ];
    animation.setKeys(keys);
    container.animations = [animation];
    GUIscene.beginAnimation(container, 0, displayTime+30, false, 1, () => {
        container.dispose();
        if (endOfMessageFunction) {
            endOfMessageFunction();
        }
    });
    GUITexture.addControl(container);
}
