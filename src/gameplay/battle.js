import { currentScene, setCurrentScene } from "../managers/sceneManager";
import { allBoards } from "../managers/setup";
import { getTotalCredits, setAvailableCredits, updateTotalCredits } from "./credits";
import { setCardPositions, hand } from "../components/cards";
import { getRandomBuilding } from "../components/buildings";
import allBuildings from "../components/buildings";
import { gridWidth, gridHeight, cellSize, boardWidth } from "../data/config";
import { spawnProjectile, blasts } from "../graphics/testGraphics";
import { playerBoard, enemyBoard } from "../managers/setup";
import { unplaceBuilding } from "./buildingPlacement";
import { shapeKeyLegend } from "../data/config";
import { GUIcamera, camera } from "../graphics/sceneInitialization";
import { setZoomTarget } from "../graphics/graphics";
import { displayBuildingInfo, updateBuildingStatsText } from "../ui/gameGUI";
import { selectedPlacedBuilding } from "../managers/eventListeners";
import { createHealthBarGraphic, updateHealthBarGraphic } from "../graphics/buildingHealthBar";
import * as BABYLON from "@babylonjs/core";
import { fadeOutMeshAnimation } from "../graphics/meshFadeAnimations";
import { getTargetRotation, weaponFireAnimation, weaponIdleAnimation } from "../graphics/weaponAnimations";

let battleLoopInterval;
export function startBattleLoop(){
    battleLoopInterval = setInterval(function () {
        battleLoop();
    }, 100);
}

function battleLoop() {
    for (let board of allBoards) {
        const enemy = board === playerBoard ? enemyBoard : playerBoard;

        board.allPlacedBuildings.forEach((building) => {
            //Kinetic weapons always find a new target
            if (building.stats.kineticFirepower > 0) {
                getPossibleCellTargets(enemy, building);
                building.target = building.possibleCellTargets[Math.floor(Math.random() * building.possibleCellTargets.length)];
            }
            //Fire Kinetic
            if (building.target && building.stats.kineticFirepower > 0 && building.destroyed === false && building.stats.ammoStorage > building.stats.ammoDraw) {
                fireKineticTurret(building, board, building.target, enemy);
            }
            //Energy weapons only find a new target if they don't have one or if their target is destroyed
            if ((building.target === undefined || building.target.building.destroyed === true) && building.stats.energyFirepower > 0) {
                getPossibleCellTargets(enemy, building);
                building.target = building.possibleCellTargets[Math.floor(Math.random() * building.possibleCellTargets.length)];

                //Point at turret new target
                if(building.target){
                    const turretGraphics = getTurretsOfBuilding(building);
                    if (turretGraphics.length > 0){
                        const targetRotation = getTargetRotation(building.buildingGraphic, building.target.building.buildingGraphic);
                        const parentRotation = building.buildingGraphic.rotationQuaternion.toEulerAngles().y;
                        for (let turret of turretGraphics) {
                            weaponFireAnimation(turret, targetRotation.y-parentRotation+Math.PI/2);
                        }
                    }
                }
            }
            //Fire Energy
            if (building.target && building.stats.energyFirepower > 0 && building.destroyed === false && building.stats.powerStorage > building.stats.powerDraw) {
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
            setCurrentScene("build");

            if(getTotalCredits() < 18){
                updateTotalCredits(1);
            }
            setAvailableCredits(getTotalCredits());

            setCardPositions();

            //Remove enemy board
            fadeOutMeshAnimation(enemyBoard.baseMesh);
            fadeOutMeshAnimation(enemyBoard.baseBaseMesh);

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
                //building.destroyed = false;
                //building.stats.health = allBuildings[building.keyName].stats.health;

                if(building.destroyed === false){
                    const turretGraphics = getTurretsOfBuilding(building);
                    if (turretGraphics.length > 0){
                        for (let turret of turretGraphics) {
                            weaponIdleAnimation(turret);
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
                if(selectedPlacedBuilding === building){
                    displayBuildingInfo(null);
                }
                if(building.healthBarGraphic){
                    building.healthBarGraphic.dispose();
                }
            });

            if (allBoards.indexOf(enemyBoard) !== -1) {
                allBoards.splice(allBoards.indexOf(enemyBoard), 1);
            }
            clearInterval(battleLoopInterval);
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

        // for (let x = 0; x < building.width; x++) {
        //     for (let y = 0; y < building.height; y++) {
        //         const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
        //         if (shapeKey === 2) {
        //             const turretOffsetX = (x * cellSize);
        //             const turretOffsetY = (y * cellSize);
        //             spawnProjectile(building, board, target, enemy, turretOffsetX, turretOffsetY);
        //         }
        //     }
        // }

        setTimeout(function () {
            //Adjust damage for crits
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
                                
                                // blasts.push({
                                //     x: (target.x * cellSize) + enemy.xGridOffset + (cellSize / 2),
                                //     y: (target.y * cellSize) + enemy.yGridOffset + (cellSize / 2),
                                //     radius: blastRadius + 1,
                                //     alpha: 1,
                                //     size: 1,
                                // });

                                updateBuildingStatsText();

                                updateTargetHealthAndDeath(target);
                            }
                        }
                    }
                }
            }
        }, 750);
    }
}

export const lasers = [];
function fireEnergyTurret(building, board, target, enemy) {
    if (building.stats.windUpTime > building.windUpCounter) {
        building.windUpCounter++;
        return;
    }
    let turretOffsetX = 0;
    let turretOffsetY = 0;
    building.fireRateCounter++;
    building.stats.powerStorage -= building.stats.powerDraw;
    building.stats.powerStorage = parseFloat(building.stats.powerStorage.toFixed(2));
    if (building.fireRateCounter >= building.stats.fireRate) {
        if (currentScene === "battle") {
            building.fireRateCounter = 0;

            // for (let x = 0; x < building.width; x++) {
            //     for (let y = 0; y < building.height; y++) {
            //         const shapeKey = building.shape[x + y * building.width];
            //         if (shapeKey === 3) {
            //             turretOffsetX = (x * cellSize);
            //             turretOffsetY = (y * cellSize);
            //         }
            //     }
            // }
            // lasers.push({
            //     x: (building.x * cellSize) + board.xGridOffset + (cellSize / 2) + turretOffsetX,
            //     y: (building.y * cellSize) + board.yGridOffset + (cellSize / 2) + turretOffsetY,
            //     targetX: (target.x * cellSize) + enemy.xGridOffset + (cellSize / 2),
            //     targetY: (target.y * cellSize) + enemy.yGridOffset + (cellSize / 2),
            //     alpha: 1,
            // });

            let damage = (building.stats.energyFirepower - target.building.stats.energyResistance) / 10;
            if (damage < 0.1) {
                damage = 0.1;
            }
            
            target.building.stats.health -= parseFloat(damage.toFixed(2));
            target.building.stats.health = Math.floor(target.building.stats.health*10)/10;
      
            // const blastRadius = building.stats.blastRadius;
            // blasts.push({
            //     x: (target.x * cellSize) + enemy.xGridOffset + (cellSize / 2),
            //     y: (target.y * cellSize) + enemy.yGridOffset + (cellSize / 2),
            //     radius: blastRadius + 1,
            //     alpha: 1,
            //     size: 1,
            // });

            updateBuildingStatsText();

            updateTargetHealthAndDeath(target);
        }
    }
}

function updateTargetHealthAndDeath(target) {
    if (target.building.stats.health <= 0) {
        target.building.destroyed = true;
        if (target.building.healthBarGraphic) {
            target.building.healthBarGraphic.dispose();
        }
    } else {
        if (!target.building.healthBarGraphic) {
            createHealthBarGraphic(target.building);
        } else {
            updateHealthBarGraphic(target.building);
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

