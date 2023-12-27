import * as BABYLON from "@babylonjs/core";
import { scene, camera, gridPlane, collisionPlane } from '../graphics/sceneInitialization';
import { fortStats } from "../managers/setup";
import { currentMouseX, currentMouseY } from "../managers/eventListeners";

export function wrapText(context, text, x, y, lineHeight) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, y + (i * lineHeight));
    }
}

export function camelCaseToTitleCase(input) {
    // This regular expression finds all camel case words.
    return input
        // Insert a space before any uppercase letter followed by a lowercase letter.
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // Capitalize the first letter of each word.
        .replace(/\b\w/g, char => char.toUpperCase());
}

export function updateBoardStats(board) {
    board.stats = JSON.parse(JSON.stringify(fortStats));
    board.allPlacedBuildings.forEach((building) => {
        for (let key in building.stats) {
            if (board.stats.hasOwnProperty(key)) {
                board.stats[key].stat += building.stats[key];
            }
        } 5;
    });
}


// Gets the pointer location quantized to the grid - Used for placing buildings
export function getPointerGridLocation() {
    const ray = scene.createPickingRay(currentMouseX, currentMouseY, BABYLON.Matrix.Identity(), camera);

    const pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === gridPlane;
    });
    if (pickResult.pickedPoint !== null) {
        const gridX = -Math.floor(((pickResult.pickedPoint.x+0.125)*4)) + 8;
        const gridY = Math.floor(((pickResult.pickedPoint.z+0.125)*4)) + 8;
        return { x: gridX, y: gridY };
    }
    return { x: null, y: null };
}

// Gets the pointer location quantized to the grid - Used for placing building graphic is real world space
export function getPointerScreenLocationSnappedToGrid() {
    const ray = scene.createPickingRay(currentMouseX, currentMouseY, BABYLON.Matrix.Identity(), camera);

    let pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === gridPlane;
    });

    if (pickResult.pickedPoint !== null) {
        const gridX = Math.floor(((pickResult.pickedPoint.x+0.125)*4))/4;
        const gridY = Math.floor(((pickResult.pickedPoint.z+0.125)*4))/4;
        return { x: gridX, y: gridY };
    }
    
    return { x: null, y: null };
}

// Gets the pointer location in real world space without any quantization
export function getPointerScreenLocation() {
    const ray = scene.createPickingRay(currentMouseX, currentMouseY, BABYLON.Matrix.Identity(), camera);

    let pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === collisionPlane;
    });

    if (pickResult.pickedPoint !== null) {
        const gridX = pickResult.pickedPoint.x;
        const gridY = pickResult.pickedPoint.z;
        return { x: gridX, y: gridY };
    }

    return { x: null, y: null };
}

export function setMaterialToBlocked(mesh) {
    mesh.material = new BABYLON.StandardMaterial("redMaterial", scene);
    mesh.material.diffuseColor = new BABYLON.Color3(0, 0.05, 1);
    mesh.material.alpha = 0.1;
}

export function setMaterialToDefault(mesh) {
    mesh.material = mesh.defaultMaterial;
}

export function getHoveredBuilding() {
    const ray = scene.createPickingRay(currentMouseX, currentMouseY, BABYLON.Matrix.Identity(), camera);
    let pickResult = scene.pickWithRay(ray);
    if (pickResult.pickedMesh !== null && pickResult.pickedMesh.building !== undefined) {
        return pickResult.pickedMesh.building;
    }
    return null;
}
