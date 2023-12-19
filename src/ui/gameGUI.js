import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { GUIscene } from "../graphics/sceneInitialization.js";
import { camelCaseToTitleCase } from "../utilities/utils.js";

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
    
    return [line, rect1];
}

export function displayBuildingInfo(building){
    if(GUITexture.buildingInfo){
        for(let i = 0; i < GUITexture.buildingInfo.selectionLine.length; i++){
            GUITexture.buildingInfo.selectionLine[i].dispose();
        }
        GUITexture.removeControl(GUITexture.buildingInfo);
    }

    if(building === null){
        return;
    }
    
    const container = new GUI.Rectangle();
    container.width = "920px";
    container.height = "387px";
    container.thickness = 0;

    const mask = new GUI.Rectangle();
    mask.width = "920px";
    mask.height = "387px";
    mask.top = "20px";
    mask.thickness = 0;

    const buildingInfoPanelBottomContainer = new GUI.Rectangle();
    buildingInfoPanelBottomContainer.width = "920px";
    buildingInfoPanelBottomContainer.height = "387px";
    buildingInfoPanelBottomContainer.thickness = 0;

    //build info image panel added
    const buildingInfoPanelBottom = new GUI.Image("buildingInfo", "buildingStatsPanelBottom.png");
    buildingInfoPanelBottom.width = "920px";
    buildingInfoPanelBottom.height = "387px";
    buildingInfoPanelBottom.top = 0;
    buildingInfoPanelBottom.left = 0;
    buildingInfoPanelBottomContainer.addControl(buildingInfoPanelBottom);
    mask.addControl(buildingInfoPanelBottomContainer);
    container.addControl(mask);

    //building stats title text
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

    //building stats text
    let lineHeight = 0;
    let column = 0;
    for(let key in building.stats){
        if(building.stats[key] !== 0){
            const text = camelCaseToTitleCase(key) + ": " + building.stats[key];
            const statsText = new GUI.TextBlock();
            statsText.text = text;
            statsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            statsText.color = "#4B555C";
            statsText.fontSize = 22;
            statsText.top = 10 + lineHeight + "px";
            statsText.left = column === 0 ? "90px" : "280px";
            statsText.scaleX = 1;
            statsText.fontFamily = "GemunuLibre-Medium";
            buildingInfoPanelBottomContainer.addControl(statsText);
            lineHeight += 22;
            if (lineHeight > 100) {
                lineHeight = 0;
                column++;
            }
        }
    }

    //building effects title text
    const effectsTitleText = new GUI.TextBlock();
    effectsTitleText.text = "Effects";
    effectsTitleText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    effectsTitleText.color = "white";
    effectsTitleText.fontSize = 30;
    effectsTitleText.top = "-34px";
    effectsTitleText.left = "520px";
    effectsTitleText.scaleX = 1;
    effectsTitleText.fontFamily = "GemunuLibre-Medium";
    buildingInfoPanelBottomContainer.addControl(effectsTitleText);


    //building effects text
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
                effectsText.left = column === 0 ? "520px" : "700px";
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

    //bottom panel animation
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

    //build info image panel added
    const buildingInfoPanel = new GUI.Image("buildingInfo", "buildingStatsPanel.png");
    buildingInfoPanel.width = "920px";
    buildingInfoPanel.height = "387px";
    buildingInfoPanel.top = 0;
    buildingInfoPanel.left = 0;
    container.addControl(buildingInfoPanel);

    //building class
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

    //building name
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

    container.scaleX = 0.7;
    container.scaleY = 0.7;
    container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    container.top = "-50px";
    container.left = "-130px";

    const selectionLine = createSelectionLine({x: 640, y: 220}, building.buildingGraphic.getChildMeshes()[0]);
    container.selectionLine = selectionLine;
    
    GUITexture.addControl(container);
    GUITexture.buildingInfo = container;
}