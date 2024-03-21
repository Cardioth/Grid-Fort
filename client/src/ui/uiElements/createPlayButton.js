import { GUIscene } from '../../graphics/sceneInitialization.js';
import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { getImage } from '../../graphics/loadImages.js';

export function createPlayButton(clickFunction) {
    // Create container container
    const containerContainer = new GUI.Rectangle();
    containerContainer.thickness = 0;
    containerContainer.width = "355px";
    containerContainer.height = "85px";
    containerContainer.isEnabled = true;

    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "355px";
    container.height = "75px";
    container.isEnabled = true;

    // Create Button Base
    const buttonGraphicBack = new GUI.Image("playButtonBackground", getImage("playButtonBack.png"));
    buttonGraphicBack.width = "355px";
    buttonGraphicBack.height = "75px";
    container.addControl(buttonGraphicBack);

    // Create Middle Container
    const middleContainer = new GUI.Rectangle();
    middleContainer.thickness = 0;
    middleContainer.width = "333px";
    middleContainer.height = "45px";

    // Create Button Middle
    const buttonGraphicMiddle = new GUI.Image("playButtonMiddle", getImage("playButtonMiddle.png"));
    buttonGraphicMiddle.width = "666px";
    buttonGraphicMiddle.height = "45px";
    buttonGraphicMiddle.alpha = 0.0;
    middleContainer.addControl(buttonGraphicMiddle);

    container.addControl(middleContainer);

    // Create Button Front
    const buttonGraphicFront = new GUI.Image("playButtonFront", getImage("playButtonFront.png"));
    buttonGraphicFront.width = "355px";
    buttonGraphicFront.height = "75px";
    container.addControl(buttonGraphicFront);

    //Animation

    // Animate Button Middle Alpha
    const buttonAnimationAlphaUP = new BABYLON.Animation("buttonHighlightAnimationAlphaUP", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const buttonAnimationAlphaDOWN = new BABYLON.Animation("buttonHighlightAnimationAlphaDOWN", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    buttonAnimationAlphaUP.setKeys([
        { frame: 0, value: 0.0 },
        { frame: 10, value: 1 }
    ]);
    buttonAnimationAlphaDOWN.setKeys([
        { frame: 0, value: 1 },
        { frame: 10, value: 0.0 }
    ]);
    let easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    buttonAnimationAlphaUP.setEasingFunction(easingFunction);
    buttonAnimationAlphaDOWN.setEasingFunction(easingFunction);
    buttonGraphicMiddle.animations = [];
    buttonGraphicMiddle.animations.push(buttonAnimationAlphaUP, buttonAnimationAlphaDOWN);

    // Animate Button Middle Left cycle on Mouse over
    const buttonAnimationMiddleScrolling = new BABYLON.Animation("buttonHighlightAnimationMiddleScroll", "left", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    buttonAnimationMiddleScrolling.setKeys([
        { frame: 0, value: 151 },
        { frame: 60, value: -151 }
    ]);
    buttonGraphicMiddle.animations.push(buttonAnimationMiddleScrolling);

    GUIscene.beginDirectAnimation(buttonGraphicMiddle, [buttonGraphicMiddle.animations[2]], 0, 60, true, 1);

    // Animate Button Top Move UP on Mouse over
    const buttonAnimationTopUP = new BABYLON.Animation("buttonHighlightAnimationTopUP", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const buttonAnimationTopDOWN = new BABYLON.Animation("buttonHighlightAnimationTopDOWN", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    buttonAnimationTopUP.setKeys([
        { frame: 0, value: 0 },
        { frame: 15, value: -3 }
    ]);
    buttonAnimationTopDOWN.setKeys([
        { frame: 0, value: -3 },
        { frame: 15, value: 0 }
    ]);
    buttonAnimationTopUP.setEasingFunction(easingFunction);
    buttonAnimationTopDOWN.setEasingFunction(easingFunction);
    container.animations = [];
    container.animations.push(buttonAnimationTopUP, buttonAnimationTopDOWN);


    

    // Create Card Mouse Events
    container.onPointerEnterObservable.add(() => {
        if (container.isAnimating || !container.isEnabled) return;
        container.isAnimating = true;
        document.body.style.cursor = 'pointer';
        GUIscene.beginDirectAnimation(buttonGraphicMiddle, [buttonGraphicMiddle.animations[0]], 0, 10, false, 1);
        GUIscene.beginDirectAnimation(container, [container.animations[0]], 0, 15, false, 1)
    });

    container.onPointerOutObservable.add(() => {
        if (!container.isEnabled) return;
        container.isAnimating = false;
        document.body.style.cursor = 'default';
        GUIscene.beginDirectAnimation(buttonGraphicMiddle, [buttonGraphicMiddle.animations[1]], 0, 10, false, 1);
        GUIscene.beginDirectAnimation(container, [container.animations[1]], 0, 15, false, 1);
    });

    container.onPointerClickObservable.add(() => {
        if (!container.isEnabled) return;
        document.body.style.cursor = 'default';
        clickFunction();
    });

    containerContainer.addControl(container);

    return containerContainer;
}
