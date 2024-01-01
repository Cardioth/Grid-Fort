import * as BABYLON from '@babylonjs/core';

export function darkenBuilding(building) {
    building.darkened = true;
    for (const child of building.buildingGraphic.getChildren()) {
        if (child.material) {
            child.originalMaterial = child.material;
            child.material = child.material.clone();
            child.material.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            child.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
        }
    }
    if(building.buildingGraphic.turret){
        for (const child of building.buildingGraphic.turret.getChildren()) {
            if (child.material) {
                child.originalMaterial = child.material;
                child.material = child.material.clone();
                child.material.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                child.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }
        }
    }
}

export function undarkenBuilding(building){
    building.darkened = false;
    for (const child of building.buildingGraphic.getChildren()) {
        if (child.material) {
            child.material = child.originalMaterial;
        }
    }
    if(building.buildingGraphic.turret){
        for (const child of building.buildingGraphic.turret.getChildren()) {
            if (child.material) {
                child.material = child.originalMaterial;
            }
        }
    }
}