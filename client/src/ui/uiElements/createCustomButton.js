import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { getImage } from "../../graphics/loadImages.js";
import { GUIscene } from "../../graphics/sceneInitialization.js";


export function createCustomButton(text, functionToCall) {
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "150px";
    container.height = "35px";

    // Create Button Base
    const buttonGraphic = new GUI.Image("emptyButton", getImage("emptyButton.png"));
    buttonGraphic.width = "134px";
    buttonGraphic.height = "33px";
    container.addControl(buttonGraphic);

    // Create Button Highlight
    const buttonHighlight = new GUI.Image("buttonHighlight", getImage("emptyButtonHighlight.png"));
    buttonHighlight.width = "134px";
    buttonHighlight.height = "33px";
    buttonHighlight.isVisible = false;
    container.addControl(buttonHighlight);

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

    buttonHighlight.animations = [];
    buttonHighlight.animations.push(buttonAnimationScaleXUP, buttonAnimationScaleYUP);
    buttonGraphic.animations = [];
    buttonGraphic.animations.push(buttonAnimationScaleXDOWN, buttonAnimationScaleYDOWN);

    // Create Button Text
    const buttonText = new GUI.TextBlock();
    buttonText.width = "134px";
    buttonText.height = "33px";
    buttonText.text = text;
    buttonText.color = "white";
    buttonText.fontSize = 20;
    buttonText.fontFamily = "GemunuLibre-Medium";
    container.addControl(buttonText);

    container.isDisabled = false;

    container.onPointerClickObservable.add(() => {
        if(container.isDisabled) return;
        document.body.style.cursor = 'default';
        functionToCall();
    });
    container.onPointerEnterObservable.add(function () {
        if(container.isDisabled) return;
        document.body.style.cursor = 'pointer';
        buttonHighlight.isVisible = true;
        buttonGraphic.isVisible = false;
        // Play button highlight animation
        GUIscene.beginDirectAnimation(buttonHighlight, [buttonHighlight.animations[0], buttonHighlight.animations[1]], 0, 10, false, 1);
        
    });
    container.onPointerOutObservable.add(function () {
        if(container.isDisabled) return;
        document.body.style.cursor = 'default';
        buttonHighlight.isVisible = false;
        buttonGraphic.isVisible = true;
        // Play button highlight animation
        GUIscene.beginDirectAnimation(buttonGraphic, [buttonGraphic.animations[0], buttonGraphic.animations[1]], 0, 10, false, 1);
    });

    return container;
}