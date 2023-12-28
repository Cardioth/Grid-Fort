import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";
import { availableCredits } from "../gameplay/credits.js";
import { endTurn } from "../gameplay/endTurn.js";
import { currentScene } from "../managers/sceneManager.js";

function createSelectionLine(startPoint,mesh) {
    const line = new GUI.MultiLine();
    line.add({ x: startPoint.x, y: startPoint.y }, mesh);
    line.lineWidth = 3;
    line.dash = [4, 7];
    line.color = "white";
    GUITexture.addControl(line);

    const rect1 = new GUI.Rectangle();
    rect1.width = "20px";
    rect1.height = "20px";
    rect1.cornerRadius = 5;
    rect1.color = "White";
    rect1.thickness = 2;
    GUITexture.addControl(rect1);
    rect1.linkWithMesh(mesh);

    //Put a dot in the middle of the rect1
    const rect2 = new GUI.Rectangle();
    rect2.width = "8px";
    rect2.height = "8px";
    rect2.cornerRadius = 4;
    rect2.color = "White";
    rect2.background = "White";
    rect1.addControl(rect2);
    
    return [line, rect1];
}

export function displayBuildingInfo(building){
    //Remove previous building info
    if(GUITexture.buildingInfo){
        for(let i = 0; i < GUITexture.buildingInfo.selectionLine.length; i++){
            GUITexture.buildingInfo.selectionLine[i].dispose();
        }
        GUITexture.removeControl(GUITexture.buildingInfo);
    }

    if(building === null){
        return;
    }
    
    //Main container
    const container = new GUI.Rectangle();
    container.width = "920px";
    container.height = "387px";
    container.thickness = 0;

    //Mask for bottom panel
    const mask = new GUI.Rectangle("mask");
    mask.width = "920px";
    mask.height = "387px";
    mask.top = "20px";
    mask.thickness = 0;

    //Bottom panel container
    const buildingInfoPanelBottomContainer = new GUI.Rectangle("buildingInfoPanelBottomContainer");
    buildingInfoPanelBottomContainer.width = "920px";
    buildingInfoPanelBottomContainer.height = "387px";
    buildingInfoPanelBottomContainer.thickness = 0;

    //Bottom panel image
    const buildingInfoPanelBottom = new GUI.Image("buildingInfo", "buildingStatsPanelBottom.png");
    buildingInfoPanelBottom.width = "920px";
    buildingInfoPanelBottom.height = "387px";
    buildingInfoPanelBottom.top = 0;
    buildingInfoPanelBottom.left = 0;
    buildingInfoPanelBottomContainer.addControl(buildingInfoPanelBottom);
    mask.addControl(buildingInfoPanelBottomContainer);
    container.addControl(mask);

    //Stats title text
    const statsTitleText = new GUI.TextBlock();
    statsTitleText.text = "Stats";
    statsTitleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    statsTitleText.color = "white";
    statsTitleText.fontSize = 30;
    statsTitleText.top = "-34px";
    statsTitleText.left = "90px";
    statsTitleText.scaleX = 1;
    statsTitleText.fontFamily = "GemunuLibre-Medium";
    buildingInfoPanelBottomContainer.addControl(statsTitleText);

    container.statsText = [];
    //Building stats text
    let lineHeight = 0;
    let column = 0;
    for(let key in building.stats){
        if(building.stats[key] !== 0){
            let text = camelCaseToTitleCase(key) + ": " + building.stats[key];
            if(building.bonuses.length > 0){
                for(const bonus of building.bonuses){
                    if(bonus.key === key){
                        text += " (+" + bonus.value + ")"; 
                    }
                }
            }
            const statsText = new GUI.TextBlock();
            statsText.text = text;
            statsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsText.color = "#4B555C";
            statsText.fontSize = 22;
            statsText.top = 10 + lineHeight + "px";
            statsText.left = column === 0 ? "90px" : "320px";
            statsText.scaleX = 1;
            statsText.fontFamily = "GemunuLibre-Medium";
            buildingInfoPanelBottomContainer.addControl(statsText);
            statsText.key = key;
            container.statsText.push(statsText);
            lineHeight += 22;
            if (lineHeight > 100) {
                lineHeight = 0;
                column++;
            }
        }
    }
    

    //Building effects title text
    const effectsTitleText = new GUI.TextBlock();
    effectsTitleText.text = "Effects";
    effectsTitleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    effectsTitleText.color = "white";
    effectsTitleText.fontSize = 30;
    effectsTitleText.top = "-34px";
    effectsTitleText.left = "540px";
    effectsTitleText.scaleX = 1;
    effectsTitleText.fontFamily = "GemunuLibre-Medium";
    buildingInfoPanelBottomContainer.addControl(effectsTitleText);

    //Building effects text
    if(Object.keys(building.effects).length > 0){
        lineHeight = 0;
        column = 0;
        for(let key in building.effects){
            if(building.effects[key] !== 0){
                const text = camelCaseToTitleCase(key) + ": " + building.effects[key];
                const effectsText = new GUI.TextBlock();
                effectsText.text = text;
                effectsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                effectsText.color = "#4B555C";
                effectsText.fontSize = 22;
                effectsText.top = 10 + lineHeight + "px";
                effectsText.left = column === 0 ? "540px" : "700px";
                effectsText.scaleX = 1;
                effectsText.fontFamily = "GemunuLibre-Medium";
                buildingInfoPanelBottomContainer.addControl(effectsText);
                lineHeight += 22;
                if (lineHeight > 80) {
                    lineHeight = 0;
                    column++;
                }
            }
        }
    }

    //Bottom panel animation
    const animation = new BABYLON.Animation("bottomPanelAnimation", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: -387 },
        { frame: 40, value: -30 }
    ]);
    buildingInfoPanelBottomContainer.animations = [];
    buildingInfoPanelBottomContainer.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    animation.setEasingFunction(ease);    
    GUIscene.beginDirectAnimation(buildingInfoPanelBottomContainer, [buildingInfoPanelBottomContainer.animations[0]], 0, 40, false, 1);

    //Building info image panel
    const buildingInfoPanel = new GUI.Image("buildingInfo", "buildingStatsPanel.png");
    buildingInfoPanel.width = "920px";
    buildingInfoPanel.height = "387px";
    buildingInfoPanel.top = 0;
    buildingInfoPanel.left = 0;
    container.addControl(buildingInfoPanel);

    //Building class
    const classText = new GUI.TextBlock();
    classText.text = building.class;
    classText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    classText.color = "white";
    classText.fontSize = 60;
    classText.top = "-155px";
    classText.left = "-140px";
    classText.shadowBlur = 0;
    classText.shadowColor = "#16171A";
    classText.shadowOffsetX = 0;
    classText.shadowOffsetY = 2;
    classText.scaleY = 0.5;
    classText.scaleX = 0.5;
    classText.fontFamily = "GemunuLibre-Medium";
    container.addControl(classText);

    //Building name
    const nameText = new GUI.TextBlock();
    nameText.text = building.name;
    nameText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    nameText.color = "white";
    nameText.fontSize = 60;
    nameText.top = "-105px";
    nameText.left = "-50px";
    nameText.shadowBlur = 0;
    nameText.shadowColor = "#16171A";
    nameText.shadowOffsetX = 0;
    nameText.shadowOffsetY = 2;
    nameText.scaleY = 0.7;
    nameText.scaleX = 0.7;
    nameText.fontFamily = "GemunuLibre-Medium";
    container.addControl(nameText);

    //Building level
    const levelText = new GUI.TextBlock();
    levelText.text = "Level " + building.cardLevel;
    levelText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    levelText.color = "#94EAFF";
    levelText.fontSize = 27;
    levelText.top = "-145px";
    levelText.left = "770px";
    levelText.fontFamily = "GemunuLibre-Medium";
    container.addControl(levelText);

    //Building Level image
    if(building.cardLevel >= 1){
        const imageName = "cardLevel"+building.cardLevel+".png"
        var levelImage = new GUI.Image("but", imageName);
        levelImage.width = "323px";
        levelImage.height = "44px";
        levelImage.top = "-108px";
        levelImage.left = "228px";
        levelImage.scaleX = 1.09;
        container.addControl(levelImage);
    }

    container.scaleX = 0.7;
    container.scaleY = 0.7;
    container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    container.top = "-50px";
    container.left = "-130px";

    container.selectedBuilding = building;

    GUITexture.addControl(container);
    GUITexture.buildingInfo = container;

    const selectionLine = createSelectionLine({x: 643, y: 220}, building.buildingGraphic.getChildMeshes()[0]);
    container.selectionLine = selectionLine;
}

export function updateBuildingStatsText(){
    if(GUITexture.buildingInfo){
        const building = GUITexture.buildingInfo.selectedBuilding;
        for(let i = 0; i < GUITexture.buildingInfo.statsText.length; i++){
            const key = GUITexture.buildingInfo.statsText[i].key;
            let text = camelCaseToTitleCase(key) + ": " + building.stats[key];
            if(building.bonuses.length > 0){
                for(const bonus of building.bonuses){
                    if(bonus.key === key){
                        text += " (+" + bonus.value + ")"; 
                    }
                }
            }
            GUITexture.buildingInfo.statsText[i].text = text;
        }
    }
}

export function displayBottomUI(){
    //Bottom panel container
    bottomPanelContainer = new GUI.Rectangle("bottomUIContainer");
    bottomPanelContainer.width = "596px";
    bottomPanelContainer.height = "150px";
    bottomPanelContainer.thickness = 0;
    bottomPanelContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    bottomPanelContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    bottomPanelContainer.top = "0px";
    bottomPanelContainer.left = "0px";

    //Bottom panel image
    const bottomPanel = new GUI.Image("bottomUI", "bottomUI.png");
    bottomPanel.width = "596px";
    bottomPanel.height = "150px";
    bottomPanel.top = 0;
    bottomPanel.left = 0;
    bottomPanelContainer.addControl(bottomPanel);

    //End Turn Button Backing
    const endTurnButtonBack = new GUI.Image("endTurnButton", "endTurnButtonBack.png");
    endTurnButtonBack.width = "186px";
    endTurnButtonBack.height = "89px";
    endTurnButtonBack.top = 17;
    endTurnButtonBack.left = 157;
    bottomPanelContainer.addControl(endTurnButtonBack);

    //End Turn Button
    const endTurnButton = new GUI.Image("endTurnButton", "endTurnButton.png");
    endTurnButton.width = "186px";
    endTurnButton.height = "89px";
    endTurnButton.top = 17;
    endTurnButton.left = 157;
    bottomPanelContainer.addControl(endTurnButton);
    endTurnButton.onPointerClickObservable.add(endTurn());
    //Change cursor on hover
    endTurnButton.onPointerEnterObservable.add(function () {
        if(currentScene === "build"){
            document.body.style.cursor='pointer'
        }
    });
    endTurnButton.onPointerOutObservable.add(function () {
        document.body.style.cursor='default'
    });

    //Bottom panel animation
    const animation = new BABYLON.Animation("bottomPanelAnimation", "top", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 150 },
        { frame: 40, value: 0 }
    ]);
    bottomPanelContainer.animations = [];
    bottomPanelContainer.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
    animation.setEasingFunction(ease);    
    GUIscene.beginDirectAnimation(bottomPanelContainer, [bottomPanelContainer.animations[0]], 0, 40, false, 1);

    //Create Game Credits Icons
    addCreditIcon(availableCredits);

    bottomPanelContainer.zIndex = 1000;

    GUITexture.addControl(bottomPanelContainer);
}

let bottomPanelContainer;

export function addCreditIcon(amount){
    if(!GUITexture.creditsIcons){
        GUITexture.creditsIcons = [];
    }
    for(let i = 0; i < amount; i++){
        const creditIcon = new GUI.Image("creditIcon", "gameCredit.png");
        creditIcon.width = "17px";
        creditIcon.height = "22px";
        creditIcon.top = "28px";
        creditIcon.left = -241 + (GUITexture.creditsIcons.length * 13) + "px";
        bottomPanelContainer.addControl(creditIcon);

        //Credit icon fades in animation
        const animation = new BABYLON.Animation("creditFadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            { frame: 0, value: 0 },
            { frame: 60, value: 1 }
        ]);
        creditIcon.animations = [];
        creditIcon.animations.push(animation);
        let ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(ease);
        GUIscene.beginDirectAnimation(creditIcon, [creditIcon.animations[0]], 0, 60, false, 1);

        GUITexture.creditsIcons.push(creditIcon);
    }
}

export function removeCreditIcon(amount){
    for(let i = 0; i < Math.abs(amount); i++){
        //Credit icon fades in animation
        const animation = new BABYLON.Animation("creditFadeOut", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            { frame: 0, value: 1 },
            { frame: 40, value: 0 }
        ]);
        let creditIcon = GUITexture.creditsIcons.pop();
        creditIcon.animations = [];
        creditIcon.animations.push(animation);
        let ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(ease);
        GUIscene.beginDirectAnimation(creditIcon, [creditIcon.animations[0]], 0, 40, false, 1, function(){
            creditIcon.dispose();
        });
    }
}

export function removeExistingCreditIcons(){
    while(GUITexture.creditsIcons.length > 0){
        //Credit icon fades in animation
        const animation = new BABYLON.Animation("creditFadeOut", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            { frame: 0, value: 1 },
            { frame: 40, value: 0 }
        ]);
        let creditIcon = GUITexture.creditsIcons.pop();
        creditIcon.animations = [];
        creditIcon.animations.push(animation);
        let ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(ease);
        GUIscene.beginDirectAnimation(creditIcon, [creditIcon.animations[0]], 0, 40, false, 1, function(){
            creditIcon.dispose();
        });
    }
}