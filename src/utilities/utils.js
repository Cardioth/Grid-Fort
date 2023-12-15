import * as BABYLON from "@babylonjs/core";
import { scene, camera, gridPlane, baseMesh } from '../graphics/initScene';
import { fortStats } from "../managers/setup";

export function wrapText(context, text, x, y, lineHeight) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, y + (i * lineHeight));
    }
}

export function hitTest(x,y,button){
    if(x > button.x && x < button.x+button.width && y > button.y && y < button.y+button.height){
        return true;
    }
    return false;
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

export function getPointerGridLocation(mouseX, mouseY) {
    const ray = scene.createPickingRay(mouseX, mouseY, BABYLON.Matrix.Identity(), camera);

    const pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === baseMesh;
    });
    if (pickResult.pickedPoint !== null) {
        const gridX = -Math.floor((pickResult.pickedPoint.x * 4) + 0.5) + 8;
        const gridY = Math.floor((pickResult.pickedPoint.z * 4) + 0.5) + 8;
        return { x: gridX, y: gridY };
    }
    return { x: null, y: null };
}

export function getPointerScreenLocationSnappedToGrid(mouseX, mouseY) {
    const ray = scene.createPickingRay(mouseX, mouseY, BABYLON.Matrix.Identity(), camera);

    let pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === gridPlane;
    });

    if (pickResult.pickedPoint !== null) {
        const gridX = Math.floor((pickResult.pickedPoint.x*4))/4;
        const gridY = Math.floor((pickResult.pickedPoint.z*4))/4;
        return { x: gridX, y: gridY };
    } else {
        pickResult = scene.pick(mouseX,mouseY);
        if(pickResult.pickedPoint !== null){
            const x = pickResult.pickedPoint.x;
            const y = pickResult.pickedPoint.z;
            return { x: x, y: y };
        }
    }

    return { x: null, y: null };
}

export function getPointerScreenLocation(mouseX, mouseY) {
    const ray = scene.createPickingRay(mouseX, mouseY, BABYLON.Matrix.Identity(), camera);

    let pickResult = scene.pickWithRay(ray, function (mesh) {
        return mesh === gridPlane;
    });

    if (pickResult.pickedPoint !== null) {
        const gridX = pickResult.pickedPoint.x;
        const gridY = pickResult.pickedPoint.z;
        return { x: gridX, y: gridY };
    }

    return { x: null, y: null };
}