import * as GUI from "@babylonjs/gui";
import { GUITexture } from './sceneInitialization.js';
import allBuildings from "../components/buildings.js";

export function createHealthBarGraphic(building){
    const totalHealth = allBuildings[building.keyName].stats.health;
    const currentHealth = building.stats.health;
    const healthBarWidth = currentHealth/totalHealth*40;

    const container = new GUI.Rectangle();
    container.width = "40px";
    container.height = "7px";
    container.thickness = 0;
    container.linkOffsetY = 5;

    const healthBarBack = new GUI.Rectangle();
    healthBarBack.width = "40px";
    healthBarBack.height = "7px";
    healthBarBack.background = "black";
    healthBarBack.thickness = 0;
    container.addControl(healthBarBack);

    const healthBar = new GUI.Rectangle();
    healthBar.width = healthBarWidth + "px";
    healthBar.height = "7px";
    healthBar.background = "#4AD4EE";
    healthBar.thickness = 0;
    //align health bar to the left
    healthBar.horizontalAlignment = -20;
    container.addControl(healthBar);

    const healthBarOutline = new GUI.Rectangle();
    healthBarOutline.width = "40px";
    healthBarOutline.height = "7px";
    healthBarOutline.color = "white";
    healthBarOutline.thickness = 1;
    container.addControl(healthBarOutline);

    GUITexture.addControl(container);
    container.linkWithMesh(building.buildingGraphic);

    building.healthBarGraphic = container;
    return container;
}

export function updateHealthBarGraphic(building){
    const totalHealth = allBuildings[building.keyName].stats.health;
    const currentHealth = building.stats.health;
    const healthBarWidth = currentHealth/totalHealth*40;
    building.healthBarGraphic.children[1].horizontalAlignment = -20;
    building.healthBarGraphic.children[1].width = healthBarWidth + "px";
}