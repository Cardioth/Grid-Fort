import { allBoards } from "../managers/setup";
import { getPointerGridLocation, getPointerScreenLocation, getPointerScreenLocationSnappedToGrid, updateBoardStats, setMaterialToPrevious, setMaterialToBlocked } from "../utilities/utils";
import { updateTotalCredits } from "./credits";
import { currentMouseX, currentMouseY, selectedBuilding, selectedCard, setSelectedCard } from "../ui/controls";
import { cellSize, gridHeight, gridWidth} from "../data/config";
import { boostArrow, arrowGraphics } from "../graphics/testGraphics";
import { playerBoard, enemyBoard } from "../managers/setup";
import { AIforts } from "../components/AIforts";
import { circularizeGrids } from "../components/grids";
import { buildingAssets, baseMesh, shadowGenerator, canvas } from '../graphics/initScene';
import { hand, setCardPositions } from "../components/cards";
import { drawGridTexture } from "../shaders/gridMaterial";

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
        drawGridTexture();
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
        building.rotation += Math.PI / 2;
        // Transpose and reverse rows for clockwise rotation
        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                newShape.push(shape[y * width + x]);
            }
        }
    } else {
        building.rotation -= Math.PI / 2;    
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
            childClone.scaling.y = -1;

            childClone.position.x = x;
            childClone.position.z = z;
            childClone.defaultMaterial = childClone.material;
        }
        return clone;
    }
    return null;
}

export function updateBuildingGraphicPosition() {
    const gridX = getPointerGridLocation(currentMouseX, currentMouseY).x;
    const gridY = getPointerGridLocation(currentMouseX, currentMouseY).y;

    const xPosSmooth = getPointerScreenLocation(currentMouseX, currentMouseY).x;
    const yPosSmooth = getPointerScreenLocation(currentMouseX, currentMouseY).y;

    //Rotation adjustment to account for the fact that the building graphic is centered on the grid
    let rotationAdjustmentX = 0;
    let rotationAdjustmentY = 0;
    let rotationModulus = selectedCard.rotation % (Math.PI*2);

    if(rotationModulus > 0){
        rotationAdjustmentX = -0.25;
        rotationAdjustmentY = 0;
    }
    if(rotationModulus > Math.PI/2){
        rotationAdjustmentX = -0.25;
        rotationAdjustmentY = 0.25;
    }
    if(rotationModulus > Math.PI){
        rotationAdjustmentX = 0;
        rotationAdjustmentY = 0.25;
    }

    if(xPosSmooth !== null || yPosSmooth !== null){
        selectedCard.buildingGraphic.position.x = xPosSmooth;
        selectedCard.buildingGraphic.position.z = yPosSmooth;
        selectedCard.buildingGraphic.setEnabled(true);
    }

    for (let i = 0; i < selectedCard.buildingGraphic.getChildMeshes().length; i++) {
        setMaterialToBlocked(selectedCard.buildingGraphic.getChildMeshes()[i]);
    }

    if (gridX !== null && gridY !== null) {
        let placementResult = canPlaceBuildingNearest(selectedCard, gridX, gridY);
        if (placementResult.canPlace) {
            selectedCard.buildingGraphic.setEnabled(true);
            selectedCard.buildingGraphic.position.x = getPointerScreenLocationSnappedToGrid(currentMouseX, currentMouseY).x-placementResult.adjustedX*0.25+rotationAdjustmentX;
            selectedCard.buildingGraphic.position.z = getPointerScreenLocationSnappedToGrid(currentMouseX, currentMouseY).y+placementResult.adjustedY*0.25+rotationAdjustmentY;

            for (let i = 0; i < selectedCard.buildingGraphic.getChildMeshes().length; i++) {
                setMaterialToPrevious(selectedCard.buildingGraphic.getChildMeshes()[i]);
            }
        }
    }
    
    selectedCard.buildingGraphic.rotation.y = selectedCard.rotation;
    //Rotate all children meshes of the building graphic
    for (let i = 0; i < selectedCard.buildingGraphic.getChildMeshes().length; i++) {
        let child = selectedCard.buildingGraphic.getChildMeshes()[i];
        child.rotation.y = selectedCard.rotation;
    }
}

export function returnBuildingToDeck() {
    drawGridTexture();
    const arrayIndex = Math.floor(((currentMouseX) / (canvas.width - 50)) * hand.length);
    if (selectedCard === null) {
        setSelectedCard(selectedBuilding);
    }
    hand.splice(arrayIndex, 0, selectedCard);
    selectedCard.container.isVisible = true;

    setCardPositions();
    selectedCard.currentPosition.x = currentMouseX - canvas.width / 2;
    selectedCard.currentPosition.y = currentMouseY - canvas.height / 2;

    if (selectedBuilding.buildingGraphic !== undefined) {
        selectedBuilding.buildingGraphic.dispose();
    }

    if (selectedBuilding.placed === true) {
        updateTotalCredits(selectedCard.cost);
        circularizeGrids();
        selectedBuilding.placed = false;
    }
}

