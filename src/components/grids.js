import { unplaceBuilding } from "../gameplay/buildingPlacement";
import { gridWidth, gridHeight } from "../data/config";
import { updateAvailableCredits, updateTotalCredits } from "../gameplay/credits";
import { allBoards, playerBoard } from "../managers/gameSetup";
import { updateBoardStats } from "../utilities/utils";
import { hand, setCardPositions } from "./cards";

export function createGridWithStructuredNeighbors(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid.push({ x, y, occupied: false, neighbors: {}, building: undefined, effects: {} });
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

export function circularizeGrids() {
    const centerX = (gridWidth - 1) / 2;
    const centerY = (gridHeight - 1) / 2;

    allBoards.forEach((board) => {
        updateBoardStats(board);
        const radius = board.stats.radarRange.stat;
        board.grid.forEach(cell => {
            const distanceFromCenter = Math.sqrt(Math.pow(cell.x - centerX, 2) + Math.pow(cell.y - centerY, 2));
            const outsideRadius = distanceFromCenter > radius;
            if (outsideRadius) {
                if (cell.occupied === true && cell.building !== undefined) {
                    hand.push(cell.building);
                    setCardPositions();
                    cell.building.currentPosition.x = 0;
                    cell.building.currentPosition.y = 0;
                    if(board === playerBoard){
                        updateAvailableCredits(cell.building.cost);
                    }
                    cell.building.placed = false;
                    unplaceBuilding(cell.building, board);
                }
                cell.occupied = true;
                cell.visible = false;
                cell.building = undefined;
            } else {
                if (cell.visible === false) {
                    cell.occupied = false;
                    cell.visible = true;
                }
            }
        });
    });
}

