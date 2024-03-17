import { gridHeight, gridWidth, startingCardCount, startingCredits } from "../../../common/data/config.js";
import { buildDeck, drawCardFromDeckToHand } from "../components/deck.js";
import { createGridWithStructuredNeighbors } from "../components/grids.js";
import { circularizeGrids } from "../components/grids.js";
import { placeBuildingToBoard } from "../gameplay/buildingPlacement.js";
import allBuildings from "../../../common/buildings.js";
import { boardWidth } from "../../../common/data/config.js";
import { availableCredits, setAvailableCredits, setTotalCredits, totalCredits } from "../gameplay/credits.js";

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

export let strikes;
export let medals = 0;

export let allBoards = [];

export function gameSetup(){
    buildDeck();

    strikes = 0;
    medals = 0;

    setAvailableCredits(startingCredits);
    setTotalCredits(startingCredits);

    allBoards = [playerBoard];

    for(let i = 0; i < startingCardCount; i++){
        drawCardFromDeckToHand();
    }

    circularizeGrids();

    placeBuildingToBoard(allBuildings.core, playerBoard, -1, -1);
}

export function updateMedals(value){
    medals += value;
    if(medals < 0){
        medals = 0;
    }
}

export function updateStrikes(value){
    strikes += value;
    if(strikes < 0){
        strikes = 0;
    }
}