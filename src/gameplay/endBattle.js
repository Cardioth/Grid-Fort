import { setCurrentScene } from "../managers/sceneManager";
import { allBoards, updateMedals, updateStrikes } from "../managers/setup";
import { getTotalCredits, setAvailableCredits, updateTotalCredits } from "./credits";
import allBuildings from "../components/buildings";
import { playerBoard, enemyBoard } from "../managers/setup";
import { unplaceBuilding } from "./buildingPlacement";
import { GUIcamera, camera } from "../graphics/sceneInitialization";
import { setZoomTarget } from "../graphics/graphics";
import { displayBuildingInfo, updateBuildingStatsText } from "../ui/gameGUI";
import { selectedPlacedBuilding } from "../managers/eventListeners";
import * as BABYLON from "@babylonjs/core";
import { fadeOutMeshAnimation } from "../graphics/animations/meshFadeAnimations";
import { weaponIdleAnimation } from "../graphics/animations/weaponAnimations";
import { undarkenBuilding } from "../graphics/darkenBuilding";
import { getTurretsOfBuilding } from "./battle";
import { drawCardFromDeckToHand } from "../components/deck";
import { hand } from "../components/cards";
import { createEndBattleScreen } from "../graphics/endBattleScreen";

export function endBattle(victory) {

    if(victory){
        updateMedals(1);
    } else {
        updateStrikes(1);
    }

    setCurrentScene("endBattle");

    createEndBattleScreen(victory);
}

export function returnToBuildScene() {
    setCurrentScene("build");

    if (getTotalCredits() < 18) {
        updateTotalCredits(1);
    }
    setAvailableCredits(getTotalCredits());

    if(hand.length <= 7){
        drawCardFromDeckToHand();
    }
    if(hand.length <= 7){
        drawCardFromDeckToHand();
    }

    //Remove enemy board
    fadeOutMeshAnimation(enemyBoard.baseMesh, 60);
    fadeOutMeshAnimation(enemyBoard.baseBaseMesh, 60);

    //Move camera
    camera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    camera.targetPosition = camera.defaultTargetPosition.clone();
    GUIcamera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    GUIcamera.targetPosition = GUIcamera.defaultTargetPosition.clone();

    setZoomTarget(2.5);

    updatePlayerBuildings();

    //clear enemy board
    clearEnemyBoard();

    if (allBoards.indexOf(enemyBoard) !== -1) {
        allBoards.splice(allBoards.indexOf(enemyBoard), 1);
    }

}

function updatePlayerBuildings() {
    playerBoard.allPlacedBuildings.forEach((building) => {
        building.target = undefined;
        building.possibleCellTargets = [];
        if (building.class === "Core") {
            building.destroyed = false;
            building.stats.health = allBuildings[building.keyName].stats.health;
            if (building.healthBarGraphic) {
                building.healthBarGraphic.dispose();
                building.healthBarGraphic = null;
            }
            updateBuildingStatsText();
            if (building.darkened) {
                setTimeout(function () {
                    undarkenBuilding(building);
                }, 2000);
            }
        }

        if (building.destroyed === false) {
            const turretGraphics = getTurretsOfBuilding(building);
            if (turretGraphics.length > 0) {
                for (let turret of turretGraphics) {
                    setTimeout(function () {
                        weaponIdleAnimation(turret);
                    }, 2000);
                    turret.attacking = false;
                }
            }
        }

        if (building.stats.hasOwnProperty("ammoStorage")) {
            building.stats.ammoStorage = allBuildings[building.keyName].stats.ammoStorage;
        }
        if (building.stats.hasOwnProperty("powerStorage")) {
            building.stats.powerStorage = allBuildings[building.keyName].stats.powerStorage;
        }
    });
}

function clearEnemyBoard() {
    enemyBoard.allPlacedBuildings.forEach((building) => {
        building.buildingGraphic.dispose();
        unplaceBuilding(building, enemyBoard);

        if (building.buildingGraphic.laserGraphic) {
            for (let child of building.buildingGraphic.laserGraphic.getChildren()) {
                fadeOutMeshAnimation(child, 20);
            }
            building.buildingGraphic.laserGraphic = null;
        }

        if (selectedPlacedBuilding === building) {
            displayBuildingInfo(null);
        }
        if (building.healthBarGraphic) {
            building.healthBarGraphic.dispose();
            building.healthBarGraphic = null;
        }
    });
}

