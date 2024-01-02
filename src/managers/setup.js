import { gridHeight, gridWidth } from "../data/config.js";
import { createCardGraphicsForHand, setCardPositions } from "../components/cards.js";
import { buildRandomDeck, drawCardFromDeckToHand } from "../components/deck.js";
import { createGridWithStructuredNeighbors } from "../components/grids.js";
import { circularizeGrids } from "../components/grids.js";
import { placeBuildingToBoard } from "../gameplay/buildingPlacement.js";
import allBuildings from "../components/buildings";
import { boardWidth } from "../data/config.js";

export const fortStats = {
    kineticFirepower: {name:"Kinetic Firepower", stat: 0},
    energyFirepower: {name:"Energy Firepower", stat: 0},
    armor: {name:"Kinetic Damage Reduction", stat: 0},
    energyResistance: {name:"Energy Damage Reduction", stat: 0},
    kineticDamageBoost: {name:"Kinetic Damage Boost", stat: 0},
    energyDamageBoost: {name:"Energy Damage Boost", stat: 0},
    powerDraw: {name:"Power Draw", stat: 0},
    ammoStorage: {name:"Ammo Storage", stat: 0},
    powerStorage: {name:"Power Storage", stat: 0},
    radarRange: {name:"Radar Range", stat: 4.5},
};
    
export const playerBoard = {
    name:"Player",
    grid:createGridWithStructuredNeighbors(gridWidth, gridHeight),
    targetPosition:{x:0,y:0},
    position:{x:0,y:0},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:0,
};

export const enemyBoard = {
    name:"Enemy",
    grid:createGridWithStructuredNeighbors(gridWidth, gridHeight),
    position:{x:-boardWidth*2,y:0},
    targetPosition:{x:-boardWidth*2,y:0},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:1,
};

export const allBoards = [playerBoard];

export function setup(){
    buildRandomDeck();

    for(let i = 0; i < 5; i++){
        drawCardFromDeckToHand();
    }
    circularizeGrids();

    placeBuildingToBoard(allBuildings.core, playerBoard, -1, -1);
}