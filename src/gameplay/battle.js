import { currentScene, setCurrentScene } from "../managers/sceneManager";
import { allBoards } from "../managers/setup";
import { getTotalCredits, setAvailableCredits, updateTotalCredits } from "./credits";
import { setCardPositions } from "../components/cards";
import allBuildings from "../components/buildings";
import { gridWidth, gridHeight } from "../data/config";
import { playerBoard, enemyBoard } from "../managers/setup";
import { unplaceBuilding } from "./buildingPlacement";
import { GUIcamera, camera, scene } from "../graphics/sceneInitialization";
import { setZoomTarget } from "../graphics/graphics";
import { displayBuildingInfo, updateBuildingStatsText } from "../ui/gameGUI";
import { selectedPlacedBuilding } from "../managers/eventListeners";
import { createHealthBarGraphic, updateHealthBarGraphic } from "../graphics/buildingHealthBar";
import * as BABYLON from "@babylonjs/core";
import { fadeOutMeshAnimation } from "../graphics/animations/meshFadeAnimations";
import { getTargetRotation, weaponFireAnimation, weaponIdleAnimation } from "../graphics/animations/weaponAnimations";
import { createLaserGraphic } from "../graphics/laserGraphics";
import { createKineticGraphic } from "../graphics/kineticGraphics";
import { createExplosion } from "../graphics/particleEffects/createExplosion";
import { darkenBuilding, undarkenBuilding } from "../graphics/darkenBuilding";

let battleLoopInterval;
export function startBattleLoop(){
    battleLoopInterval = setInterval(function () {
        battleLoop();
    }, 100);
}

function battleLoop() {
    for (let board of allBoards) {
        const enemy = board === playerBoard ? enemyBoard : playerBoard;

        //Weapon firing
        board.allPlacedBuildings.forEach((building) => {
            //Kinetic weapons always find a new target
            if (building.stats.kineticFirepower > 0  && building.destroyed === false) {
                getPossibleCellTargets(enemy, building);
                building.target = building.possibleCellTargets[Math.floor(Math.random() * building.possibleCellTargets.length)];
                pointTurretAtTarget(building);
            }
            //Fire Kinetic
            if (building.target && building.stats.kineticFirepower > 0 && building.destroyed === false && building.stats.ammoStorage >= building.stats.ammoDraw) {
                fireKineticTurret(building, board, building.target, enemy);
            }
            //Energy weapons only find a new target if they don't have one or if their target is destroyed
            if ((building.target === undefined || building.target.building.destroyed === true) && building.stats.energyFirepower > 0 && building.destroyed === false) {
                getPossibleCellTargets(enemy, building);
                building.target = building.possibleCellTargets[Math.floor(Math.random() * building.possibleCellTargets.length)];
                pointTurretAtTarget(building);
                if(building.buildingGraphic.laserGraphic){
                    for(let child of building.buildingGraphic.laserGraphic.getChildren()){
                        fadeOutMeshAnimation(child, 20);
                    }
                    building.buildingGraphic.laserGraphic = null;
                }
            }
            //Fire Energy
            if (building.target && building.stats.energyFirepower > 0 && building.destroyed === false && building.stats.powerStorage >= building.stats.powerDraw) {
                fireEnergyTurret(building, board, building.target, enemy);
            }
        });

        //if all buildings are destroyed, end game (Conquest Mode)
        let allBuildingsDestroyed = true;
        board.allPlacedBuildings.forEach((building) => {
            if (building.destroyed === false) {
                allBuildingsDestroyed = false;
            }
        });

        if (allBuildingsDestroyed) {
            endBattle();
        }
    }
}

function endBattle() {
    setCurrentScene("build");

    if (getTotalCredits() < 18) {
        updateTotalCredits(1);
    }
    setAvailableCredits(getTotalCredits());

    setCardPositions();

    //Remove enemy board
    fadeOutMeshAnimation(enemyBoard.baseMesh, 60);
    fadeOutMeshAnimation(enemyBoard.baseBaseMesh, 60);

    //Move camera
    camera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    camera.targetPosition = camera.defaultTargetPosition.clone();
    GUIcamera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    GUIcamera.targetPosition = GUIcamera.defaultTargetPosition.clone();

    setZoomTarget(2.5);

    //restock ammo and power
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
                undarkenBuilding(building);
            }
        }

        if (building.buildingGraphic.laserGraphic) {
            for (let child of building.buildingGraphic.laserGraphic.getChildren()) {
                fadeOutMeshAnimation(child, 20);
            }
            building.buildingGraphic.laserGraphic = null;
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

    //clear enemy board
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

    if (allBoards.indexOf(enemyBoard) !== -1) {
        allBoards.splice(allBoards.indexOf(enemyBoard), 1);
    }
    clearInterval(battleLoopInterval);
}

function pointTurretAtTarget(building) {
    if (building.target) {
        const turretGraphics = getTurretsOfBuilding(building);
        if (turretGraphics.length > 0) {
            const targetRotation = getTargetRotation(building.buildingGraphic, building.target.building.buildingGraphic);  
            const parentRotation = building.buildingGraphic.rotationQuaternion.toEulerAngles().y;
            for (let turret of turretGraphics) {
                weaponFireAnimation(turret, targetRotation.y - parentRotation + Math.PI / 2);
            }
        }
    }
}

function getTurretsOfBuilding(building) {
    const turretGraphics = [];
    for (let child of building.buildingGraphic.getChildren()) {
        if (child.name.endsWith("Weapon_clone")) {
            turretGraphics.push(child);
        }
    }
    return turretGraphics;
}

function fireKineticTurret(building, board, target, enemy) {
    if (building.stats.windUpTime > building.windUpCounter) {
        building.windUpCounter++;
        return;
    }
    building.fireRateCounter++;
    if (building.fireRateCounter >= building.stats.fireRate) {
        building.stats.ammoStorage -= building.stats.ammoDraw;
        building.fireRateCounter = 0;

        const targetPosition = new BABYLON.Vector3(
            ((-target.x + 8) / 4)+enemy.position.x, 
            0, 
            -((-target.y + 8) / 4)+enemy.position.y
        );

        createKineticGraphic(building.buildingGraphic, targetPosition);

        setTimeout(function () {
            if (currentScene === "battle") {
                let damage = building.stats.kineticFirepower - target.building.stats.armor;
                if (Math.random() * 100 < building.stats.critChance) {
                    damage = damage * (1 + (building.stats.critDamageBonus / 100));
                }
                if (damage < 1) {
                    damage = 1;
                }

                const blastRadius = building.stats.blastRadius;
                for (let x = target.x - blastRadius; x < target.x + blastRadius + 1; x++) {
                    for (let y = target.y - blastRadius; y < target.y + blastRadius + 1; y++) {
                        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                            const cell = enemy.grid[x + y * gridWidth];
                            if (cell.occupied && cell.building !== undefined) {
                                
                                cell.building.stats.health -= damage / Math.pow((2 * building.stats.blastRadius + 1), 2);
                                cell.building.stats.health = parseFloat(cell.building.stats.health.toFixed(2));
                                cell.building.stats.health = Math.floor(cell.building.stats.health*10)/10;

                                if(cell.building.destroyed === false){ //In cases where it is hit after death it needs to remain moveable
                                    cell.building.moveable = false;
                                }

                                createExplosion(targetPosition, "kineticExplosion");

                                updateBuildingStatsText();

                                updateTargetHealthAndDeath(target);
                            }
                        }
                    }
                }
            }
        }, 1400);
    }
}

export const lasers = [];
function fireEnergyTurret(building, board, target, enemy) {
    if (building.stats.windUpTime > building.windUpCounter) {
        building.windUpCounter++;
        return;
    }
    building.fireRateCounter++;
    building.stats.powerStorage -= building.stats.powerDraw;
    building.stats.powerStorage = parseFloat(building.stats.powerStorage.toFixed(2));
    if (building.fireRateCounter >= building.stats.fireRate && building.stats.powerStorage >= building.stats.powerDraw) {
        if (currentScene === "battle") {
            building.fireRateCounter = 0;

            const targetPosition = new BABYLON.Vector3(
                ((-target.x + 8) / 4)+enemy.position.x, 
                0, 
                -((-target.y + 8) / 4)+enemy.position.y
            );

            if(!building.buildingGraphic.laserGraphic){
                createLaserGraphic(building.buildingGraphic, targetPosition);
            }

            let damage = (building.stats.energyFirepower - target.building.stats.energyResistance) / 10;
            if (damage < 0.1) {
                damage = 0.1;
            }
            
            target.building.stats.health -= parseFloat(damage.toFixed(2));
            target.building.stats.health = Math.floor(target.building.stats.health*10)/10;

            if(target.building.destroyed === false){ //In cases where it is hit after death it needs to remain moveable
                target.building.moveable = false;
            }

            setTimeout(function () {
                createExplosion(targetPosition, "laserExplosion");
            },500);

            updateBuildingStatsText();

            updateTargetHealthAndDeath(target);
        }
    }
}

function updateTargetHealthAndDeath(target) {
    if (target.building.stats.health <= 0) {
        if(target.building.destroyed === false){
            createExplosion(target.building.buildingGraphic.position, "buildingExplosion");
            darkenBuilding(target.building);
        }
        if(target.building.name !== "Core"){
            target.building.moveable = true;
        }
        target.building.destroyed = true;

        if (target.building.healthBarGraphic) {
            target.building.healthBarGraphic.dispose();
            target.building.healthBarGraphic = null;
        }
        if(target.building.buildingGraphic.laserGraphic){
            for(let child of target.building.buildingGraphic.laserGraphic.getChildren()){
                fadeOutMeshAnimation(child, 20);
            }
            target.building.buildingGraphic.laserGraphic = null;
        }
    } else {
        if (!target.building.healthBarGraphic) {
            createHealthBarGraphic(target.building);
        } else {
            if(target.building){
                updateHealthBarGraphic(target.building);
            }
        }
    }
}

function getPossibleCellTargets(board, building) {
    building.possibleCellTargets = [];
    if (building.preferredTarget.length === 0) {
        board.grid.forEach((cell) => {
            if (cell.occupied && cell.building !== undefined && cell.building.destroyed === false) { //&& cell.building.name !== "Core"
                building.possibleCellTargets.push(cell);
            }
        });
        return null;
    } else {
        for (let targetClass of building.preferredTarget) {
            for (let cell of board.grid) {
                if (cell.occupied && cell.building !== undefined && cell.building.destroyed === false && targetClass === cell.building.class) {
                    building.possibleCellTargets.push(cell);
                }
            }
            if (building.possibleCellTargets.length > 0) {
                break;
            }
        }
        return null;
    }
}

