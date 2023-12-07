import { placeBuildingToBoard } from "./buildingPlacement";
import allBuildings from "./buildings";
import { cellSize, gridHeight, gridWidth } from "./config.js";
import { setCardPositions } from "./cards.js";
import { initializeControls } from "./controls.js";
import { buildRandomDeck } from "./deck.js";

export const canvas = document.getElementById('gridCanvas');
export const ctx = canvas.getContext('2d');

buildRandomDeck();

setCardPositions();

initializeControls(canvas);

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
    xGridOffset:(canvas.width-(gridWidth*cellSize))/2,
    yGridOffset:(canvas.height-(gridHeight*cellSize))/2-50,
    targetPosition:{x:(canvas.width-(gridWidth*cellSize))/2,y:(canvas.height-(gridHeight*cellSize))/2-50},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:0,
};

export const enemyBoard = {
    name:"Enemy",
    grid:createGridWithStructuredNeighbors(gridWidth, gridHeight),
    xGridOffset:(canvas.width-(gridWidth*cellSize))/2+200,
    yGridOffset:(canvas.height-(gridHeight*cellSize))/2-50,
    targetPosition:{x:(canvas.width-(gridWidth*cellSize))/2+200,y:(canvas.height-(gridHeight*cellSize))/2-50},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:1,
};
    
function createGridWithStructuredNeighbors(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid.push({ x, y, occupied: false, neighbors: {},building:undefined,effects:{}});
        }
    }

    // Compute neighbors for each cell
    grid.forEach(cell => {
        cell.visible = true;
        cell.neighbors = getStructuredNeighbors(cell.x, cell.y, width, height, grid);
        cell.shape = 0;
    });
    return grid;
}

function getStructuredNeighbors(x, y, width, height, grid) {
    const neighborPositions = {
        topLeft: { dx: -1, dy: -1 },
        top: { dx: 0, dy: -1 },
        topRight: { dx: 1, dy: -1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
        bottomLeft: { dx: -1, dy: 1 },
        bottom: { dx: 0, dy: 1 },
        bottomRight: { dx: 1, dy: 1 }
    };

    const neighbors = {};

    for (const [key, { dx, dy }] of Object.entries(neighborPositions)) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            neighbors[key] = grid[ny * width + nx];
        }
    }

    return neighbors;
}

export const allBoards = [playerBoard];

placeBuildingToBoard(allBuildings.core, playerBoard, 0, 0);