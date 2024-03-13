import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { GUIscene } from '../../graphics/sceneInitialization.js';
import { getImage } from "../../graphics/loadImages.js";
import { shapeKeyLegend } from "../../../../common/data/config.js";

export function createBuildingShapeGraphic(building) {
    //Container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = building.width * 40 + "px";
    container.height = building.height * 40 + "px";

    /*
    0: "empty",
    1: "occupied",
    2: "anchorPoint",
    3: "kineticWeapon",
    4: "energyWeapon",
    5: "missileWeapon",
    6: "booster",
    7: "anchorPointKineticWeapon",
    8: "anchorPointEnergyWeapon",
    9: "anchorPointMissileWeapon",
    10: "anchorPointBooster",
    */

    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            if (shapeKey === "occupied" || shapeKey.endsWith("Weapon") || shapeKey.startsWith("anchorPoint")) {
                const cell = new GUI.Rectangle();
                cell.width = "40px";
                cell.height = "40px";
                cell.thickness = 0;
                cell.background = building.color;
                cell.alpha = 0.7;
                cell.left = (x * 40) + "px";
                cell.top = (y * 40) + "px";
                container.addControl(cell);
            }
            if (shapeKey.endsWith("booster")) {

            }
        }
    }

    const newShape = building.shape.map(cell => cell === 0 || cell === 6 ? 0 : 1);
    console.log(traceShapeOutline(building.width, building.height, newShape));
}

function traceShapeOutline(width, height, shape){

}