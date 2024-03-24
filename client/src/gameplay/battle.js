import { currentScene } from "../managers/sceneManager";
import { allBoards } from "../managers/gameSetup";
import { gridWidth, gridHeight, battleLoopTimeLength } from "../../../common/data/config";
import { playerBoard, enemyBoard } from "../managers/gameSetup";
import { removeBuldingEffectsFromBoard } from "./buildingPlacement";
import { updateBuildingStatsText } from "../ui/gameGUI";
import { createHealthBarGraphic, updateHealthBarGraphic } from "../graphics/buildingHealthBar";
import * as BABYLON from "@babylonjs/core";
import { getTargetRotation, weaponFireAnimation } from "../graphics/animations/weaponAnimations";
import { createLaserGraphic, fadeOutLaserAnimation } from "../graphics/laserGraphics";
import { createKineticGraphic } from "../graphics/kineticGraphics";
import { createExplosion } from "../graphics/particleEffects/createExplosion";
import { darkenBuilding } from "../graphics/darkenBuilding";
import { endBattle } from "./endBattle";

export let battleLoopInterval;
export function startBattleLoop(){
    battleLoopInterval = setInterval(function () {
        battleLoop();
    }, battleLoopTimeLength);
}

function battleLoop() {
    //Loop through player and enemy boards
    for (let board of allBoards) {
        const enemy = board === playerBoard ? enemyBoard : playerBoard;

        //Weapon firing
        board.allPlacedBuildings.forEach((building) => {
            //Kinetic weapons always finds a new target
            if (building.stats.kineticFirepower > 0  && building.destroyed === false) {
                getPossibleCellTargets(enemy, building).then( targets => {
                    building.target = targets[Math.floor(Math.random() * targets.length)];
                    pointTurretAtTarget(building); //Client side only
                });
            }
            //Fire Kinetic
            if (building.target && building.stats.kineticFirepower > 0 && building.destroyed === false && building.stats.ammoStorage >= building.stats.ammoDraw) {
                fireKineticTurret(building, board, building.target, enemy);
            }
            //Energy weapons only find a new target if they don't have one or if their target is destroyed
            if ((building.target === undefined || building.target.building.destroyed === true) && building.stats.energyFirepower > 0 && building.destroyed === false) {
                getPossibleCellTargets(enemy, building).then( targets => {
                    building.target = targets[Math.floor(Math.random() * targets.length)];
                    pointTurretAtTarget(building);
                    if(building.buildingGraphic.laserGraphic){
                        for(let child of building.buildingGraphic.laserGraphic.getChildren()){
                            fadeOutLaserAnimation(child, 40);
                        }
                        building.buildingGraphic.laserGraphic = null;
                    }
                });
            }
            //Fire Energy
            if (building.target && building.stats.energyFirepower > 0 && building.destroyed === false && building.stats.powerStorage >= building.stats.powerDraw) {
                fireEnergyTurret(building, board, building.target, enemy);
            }
        });

        //if all buildings are destroyed, end battle (Conquest Mode)
        let allBuildingsDestroyed = true;
        board.allPlacedBuildings.forEach((building) => {
            if (building.destroyed === false) {
                allBuildingsDestroyed = false;
            }
        });

        // End battle
        if (allBuildingsDestroyed) {
            let victory = board === enemyBoard;
            removalAllLasers(); // Client side only
            endBattle(victory); // Client side only
            clearInterval(battleLoopInterval);
        }
    }
}

function removalAllLasers(){
    for(let board of allBoards){
        for(let building of board.allPlacedBuildings){
            if(building.buildingGraphic.laserGraphic){
                for(let child of building.buildingGraphic.laserGraphic.getChildren()){
                    fadeOutLaserAnimation(child, 20);
                }
                building.buildingGraphic.laserGraphic = null;
            }
        }
    }
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

export function getTurretsOfBuilding(building) {
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

        createKineticGraphic(building.buildingGraphic, targetPosition); //Client side only

        setTimeout(function () { //Switch to standard ticks
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
                                    //cell.building.moveable = false;
                                }

                                createExplosion(targetPosition, "kineticExplosion");

                                updateBuildingStatsText();

                                updateTargetHealthAndDeath(cell, enemy);
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
                createLaserGraphic(building.buildingGraphic, targetPosition); //Client side only
            }

            let damage = (building.stats.energyFirepower - target.building.stats.energyResistance) / 10;
            if (damage < 0.1) {
                damage = 0.1;
            }
            
            target.building.stats.health -= parseFloat(damage.toFixed(2));
            target.building.stats.health = Math.floor(target.building.stats.health*10)/10;

            if(target.building.destroyed === false){ //In cases where it is hit after death it needs to remain moveable
                //target.building.moveable = false;
            }

            setTimeout(function () {
                createExplosion(targetPosition, "laserExplosion"); //Client side only
            },500);

            updateBuildingStatsText();  //Client side only

            updateTargetHealthAndDeath(target, enemy);
        }
    }
    
    if(building.buildingGraphic.laserGraphic && building.stats.powerStorage < building.stats.powerDraw){
        for(let child of building.buildingGraphic.laserGraphic.getChildren()){
            fadeOutLaserAnimation(child, 20);
        }
        building.buildingGraphic.laserGraphic = null;
    }
}

function updateTargetHealthAndDeath(target, board) {
    if (target.building.stats.health <= 0) {
        if(target.building.destroyed === false){
            createExplosion(target.building.buildingGraphic.position, "buildingExplosion"); //Client side only
            darkenBuilding(target.building); //Client side only
            removeBuldingEffectsFromBoard(target.building, board);
        }
        if(target.building.name !== "Core"){
            target.building.moveable = true;
        }
        target.building.destroyed = true;

        if (target.building.healthBarGraphic) { //Client side only
            target.building.healthBarGraphic.dispose();
            target.building.healthBarGraphic = null;
        }
        if(target.building.buildingGraphic.laserGraphic){ //Client side only
            for(let child of target.building.buildingGraphic.laserGraphic.getChildren()){
                fadeOutLaserAnimation(child, 20);
            }
            target.building.buildingGraphic.laserGraphic = null; //Client side only
        }
    } else {
        if (!target.building.healthBarGraphic) { //Client side only
            createHealthBarGraphic(target.building);
        } else {
            if(target.building){
                updateHealthBarGraphic(target.building); //Client side only
            }
        }
    }
}

function getPossibleCellTargets(board, building) {
    return new Promise(resolve => {
        const possibleCellTargets = [];
        if (building.preferredTarget.length === 0) {
            board.grid.forEach((cell) => {
                if (cell.occupied && cell.building !== undefined && cell.building.destroyed === false) {
                    possibleCellTargets.push(cell);
                }
            });
        } else {
            for (let targetClass of building.preferredTarget) {
                for (let cell of board.grid) {
                    if (cell.occupied && cell.building !== undefined && cell.building.destroyed === false && targetClass === cell.building.class) {
                        possibleCellTargets.push(cell);
                    }
                }
                if (possibleCellTargets.length > 0) {
                    break;
                }
            }
        }
        resolve(possibleCellTargets);
    });
}