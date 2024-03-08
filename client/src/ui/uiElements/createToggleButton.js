import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { getImage } from "../../graphics/loadImages.js";
import { GUIscene } from "../../graphics/sceneInitialization.js";


export function createToggleButton(text, functionToCall) {
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "150px";
    container.height = "35px";

    // Create Button Base
    const buttonGraphic = new GUI.Image("emptyCheckButton", getImage("checkButton.png"));
    buttonGraphic.width = "129px";
    buttonGraphic.height = "33px";
    container.addControl(buttonGraphic);

    // Create Button Selected Dot
    const buttonDot = new GUI.Image("filledDot", getImage("filledDot.png"));
    buttonDot.width = "20px";
    buttonDot.height = "20px";
    buttonDot.left = "-50px";
    buttonDot.top = "0px";
    buttonDot.zIndex = 3;
    buttonDot.isVisible = false;
    container.addControl(buttonDot);

    // Animate Button Highlight Scale
    const buttonAnimationScaleXUP = new BABYLON.Animation("buttonHighlightAnimationxu", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const buttonAnimationScaleYUP = new BABYLON.Animation("buttonHighlightAnimationyu", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const buttonAnimationScaleXDOWN = new BABYLON.Animation("buttonHighlightAnimationxd", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const buttonAnimationScaleYDOWN = new BABYLON.Animation("buttonHighlightAnimationxyd", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    buttonAnimationScaleXUP.setKeys([
        { frame: 0, value: 1 },
        { frame: 10, value: 1.05 }
    ]);
    buttonAnimationScaleYUP.setKeys([
        { frame: 0, value: 1 },
        { frame: 10, value: 1.05 }
    ]);
    buttonAnimationScaleXDOWN.setKeys([
        { frame: 0, value: 1.05 },
        { frame: 10, value: 1 }
    ]);
    buttonAnimationScaleYDOWN.setKeys([
        { frame: 0, value: 1.05 },
        { frame: 10, value: 1 }
    ]);
    //easing
    let easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    buttonAnimationScaleXUP.setEasingFunction(easingFunction);
    buttonAnimationScaleYUP.setEasingFunction(easingFunction);
    buttonAnimationScaleXDOWN.setEasingFunction(easingFunction);
    buttonAnimationScaleYDOWN.setEasingFunction(easingFunction);
    container.animations = [];
    container.animations.push(buttonAnimationScaleXUP, buttonAnimationScaleYUP, buttonAnimationScaleXDOWN, buttonAnimationScaleYDOWN);

    // Create Button Text
    const buttonText = new GUI.TextBlock();
    buttonText.width = "134px";
    buttonText.height = "33px";
    buttonText.text = text;
    buttonText.color = "white";
    buttonText.fontSize = 17;
    buttonText.fontFamily = "GemunuLibre-Medium";
    container.addControl(buttonText);

    container.onPointerClickObservable.add(() => {
        if(buttonDot.isVisible){
            buttonDot.isVisible = false;
        } else {
            buttonDot.isVisible = true;
        }
        functionToCall();
    });
    container.onPointerEnterObservable.add(function () {
        document.body.style.cursor = 'pointer';
        GUIscene.beginDirectAnimation(container, [container.animations[0], container.animations[1]], 0, 10, false, 1);
    });
    container.onPointerOutObservable.add(function () {
        document.body.style.cursor = 'default';
        GUIscene.beginDirectAnimation(container, [container.animations[2], container.animations[3]], 0, 10, false, 1);
    });

    return container;
}
