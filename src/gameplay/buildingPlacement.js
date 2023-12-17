import { allBoards } from "../managers/setup";
import { getPointerGridLocation, getPointerScreenLocation, getPointerScreenLocationSnappedToGrid, updateBoardStats, setMaterialToPrevious, setMaterialToBlocked } from "../utilities/utils";
import { updateTotalCredits } from "./credits";
import { currentMouseX, currentMouseY, selectedBuilding, selectedCard, setSelectedCard } from "../managers/eventListeners";
import { cellSize, gridHeight, gridWidth} from "../data/config";
import { boostArrow, arrowGraphics } from "../graphics/testGraphics";
import { playerBoard, enemyBoard } from "../managers/setup";
import { AIforts } from "../components/AIforts";
import { circularizeGrids } from "../components/grids";
import { buildingAssets, baseMesh, shadowGenerator, canvas } from '../graphics/initScene';
import { hand, setCardPositions } from "../components/cards";
import { drawGridTexture } from "../shaders/gridMaterial";
import { shapeKeyLegend } from "../data/config";
import { createSelectionLine } from "../graphics/createSelectionLine";


export let allBuildingGraphics = [];

export function placeBuilding(building, gridX, gridY, board) {
    //One more check to be sure
    if (canPlaceBuilding(building, gridX, gridY, board)) {
        //Pre Parse Setup
        const buildingGraphicHold = building.buildingGraphic;
        building.buildingGraphic = null;
        const buildingContainerHold = building.container;
        building.container = null;
        //Parse building
        const newBuilding = JSON.parse(JSON.stringify(building));
        //Post Parse Setup
        newBuilding.container = buildingContainerHold;
        newBuilding.buildingGraphic = buildingGraphicHold;
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
        for (let x = 0; x < newBuilding.width; x++) {
            for (let y = 0; y < newBuilding.height; y++) {
                const cellIndex = (gridY + y) * gridWidth + (gridX + x);
                const shapeKey = shapeKeyLegend[newBuilding.shape[x + y * newBuilding.width]];
                //Building
                if (shapeKey === "occupied" || shapeKey.endsWith("Weapon") || shapeKey.startsWith("anchorPoint")) {
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
                    
                    //set building position to anchor point
                    if(shapeKey.startsWith("anchorPoint")){
                        newBuilding.buildingGraphic.position.x =  ((-gridX - x + 8) / 4);
                        newBuilding.buildingGraphic.position.z = -((-gridY - y + 8) / 4);
                        newBuilding.buildingGraphic.targetPosition.x =  ((-gridX - x + 8) / 4);
                        newBuilding.buildingGraphic.targetPosition.z = -((-gridY - y + 8) / 4);
                    }

                    newBuilding.buildingGraphic.building = newBuilding;
                    for (let i = 0; i < newBuilding.buildingGraphic.getChildMeshes().length; i++) {
                        let child = newBuilding.buildingGraphic.getChildMeshes()[i];
                        child.building = newBuilding;
                    }
                }
                //Effects
                if (shapeKey.endsWith("booster")) {
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
    if (building.x === undefined || building.y === undefined) {
        return;
    }

    board.allPlacedBuildings = board.allPlacedBuildings.filter(obj => obj !== building);
    //Update grid
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const cellIndex = (gridY + y) * gridWidth + (gridX + x);
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
           
            if (shapeKey === "occupied" || shapeKey.endsWith("Weapon") || shapeKey.startsWith("anchorPoint")) {
                
                board.grid[cellIndex].occupied = false;
                board.grid[cellIndex].building = null;
                for (let key in building.stats) {
                    if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                        building.stats[key] -= board.grid[cellIndex].effects[key];
                    }
                }
                board.grid[cellIndex].shapeKey = 0;
            }
            if (shapeKey === "booster") {
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

    drawGridTexture();
}

function canPlaceBuilding(building, gridX, gridY, board) {
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            if (shapeKey === "occupied" || shapeKey.endsWith("Weapon") || shapeKey.startsWith("anchorPoint")) {
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
    building.shape = newShape;
    building.width = height;
    building.height = width;

    // Adjustments for building graphic rotation
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            if(shapeKey.startsWith("anchorPoint")){
                building.rotationAdjustment.x =  ((-x) / 4);
                building.rotationAdjustment.y = -((-y) / 4);
            }
        }
    }
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

export function cloneBuilding(name, x, z, yRotation = 0, card) {
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
        clone.targetPosition = { x: x, z: z };
        allBuildingGraphics.push(clone);
        return clone;
    }
    return null;
}

export function updateBuildingGraphicPosition(building) {

    //Get Mouse Position in Grid
    const gridX = getPointerGridLocation().x;
    const gridY = getPointerGridLocation().y;

    //Rotation adjustment for anchor point
    let rotationAdjustmentX = building.rotationAdjustment.x;
    let rotationAdjustmentY = building.rotationAdjustment.y;

    for (let i = 0; i < building.buildingGraphic.getChildMeshes().length; i++) {
        setMaterialToBlocked(building.buildingGraphic.getChildMeshes()[i]);
    }

    //If mouse position is in grid
    if (gridX !== null && gridY !== null) {
        let placementResult = canPlaceBuildingNearest(building, gridX, gridY);
        if (placementResult.canPlace) {
            building.buildingGraphic.targetPosition.x = getPointerScreenLocationSnappedToGrid().x-placementResult.adjustedX*0.25+rotationAdjustmentX;
            building.buildingGraphic.targetPosition.z = getPointerScreenLocationSnappedToGrid().y+placementResult.adjustedY*0.25+rotationAdjustmentY;
            for (let i = 0; i < building.buildingGraphic.getChildMeshes().length; i++) {
                setMaterialToPrevious(building.buildingGraphic.getChildMeshes()[i]);
            }
        } else {
            building.buildingGraphic.targetPosition.x = getPointerScreenLocation().x;
            building.buildingGraphic.targetPosition.z = getPointerScreenLocation().y;
        }
    } else {
        building.buildingGraphic.targetPosition.x = getPointerScreenLocation().x;
        building.buildingGraphic.targetPosition.z = getPointerScreenLocation().y;
    }
    
    building.buildingGraphic.rotation.y = building.rotation;
    //Rotate all children meshes of the building graphic
    for (let i = 0; i < building.buildingGraphic.getChildMeshes().length; i++) {
        let child = building.buildingGraphic.getChildMeshes()[i];
        child.rotation.y = building.rotation;
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
    selectedCard.shape = [...selectedCard.originalShape];
    selectedCard.width = selectedCard.originalWidth;
    selectedCard.height = selectedCard.originalHeight;

    setCardPositions();
    selectedCard.currentPosition.x = currentMouseX - canvas.width / 2;
    selectedCard.currentPosition.y = currentMouseY - canvas.height / 2;

    if (selectedBuilding.buildingGraphic !== undefined) {
        selectedBuilding.buildingGraphic.dispose();
        allBuildingGraphics = allBuildingGraphics.filter(obj => obj !== selectedBuilding.buildingGraphic);
    }

    if (selectedBuilding.placed === true) {
        updateTotalCredits(selectedCard.cost);
        circularizeGrids();
        selectedBuilding.placed = false;
    }
}
export function createBuildingGraphicFromCard(building) {
    building.buildingGraphic = cloneBuilding(selectedBuilding.keyName + "Building", 0, 0, 0, building);
    building.buildingGraphic.isDragged = true;
    building.buildingGraphic.setEnabled(false);
    building.rotationAdjustment = { x: 0, y: 0 };
    const gridLoc = { x: getPointerScreenLocation().x, y: getPointerScreenLocation().y };
    building.buildingGraphic.targetPosition.x = gridLoc.x;
    building.buildingGraphic.targetPosition.z = gridLoc.y;
    building.buildingGraphic.position.x = gridLoc.x;
    building.buildingGraphic.position.z = gridLoc.y;
    building.buildingGraphic.setEnabled(true);
    createSelectionLine(building.buildingGraphic.getChildMeshes()[0]);
}

