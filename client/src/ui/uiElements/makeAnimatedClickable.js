import { GUIscene } from '../../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";

export function makeAnimatedClickable(clickableObject, clickFunction) {
    clickableObject.originalScaleX = clickableObject.scaleX;
    clickableObject.originalScaleY = clickableObject.scaleY;

    // Animate Button Highlight Scale
    const clickableObjectScaleXUP = new BABYLON.Animation("buttonHighlightAnimationXUP", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleYUP = new BABYLON.Animation("buttonHighlightAnimationYUP", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleXDOWN = new BABYLON.Animation("buttonHighlightAnimationXDOWN", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleYDOWN = new BABYLON.Animation("buttonHighlightAnimationXDOWN", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    clickableObjectScaleXUP.setKeys([
        { frame: 0, value: clickableObject.originalScaleX },
        { frame: 10, value: clickableObject.originalScaleX * 1.1 }
    ]);
    clickableObjectScaleYUP.setKeys([
        { frame: 0, value: clickableObject.originalScaleX },
        { frame: 10, value: clickableObject.originalScaleY * 1.1 }
    ]);
    clickableObjectScaleXDOWN.setKeys([
        { frame: 0, value: clickableObject.originalScaleX * 1.1 },
        { frame: 10, value: clickableObject.originalScaleX }
    ]);
    clickableObjectScaleYDOWN.setKeys([
        { frame: 0, value: clickableObject.originalScaleY * 1.1 },
        { frame: 10, value: clickableObject.originalScaleY }
    ]);
    //easing
    let easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    clickableObjectScaleXUP.setEasingFunction(easingFunction);
    clickableObjectScaleYUP.setEasingFunction(easingFunction);
    clickableObjectScaleXDOWN.setEasingFunction(easingFunction);
    clickableObjectScaleYDOWN.setEasingFunction(easingFunction);
    clickableObject.animations = [];
    clickableObject.animations.push(clickableObjectScaleXUP, clickableObjectScaleYUP, clickableObjectScaleXDOWN, clickableObjectScaleYDOWN);

    // Create Card Mouse Events
    clickableObject.onPointerEnterObservable.add(() => {
        if (clickableObject.isAnimating) return;
        clickableObject.isAnimating = true;
        clickableObject.scaleX = clickableObject.originalScaleX * 1.1;
        clickableObject.scaleY = clickableObject.originalScaleY * 1.1;
        document.body.style.cursor = 'pointer';
        GUIscene.beginDirectAnimation(clickableObject, [clickableObject.animations[0], clickableObject.animations[1]], 0, 10, false, 1);
    });

    clickableObject.onPointerOutObservable.add(() => {
        clickableObject.isAnimating = false;
        clickableObject.scaleX = clickableObject.originalScaleX;
        clickableObject.scaleY = clickableObject.originalScaleY;
        document.body.style.cursor = 'default';
        GUIscene.beginDirectAnimation(clickableObject, [clickableObject.animations[2], clickableObject.animations[3]], 0, 10, false, 1);
    });

    clickableObject.onPointerClickObservable.add(() => {
        clickFunction();
    });
}
