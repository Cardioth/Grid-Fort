import { getPointerGridLocation, getPointerScreenLocation, getPointerScreenLocationSnappedToGrid, updateBoardStats, setMaterialToDefault, setMaterialToBlocked } from "../utilities/utils";
import { availableCredits, updateAvailableCredits } from "./credits";
import { currentMouseX, currentMouseY, selectedBuilding, selectedCard, setSelectedCard, selectedPlacedBuilding } from "../managers/eventListeners";
import { gridHeight, gridWidth, shapeKeyLegend} from "../../../common/data/config";
import { playerBoard, enemyBoard } from "../managers/gameSetup";
import { AIforts } from "../components/AIforts";
import { circularizeGrids } from "../components/grids";
import { buildingAssets, baseMesh, shadowGenerator, canvas, weaponAssets, GUITexture } from '../graphics/sceneInitialization';
import { hand, setCardPositions } from "../components/cards";
import { drawGridTexture } from "../shaders/gridMaterial";
import { displayBuildingInfo, hideEndTurnButton, highlightEndTurnButton, updateBuildingStatsText } from "../ui/gameGUI";
import * as BABYLON from '@babylonjs/core';
import { weaponIdleAnimation } from "../graphics/animations/weaponAnimations";
import { boosterRisingAnimation, createBoosterCellGraphic, removeBoosterCellGraphicsByCell } from "../graphics/boosterCellGraphics";
import { setSelectedPlacedBuilding } from "../managers/eventListeners";
import { addBuildingSpecificAnimations } from "../graphics/animations/buildingSpecificAnimations";
import allBuildings from "../../../common/buildings";
import { createHealthBarGraphic } from "../graphics/buildingHealthBar";
import { darkenBuilding } from "../graphics/darkenBuilding";

export let allBuildingGraphics = [];

export function placeBuilding(building, gridX, gridY, board) {
    //GridX and GridY are the top left corner of the building not the anchor point
    //One more check to be sure
    if (canPlaceBuilding(building, gridX, gridY, board)) {
        //Pre Parse Setup
        const buildingGraphicHold = building.buildingGraphic;
        building.buildingGraphic = null;
        const buildingContainerHold = building.container;
        building.container = null;
        const buildingHealthBarGraphicHold = building.healthBarGraphic;
        building.healthBarGraphic = null;
        //Parse building
        const newBuilding = JSON.parse(JSON.stringify(building));
        //Post Parse Setup
        newBuilding.healthBarGraphic = buildingHealthBarGraphicHold;
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
            updateAvailableCredits(-newBuilding.cost);
            if(availableCredits === 0){
                highlightEndTurnButton();
            }
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
                                if(board.grid[cellIndex].effects[key] > 0){
                                    if(board === playerBoard){
                                        boosterRisingAnimation(board.grid[cellIndex]);
                                    }
                                    if(newBuilding.bonuses.filter(obj => obj.key === key).length === 0){
                                        newBuilding.bonuses.push({key:key, value:board.grid[cellIndex].effects[key]});
                                    } else {
                                        newBuilding.bonuses.filter(obj => obj.key === key)[0].value += board.grid[cellIndex].effects[key];
                                    }
                                }
                            }
                        }
                    }
                    board.grid[cellIndex].occupied = true;
                    board.grid[cellIndex].building = newBuilding;
                    board.grid[cellIndex].shapeKey = shapeKey;
                    
                    //set building position to anchor point
                    if(shapeKey.startsWith("anchorPoint")){
                        newBuilding.buildingGraphic.position.x =  ((-gridX - x + 8) / 4)+board.position.x;
                        newBuilding.buildingGraphic.position.z = -((-gridY - y + 8) / 4)+board.position.y;
                        newBuilding.buildingGraphic.targetPosition.x =  ((-gridX - x + 8) / 4)+board.position.x;
                        newBuilding.buildingGraphic.targetPosition.z = -((-gridY - y + 8) / 4)+board.position.y;
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
                                        if(board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key).length === 0){
                                            board.grid[cellIndex].building.bonuses.push({key:key, value:newBuilding.effects[key]});
                                        } else {
                                            board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key)[0].value += newBuilding.effects[key];
                                        }
                                    }
                                }
                            }
                            //Add effects to cell effects
                            if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                                board.grid[cellIndex].effects[key] += newBuilding.effects[key];
                            } else {
                                board.grid[cellIndex].effects[key] = newBuilding.effects[key];
                            }
                            if (board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined && newBuilding.effects[key] > 0 && board === playerBoard) {
                                boosterRisingAnimation(board.grid[cellIndex]);
                            }
                        }
                    }
                }
            }
        }
        //Finishing up building placement
        drawGridTexture();
        updateBoardStats(board);
        updateBoostGraphics();
        if(selectedPlacedBuilding === building){
            setSelectedPlacedBuilding(newBuilding);
            GUITexture.buildingInfo.selectedBuilding = newBuilding;
        }
        updateBuildingStatsText();
        for (let i = 0; i < newBuilding.buildingGraphic.getChildMeshes().length; i++) {
            setMaterialToDefault(newBuilding.buildingGraphic.getChildMeshes()[i]);
        }
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
                        if(building.bonuses.filter(obj => obj.key === key).length > 0){
                            building.bonuses.filter(obj => obj.key === key)[0].value -= board.grid[cellIndex].effects[key];
                            if(building.bonuses.filter(obj => obj.key === key)[0].value <= 0){
                                building.bonuses = building.bonuses.filter(obj => obj.key !== key);
                            }
                        }
                    }
                }
                board.grid[cellIndex].shapeKey = 0;
            }
            if (shapeKey === "booster") {
                if (board.grid[cellIndex]) {
                    if (board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined && !building.destroyed) {
                        for (let key in building.effects) {
                            for (let key2 in board.grid[cellIndex].building.stats) {
                                if (key2 === key) {
                                    board.grid[cellIndex].building.stats[key] -= building.effects[key];
                                    if(board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key).length > 0){
                                        board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key)[0].value -= building.effects[key];
                                        if(board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key)[0].value <= 0){
                                            board.grid[cellIndex].building.bonuses = board.grid[cellIndex].building.bonuses.filter(obj => obj.key !== key);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let key in building.effects) {
                        if (board.grid[cellIndex].effects.hasOwnProperty(key) && !building.destroyed) {
                            board.grid[cellIndex].effects[key] -= building.effects[key];
                        }
                    }
                }
            }
        }
    }
    
    updateBuildingStatsText();
    updateBoostGraphics();
    drawGridTexture();
}

export function removeBuldingEffectsFromBoard(building, board) {
    const gridX = building.x;
    const gridY = building.y;
    if (building.x === undefined || building.y === undefined) {
        return;
    }
    //Update grid
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const cellIndex = (gridY + y) * gridWidth + (gridX + x);
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
           
            if (shapeKey === "booster") {
                if (board.grid[cellIndex]) {
                    if (board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined) {
                        for (let key in building.effects) {
                            for (let key2 in board.grid[cellIndex].building.stats) {
                                if (key2 === key) {
                                    board.grid[cellIndex].building.stats[key] -= building.effects[key];
                                    if(board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key).length > 0){
                                        board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key)[0].value -= building.effects[key];
                                        if(board.grid[cellIndex].building.bonuses.filter(obj => obj.key === key)[0].value <= 0){
                                            board.grid[cellIndex].building.bonuses = board.grid[cellIndex].building.bonuses.filter(obj => obj.key !== key);
                                        }
                                    }
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

    updateBoostGraphics();
}

function canPlaceBuilding(building, gridX, gridY, board) {
    if(building.destroyed){
        return false;
    }

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

export function rotateBuilding(building, direction = 'R', graphicOnly = false) {
    let newShape = [];
    const currentRotation = building.rotation;
    const { width, height, shape } = building;
    if (direction === 'R') {
        if (currentRotation === "N") {
            building.rotation = "R";
        } else if (currentRotation === "R") {
            building.rotation = "RR";
        } else if (currentRotation === "RR") {
            building.rotation = "L";
        } else if (currentRotation === "L") {
            building.rotation = "N";
        }
        if(building.buildingGraphic){
            building.buildingGraphic.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
        }
        if(!graphicOnly){
            // Transpose and reverse rows for clockwise rotation
            for (let x = 0; x < width; x++) {
                for (let y = height - 1; y >= 0; y--) {
                    newShape.push(shape[y * width + x]);
                }
            }
        }
    } else {
        if (currentRotation === "N") {
            building.rotation = "L";
        } else if (currentRotation === "L") {
            building.rotation = "RR";
        } else if (currentRotation === "RR") {
            building.rotation = "R";
        } else if (currentRotation === "R") {
            building.rotation = "N";
        }
        if(building.buildingGraphic){
            building.buildingGraphic.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
        }
        if(!graphicOnly){
        // Transpose and reverse columns for counterclockwise rotation
            for (let x = width - 1; x >= 0; x--) {
                for (let y = 0; y < height; y++) {
                    newShape.push(shape[y * width + x]);
                }
            }
        }
    }

    // Adjustments for building graphic rotation
    if(!graphicOnly){
        building.width = height;
        building.height = width;
        building.shape = newShape;
        setAnchorRotationAdjustment(building);
    }
    
}

export function setAnchorRotationAdjustment(building) {
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            if (shapeKey.startsWith("anchorPoint")) {
                building.rotationAdjustment.x = ((-x) / 4);
                building.rotationAdjustment.y = -((-y) / 4);
            }
        }
    }
}

export function placeBuildingToBoard(building, board, xLoc, yLoc, rotation = "N") {
    if(canPlaceBuilding(building, xLoc+8, yLoc+8, board)){
        createBuildingGraphicFromCard(building, board, rotation);
        placeBuilding(building, xLoc+8, yLoc+8, board);
    }
}

export function cloneBuilding(name, x, z) {
    let building = buildingAssets.meshes.find(m => m.name === name);
    if (building) {
        let clone = building.clone(name + "_clone", null, true);
        for (let i = 0; i < building.getChildMeshes().length; i++) {
            let child = building.getChildMeshes()[i];
            let childClone = child.clone(child.name + "_clone", clone, true);
            childClone.setEnabled(true);
            baseMesh.material.reflectionTexture.renderList.push(childClone); //Add to render list for reflections
            if(shadowGenerator){
                shadowGenerator.addShadowCaster(childClone); //Add to shadow generator
            }

            //Convert Z up to Y up
            childClone.rotation.x = -(90) * (Math.PI / 180);
            childClone.scaling.y = -1;

            childClone.position.x = x;
            childClone.position.z = z;

            childClone.defaultMaterial = childClone.material;
        }

        clone.targetPosition = { x: x, z: z };
        addBuildingSpecificAnimations(clone);
        allBuildingGraphics.push(clone);
        return clone;
    }
    return null;
}

export function cloneWeapon(name, x, z, yRotation = 0, newParentNode){
    let weapon = weaponAssets.meshes.find(m => m.name === name);
    if (weapon) {
        let clone = weapon.clone(name + "_clone", null, true);
        for (let i = 0; i < weapon.getChildMeshes().length; i++) {
            let child = weapon.getChildMeshes()[i];
            let childClone = child.clone(child.name + "_clone", clone, true);
            childClone.setEnabled(true);
            baseMesh.material.reflectionTexture.renderList.push(childClone); //Add to render list for reflections

            //Convert Z up to Y up
            childClone.rotation.x = -(90) * (Math.PI / 180);

            //Scale up cause it's tiny
            childClone.scaling.y = 40;
            childClone.scaling.x = 40;
            childClone.scaling.z = 40;
            childClone.position.x = x;
            childClone.position.z = z;

            childClone.defaultMaterial = childClone.material;            
        }
        clone.parent = newParentNode;
        newParentNode.turret = clone;
        clone.position.x = 0;
        clone.position.z = 0;
        clone.position.y = 0;

        weaponIdleAnimation(clone);
        clone.attacking = false;
        
        return clone;
    }
}

function updateBoostGraphics(){
    for (const cell of playerBoard.grid) {    
        let hasBooster = false;
        for (const key in cell.effects) {
            if (cell.effects[key] > 0) {
                hasBooster = true;
                break;
            }
        }

        if (!hasBooster && cell.boosterGraphic === undefined) {
            continue;
        }
    
        if (hasBooster && cell.boosterGraphic === undefined && !cell.occupied) {
            createBoosterCellGraphic(cell);
        }
        
        if ((!hasBooster && cell.boosterGraphic !== undefined) || (cell.occupied && cell.boosterGraphic !== undefined)) {
            removeBoosterCellGraphicsByCell(cell);
        }

    }
    
}

export function updateBuildingGraphicPosition(building) {
    //Get Mouse Position in Grid
    const gridX = getPointerGridLocation().x+(building.rotationAdjustment.x*4);
    const gridY = getPointerGridLocation().y-(building.rotationAdjustment.y*4);

    for (let i = 0; i < building.buildingGraphic.getChildMeshes().length; i++) {
        setMaterialToBlocked(building.buildingGraphic.getChildMeshes()[i]);
    }

    //If mouse position is in grid
    if (gridX !== null && gridY !== null) {
        let placementResult = canPlaceBuildingNearest(building, gridX, gridY);
        if (placementResult.canPlace) {
            building.buildingGraphic.targetPosition.x = getPointerScreenLocationSnappedToGrid().x-placementResult.adjustedX*0.25;
            building.buildingGraphic.targetPosition.z = getPointerScreenLocationSnappedToGrid().y+placementResult.adjustedY*0.25;
            for (let i = 0; i < building.buildingGraphic.getChildMeshes().length; i++) {
                setMaterialToDefault(building.buildingGraphic.getChildMeshes()[i]);
            }
        } else {
            building.buildingGraphic.targetPosition.x = getPointerScreenLocation().x;
            building.buildingGraphic.targetPosition.z = getPointerScreenLocation().y;
        }
    } else {
        building.buildingGraphic.targetPosition.x = getPointerScreenLocation().x;
        building.buildingGraphic.targetPosition.z = getPointerScreenLocation().y;
    }
}

export function returnSelectedBuildingToDeck() {
    if (selectedBuilding.buildingGraphic !== undefined) {
        selectedBuilding.buildingGraphic.dispose();
        allBuildingGraphics = allBuildingGraphics.filter(obj => obj !== selectedBuilding.buildingGraphic);
    }
    if (selectedBuilding.healthBarGraphic) {
        selectedBuilding.healthBarGraphic.dispose();
    }


    drawGridTexture(); //Update grid texture
    displayBuildingInfo(null); //Update building info panel

    if (!selectedBuilding.destroyed){
        const arrayIndex = Math.floor(((currentMouseX) / (canvas.width - 50)) * hand.length); //Update this math so that it only spans the width of the cards in hand
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
    
        if (selectedBuilding.placed === true) {
            const creditsAboveZero = availableCredits > 0;
            updateAvailableCredits(selectedCard.cost);
            circularizeGrids();
            selectedBuilding.placed = false;
            if(availableCredits > 0 && !creditsAboveZero){
                hideEndTurnButton();
            }
        }
    }

}

export function createBuildingGraphicFromCard(building, board, rotation) {
    building.buildingGraphic = cloneBuilding(building.keyName + "Building", 0, 0);
    building.buildingGraphic.isDragged = true;
    building.rotationAdjustment = { x: 0, y: 0 };
    const gridLoc = { x: getPointerScreenLocation().x, y: getPointerScreenLocation().y };
    building.buildingGraphic.targetPosition.x = gridLoc.x+board.position.x;
    building.buildingGraphic.targetPosition.z = gridLoc.y+board.position.y;
    building.buildingGraphic.position.x = gridLoc.x+board.position.x;
    building.buildingGraphic.position.z = gridLoc.y+board.position.y;
    building.buildingGraphic.setEnabled(true);

    if(building.stats.health < allBuildings[building.keyName].stats.health){
        createHealthBarGraphic(building);
    }

    // Find anchor point
    let anchorPointLocation = {x:0,y:0};
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            if (shapeKey.startsWith("anchorPoint")) {
                anchorPointLocation = {x,y};
            }
        }
    }

    // Clone weapons
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = shapeKeyLegend[building.shape[x + y * building.width]];
            // If weapon is already on the anchor point clone it at the center of the building
            if (shapeKey.endsWith("Weapon") && shapeKey.startsWith("anchorPoint")) {
                cloneWeapon(building.keyName + "Weapon", 0, 0, 0, building.buildingGraphic);
            }
            // If weapon is not on the anchor point clone it at the relative position to the anchor point
            if (shapeKey.endsWith("Weapon") && !shapeKey.startsWith("anchorPoint")) {
                const weaponX = anchorPointLocation.x-x;
                const weaponY = anchorPointLocation.y-y;
                cloneWeapon(building.keyName + "Weapon", weaponX*400, -weaponY*400, 0, building.buildingGraphic);
            }
        }
    }

    // Rotate building graphic
    if (rotation === "R" || rotation === "L") {
        rotateBuilding(building, rotation, true);
    } else if (rotation === "RR") {
        rotateBuilding(building, "R", true);
        rotateBuilding(building, "R", true);
    }
}
export function placeAIFort(AIfortIndex) {
    const AIfort = AIforts[AIfortIndex];
    AIfort.layout.forEach((buildingListing) => {
        //const newBuilding = { ...buildingListing.building };

        let newBuilding = null;
        for (const key in allBuildings) {
            if (allBuildings[key].BUID === buildingListing.BUID) {
                newBuilding = JSON.parse(JSON.stringify(allBuildings[key]));
            }
        }

        if (buildingListing.rotation === "R" || buildingListing.rotation === "L") {
            rotateBuilding(newBuilding, buildingListing.rotation);
        } else if (buildingListing.rotation === "RR") {
            rotateBuilding(newBuilding, "R");
            rotateBuilding(newBuilding, "R");
        }
        if(newBuilding !== null){
            placeBuildingToBoard(newBuilding, enemyBoard, buildingListing.x, buildingListing.y, buildingListing.rotation);
        }
    });
}
