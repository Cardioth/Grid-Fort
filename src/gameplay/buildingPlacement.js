import { allBoards } from "../managers/setup";
import { getPointerGridLocation, getPointerScreenLocation, getPointerScreenLocationSnappedToGrid, updateBoardStats } from "../utilities/utils";
import { updateTotalCredits } from "./credits";
import { currentMouseX, currentMouseY, selectedBuilding, selectedCard } from "../ui/controls";
import { cellSize, gridHeight, gridWidth} from "../data/config";
import { boostArrow, arrowGraphics } from "../graphics/testGraphics";
import { playerBoard, enemyBoard } from "../managers/setup";
import { AIforts } from "../components/AIforts";
import { circularizeGrids } from "../components/grids";
import { buildingAssets, baseMesh, shadowGenerator } from '../graphics/initScene';

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

export function placeBuilding(building, gridX, gridY, board) {
    //One more check to be sure
    if (canPlaceBuilding(building, gridX, gridY, board)) {
        building.buildingGraphic = null;
        building.container = null;
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

export function unplaceBuilding(building, board) {
    const gridX = building.x;
    const gridY = building.y;

    board.allPlacedBuildings = board.allPlacedBuildings.filter(obj => obj !== building);
    //Update grid
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const cellIndex = (gridY + y) * gridWidth + (gridX + x);
            const shapeKey = building.shape[x + y * building.width];

            if (shapeKey >= 1 && shapeKey <= 4) {
                board.grid[cellIndex].occupied = false;
                board.grid[cellIndex].building = null;
                for (let key in building.stats) {
                    if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                        building.stats[key] -= board.grid[cellIndex].effects[key];
                    }
                }
                board.grid[cellIndex].shapeKey = 0;
            }
            if (shapeKey > 4) {
                if (board.grid[cellIndex]) {
                    if (board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined) {
                        for (let key in building.effects) {
                            for (let key2 in board.grid[cellIndex].building.stats) {
                                if (key2 === key) {
                                    board.grid[cellIndex].building.stats[key] -= building.effects[key];
                                }
                            }
                        }
                    }
                    for (let key in building.effects) {
                        if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                            board.grid[cellIndex].effects[key] -= building.effects[key];
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

export function placeBuildingToBoard(building, board, xLoc, yLoc) {
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

export function cloneBuilding(name, x, z, yRotation = 0) {
    let building = buildingAssets.meshes.find(m => m.name === name);
    if (building) {
        let clone = building.clone(name + "_clone", null, true);
        for (let i = 0; i < building.getChildMeshes().length; i++) {
            let child = building.getChildMeshes()[i];
            let childClone = child.clone(child.name + "_clone", clone, true);
            childClone.setEnabled(true);
            baseMesh.material.reflectionTexture.renderList.push(childClone); //Add to render list for reflections
            shadowGenerator.addShadowCaster(childClone); //Add to shadow generator

            //Bizzare rotation and scaling to get the building to face the right way
            childClone.rotation.x = -(90) * (Math.PI / 180);
            childClone.rotation.y = (yRotation + 180) * (Math.PI / 180);
            childClone.scaling.y = -1;

            childClone.position.x = x;
            childClone.position.z = z;
        }
        return clone;
    }
    return null;
}

export function updateBuildingGraphicPosition(mouseX, mouseY) {
    const gridX = getPointerGridLocation(mouseX, mouseY).x;
    const gridY = getPointerGridLocation(mouseX, mouseY).y;

    const xPosSmooth = getPointerScreenLocation(mouseX, mouseY).x;
    const yPosSmooth = getPointerScreenLocation(mouseX, mouseY).y;
    if(xPosSmooth !== null || yPosSmooth !== null){
        selectedCard.buildingGraphic.position.x = xPosSmooth;
        selectedCard.buildingGraphic.position.z = yPosSmooth;
        selectedCard.buildingGraphic.setEnabled(true);
    }

    if (gridX !== null && gridY !== null) {
        let placementResult = canPlaceBuildingNearest(selectedCard, gridX, gridY);
        if (placementResult.canPlace) {
            selectedCard.buildingGraphic.setEnabled(true);
            selectedCard.buildingGraphic.position.x = getPointerScreenLocationSnappedToGrid(mouseX, mouseY).x;
            selectedCard.buildingGraphic.position.z = getPointerScreenLocationSnappedToGrid(mouseX, mouseY).y;
        }
    }
}

