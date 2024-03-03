// import { allBoards, playerBoard, enemyBoard } from "../managers/gameSetup";
// import { removeBuldingEffectsFromBoard } from "./buildingPlacement";

const { gridWidth, gridHeight } = require("../common/data/config") ;
const seedrandom = require('seedrandom');
const seed = Math.random().toString();
const rng = seedrandom(seed);

class BattleManager {
    constructor() {
        this.masterTick = 0;
        this.scheduledActions = [];
    }

    setTickTimeout(callback, delayTicks) {
        const executeTick = this.masterTick + delayTicks;
        this.scheduledActions.push({ executeTick, callback });
    }

    executeScheduledActions() {
        this.scheduledActions = this.scheduledActions.filter(action => {
            if (this.masterTick >= action.executeTick) {
                action.callback();
                return false;
            }
            return true;
        });
    }

    startBattleLoop(battleLoop) {
        let victor;
        while (!victor) {
            this.executeScheduledActions();
            victor = battleLoop(this.masterTick);
            this.masterTick++;
        }
        return victor;
    }

    battleLoop() {
        //Loop through player and enemy boards
        for (let board of allBoards) {
            const enemy = board === playerBoard ? enemyBoard : playerBoard;
    
            //Weapon firing
            board.allPlacedBuildings.forEach((building) => {
                //Kinetic weapons always finds a new target
                if (building.stats.kineticFirepower > 0  && building.destroyed === false) {
                    const targets = getPossibleCellTargets(enemy, building);
                    building.target = targets[Math.floor(rng() * targets.length)];;
                }
                //Fire Kinetic
                if (building.target && building.stats.kineticFirepower > 0 && building.destroyed === false && building.stats.ammoStorage >= building.stats.ammoDraw) {
                    fireKineticTurret(building, board, building.target, enemy);
                }
                //Energy weapons only find a new target if they don't have one or if their target is destroyed
                if ((building.target === undefined || building.target.building.destroyed === true) && building.stats.energyFirepower > 0 && building.destroyed === false) {
                    const targets = getPossibleCellTargets(enemy, building);
                    building.target = targets[Math.floor(rng() * targets.length)];;
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
                return victory;
            } else {
                return false;
            }
        }
    }
    
    fireKineticTurret(building, board, target, enemy) {
        if (building.stats.windUpTime > building.windUpCounter) {
            building.windUpCounter++;
            return;
        }
        building.fireRateCounter++;
        if (building.fireRateCounter >= building.stats.fireRate) {
            building.stats.ammoStorage -= building.stats.ammoDraw;
            building.fireRateCounter = 0;
            setTimeout(function () {
                let damage = building.stats.kineticFirepower - target.building.stats.armor;
                if (rng() * 100 < building.stats.critChance) {
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
    
                                if(cell.building.destroyed === false){ //In cases where it is hit after death it needs to remain immoveable
                                    cell.building.moveable = false;
                                }
                                updateTargetHealthAndDeath(cell, enemy);
                            }
                        }
                    }
                }
            }, 1400);
        }
    }
    
    fireEnergyTurret(building, board, target, enemy) {
        if (building.stats.windUpTime > building.windUpCounter) {
            building.windUpCounter++;
            return;
        }
        building.fireRateCounter++;
        building.stats.powerStorage -= building.stats.powerDraw;
        building.stats.powerStorage = parseFloat(building.stats.powerStorage.toFixed(2));
        if (building.fireRateCounter >= building.stats.fireRate && building.stats.powerStorage >= building.stats.powerDraw) {
                building.fireRateCounter = 0;
    
                let damage = (building.stats.energyFirepower - target.building.stats.energyResistance) / 10;
                if (damage < 0.1) {
                    damage = 0.1;
                }
                
                target.building.stats.health -= parseFloat(damage.toFixed(2));
                target.building.stats.health = Math.floor(target.building.stats.health*10)/10;
    
                if(target.building.destroyed === false){ //In cases where it is hit after death it needs to remain moveable
                    target.building.moveable = false;
                }
    
                updateTargetHealthAndDeath(target, enemy);
        }
    }
    
    updateTargetHealthAndDeath(target, board) {
        if (target.building.stats.health <= 0) {
            if(target.building.destroyed === false){
                removeBuldingEffectsFromBoard(target.building, board);
            }
            if(target.building.name !== "Core"){
                target.building.moveable = true;
            }
            target.building.destroyed = true;
        }
    }
    
    getPossibleCellTargets(board, building) {
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
        return possibleCellTargets;
    }
}

module.exports = BattleManager;