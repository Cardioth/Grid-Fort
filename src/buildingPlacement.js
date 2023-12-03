import { allBoards, updateBoardStats } from "./app";
import { totalCredits, updateTotalCredits } from "./credits";
import { currentMouseX, currentMouseY } from "./controls";
import { selectedCard } from "./controls";
import { setCardPositions, hand } from "./cards";
import { cellSize, gridHeight, gridWidth} from "./config";
import { boostArrow, arrowGraphics } from "./graphics";
import { playerBoard, canvas, enemyBoard } from "./setup";
import { AIforts } from "./AIforts";

export function getHoveredBuilding() {
    for (const board of allBoards) {
        // Calculate grid cell coordinates
        const gridX = Math.floor((currentMouseX - board.xGridOffset) / cellSize);
        const gridY = Math.floor((currentMouseY - board.yGridOffset) / cellSize);

        if (gridY < gridHeight && gridX < gridWidth && gridY >= 0 && gridX >= 0 && board.grid[gridY * gridWidth + gridX].occupied) {
            return board.grid[gridY * gridWidth + gridX].building;
        }
    }
    return null;
}
export function placeBuilding(building, mouseX, mouseY, board) {
    // Calculate top-left corner for the building and adjust to snap to grid
    const gridX = Math.floor((mouseX - board.xGridOffset) / cellSize) - Math.floor(building.width / 2);
    const gridY = Math.floor((mouseY - board.yGridOffset) / cellSize) - Math.floor(building.height / 2);

    if (canPlaceBuilding(building, gridX, gridY, board)) {
        const newBuilding = JSON.parse(JSON.stringify(building));
        newBuilding.uid = Math.random().toString(36).substring(7);
        newBuilding.x = gridX;
        newBuilding.y = gridY;
        newBuilding.placed = true;
        newBuilding.boardId = board.id;
        board.allPlacedBuildings.push(newBuilding);
        updateBoardStats(board);
        circularizeGrids();

        if (selectedCard !== null) {
            updateTotalCredits(-newBuilding.cost);
        }

        //Update grid
        for (let x = 0; x < building.width; x++) {
            for (let y = 0; y < building.height; y++) {
                const cellIndex = (gridY + y) * gridWidth + (gridX + x);
                const shapeKey = building.shape[x + y * building.width];
                //Building
                if (shapeKey >= 1 && shapeKey <= 4) {
                    //add cell effects to building
                    for (let key in board.grid[cellIndex].effects) {
                        for (let key2 in newBuilding.stats) {
                            if (key === key2) {
                                newBuilding.stats[key] += board.grid[cellIndex].effects[key];
                                if (board.grid[cellIndex].effects[key] > 0) {
                                    const newBoostArrow = { ...boostArrow };
                                    newBoostArrow.x = (gridX + x) * cellSize + board.xGridOffset + (cellSize / 2);
                                    newBoostArrow.y = (gridY + y) * cellSize + board.yGridOffset + (cellSize / 2);
                                    arrowGraphics.push(newBoostArrow);
                                }
                            }
                        }
                    }
                    board.grid[cellIndex].occupied = true;
                    board.grid[cellIndex].building = newBuilding;
                    board.grid[cellIndex].shapeKey = shapeKey;
                }
                //Effects
                if (shapeKey > 4) {
                    if (board.grid[cellIndex]) {
                        for (let key in newBuilding.effects) {
                            //Add effects to existing building stats
                            if (board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined) {
                                for (let key2 in board.grid[cellIndex].building.stats) {
                                    if (key2 === key) {
                                        board.grid[cellIndex].building.stats[key] += newBuilding.effects[key];
                                        //Boost graphics
                                        const newBoostArrow = { ...boostArrow };
                                        newBoostArrow.x = (gridX + x) * cellSize + board.xGridOffset + (cellSize / 2);
                                        newBoostArrow.y = (gridY + y) * cellSize + board.yGridOffset + (cellSize / 2);
                                        arrowGraphics.push(newBoostArrow);
                                    }
                                }
                            }
                            //Add effects to cell effects
                            if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                                board.grid[cellIndex].effects[key] += newBuilding.effects[key];
                            } else {
                                board.grid[cellIndex].effects[key] = newBuilding.effects[key];
                            }
                        }
                    }
                }
            }
        }
        updateBoardStats(board);
    } else {
        return false;
    }
}
export function unplaceBuilding(building) {
    const gridX = building.x;
    const gridY = building.y;

    playerBoard.allPlacedBuildings = playerBoard.allPlacedBuildings.filter(obj => obj !== building);
    //Update grid
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const cellIndex = (gridY + y) * gridWidth + (gridX + x);
            const shapeKey = building.shape[x + y * building.width];

            if (shapeKey >= 1 && shapeKey <= 4) {
                playerBoard.grid[cellIndex].occupied = false;
                playerBoard.grid[cellIndex].building = null;
                for (let key in building.stats) {
                    if (playerBoard.grid[cellIndex].effects.hasOwnProperty(key)) {
                        building.stats[key] -= playerBoard.grid[cellIndex].effects[key];
                    }
                }
                playerBoard.grid[cellIndex].shapeKey = 0;
            }
            if (shapeKey > 4) {
                if (playerBoard.grid[cellIndex]) {
                    if (playerBoard.grid[cellIndex].occupied && playerBoard.grid[cellIndex].building !== undefined) {
                        for (let key in building.effects) {
                            for (let key2 in playerBoard.grid[cellIndex].building.stats) {
                                if (key2 === key) {
                                    playerBoard.grid[cellIndex].building.stats[key] -= building.effects[key];
                                }
                            }
                        }
                    }
                    for (let key in building.effects) {
                        if (playerBoard.grid[cellIndex].effects.hasOwnProperty(key)) {
                            playerBoard.grid[cellIndex].effects[key] -= building.effects[key];
                        }
                    }
                }
            }
        }
    }
}
function canPlaceBuilding(building, gridX, gridY, board) {
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = building.shape[x + y * building.width];
            if (shapeKey >= 1 && shapeKey <= 4) {
                const cellX = gridX + x;
                const cellY = gridY + y;
                // Check bounds and if cell is already occupied
                if (cellX < 0 || cellX >= gridWidth || cellY < 0 || cellY >= gridHeight || board.grid[cellY * gridWidth + cellX].occupied) {
                    return false;
                }
            }
        }
    }
    return true;
}

export function canPlaceBuildingNearest(building, gridX, gridY) {
    const directions = [[0, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    for (let [dx, dy] of directions) {
        if (canPlaceBuilding(building, gridX + dx, gridY + dy, playerBoard)) {
            return { canPlace: true, adjustedX: dx, adjustedY: dy };
        }
    }
    return { canPlace: false };
}

export function rotateBuilding(building, direction = 'R') {
    let newShape = [];
    const { width, height, shape } = building;

    if (direction === 'R') {
        // Transpose and reverse rows for clockwise rotation
        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                newShape.push(shape[y * width + x]);
            }
        }
    } else {
        // Transpose and reverse columns for counterclockwise rotation
        for (let x = width - 1; x >= 0; x--) {
            for (let y = 0; y < height; y++) {
                newShape.push(shape[y * width + x]);
            }
        }
    }
    // Update the shape object
    building.shape = newShape;
    building.width = height;
    building.height = width;
}

export function circularizeGrids() {
    const centerX = (gridWidth - 1) / 2;
    const centerY = (gridHeight - 1) / 2;

    allBoards.forEach((board) => {
        const radius = board.stats.radarRange.stat;
        board.grid.forEach(cell => {
            const distanceFromCenter = Math.sqrt(Math.pow(cell.x - centerX, 2) + Math.pow(cell.y - centerY, 2));
            const outsideRadius = distanceFromCenter > radius;
            if (outsideRadius) {
                if (cell.occupied === true && cell.building !== undefined) {
                    hand.push(cell.building);
                    setCardPositions();
                    cell.building.currentPosition.x = canvas.width / 2;
                    cell.building.currentPosition.y = canvas.height / 2;
                    totalCredits += cell.building.cost;
                    cell.building.placed = false;
                    unplaceBuilding(cell.building);
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

}export function placeBuildingToBoard(building, board, xLoc, yLoc) {
    placeBuilding(JSON.parse(JSON.stringify(building)), board.xGridOffset + (gridWidth * cellSize) / 2 + (xLoc * cellSize), board.yGridOffset + (gridHeight * cellSize) / 2 + (yLoc * cellSize), board);
}
export function placeAIFort(AIfortIndex) {
    const AIfort = AIforts[AIfortIndex];
    AIfort.layout.forEach((building) => {
        const newBuilding = { ...building.building };
        if (building.rotation === "R" || building.rotation === "L") {
            rotateBuilding(newBuilding, building.rotation);
        } else if (building.rotation === "RR") {
            rotateBuilding(newBuilding, building.rotation);
            rotateBuilding(newBuilding, building.rotation);
        }
        placeBuildingToBoard(newBuilding, enemyBoard, building.x, building.y);
    });
}

