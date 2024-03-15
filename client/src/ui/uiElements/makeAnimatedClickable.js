import { GUIscene } from '../../graphics/sceneInitialization.js';
import * as BABYLON from "@babylonjs/core";

export function makeAnimatedClickable(clickableObject, clickFunction, scaleUp = 1.1) {
    clickableObject.originalScaleX = clickableObject.scaleX;
    clickableObject.originalScaleY = clickableObject.scaleY;

    // Animate Button Highlight Scale
    const clickableObjectScaleXUP = new BABYLON.Animation("buttonHighlightAnimationXUP", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleYUP = new BABYLON.Animation("buttonHighlightAnimationYUP", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleXDOWN = new BABYLON.Animation("buttonHighlightAnimationXDOWN", "scaleX", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const clickableObjectScaleYDOWN = new BABYLON.Animation("buttonHighlightAnimationXDOWN", "scaleY", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    clickableObjectScaleXUP.setKeys([
        { frame: 0, value: clickableObject.originalScaleX },
        { frame: 10, value: clickableObject.originalScaleX * scaleUp }
    ]);
    clickableObjectScaleYUP.setKeys([
        { frame: 0, value: clickableObject.originalScaleX },
        { frame: 10, value: clickableObject.originalScaleY * scaleUp }
    ]);
    clickableObjectScaleXDOWN.setKeys([
        { frame: 0, value: clickableObject.originalScaleX * scaleUp },
        { frame: 10, value: clickableObject.originalScaleX }
    ]);
    clickableObjectScaleYDOWN.setKeys([
        { frame: 0, value: clickableObject.originalScaleY * scaleUp },
        { frame: 10, value: clickableObject.originalScaleY }
    ]);
    //easing
    let easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    clickableObjectScaleXUP.setEasingFunction(easingFunction);
    clickableObjectScaleYUP.setEasingFunction(easingFunction);
    clickableObjectScaleXDOWN.setEasingFunction(easingFunction);
    clickableObjectScaleYDOWN.setEasingFunction(easingFunction);
    clickableObject.animations = [];
    clickableObject.animations.push(clickableObjectScaleXUP, clickableObjectScaleYUP, clickableObjectScaleXDOWN, clickableObjectScaleYDOWN);

    clickableObject.originalZIndex = clickableObject.zIndex;

    // Create Card Mouse Events
    clickableObject.onPointerEnterObservable.add(() => {
        if (clickableObject.isAnimating) return;
        clickableObject.isAnimating = true;
        clickableObject.scaleX = clickableObject.originalScaleX * 1.1;
        clickableObject.scaleY = clickableObject.originalScaleY * 1.1;
        clickableObject.zIndex = 100;
        document.body.style.cursor = 'pointer';
        GUIscene.beginDirectAnimation(clickableObject, [clickableObject.animations[0], clickableObject.animations[1]], 0, 10, false, 1);
    });

    clickableObject.onPointerOutObservable.add(() => {
        clickableObject.isAnimating = false;
        clickableObject.scaleX = clickableObject.originalScaleX;
        clickableObject.scaleY = clickableObject.originalScaleY;
        clickableObject.zIndex = clickableObject.originalZIndex;
        document.body.style.cursor = 'default';
        GUIscene.beginDirectAnimation(clickableObject, [clickableObject.animations[2], clickableObject.animations[3]], 0, 10, false, 1);
    });

    clickableObject.onPointerClickObservable.add(() => {
        document.body.style.cursor = 'default';
        clickFunction();
    });
}
