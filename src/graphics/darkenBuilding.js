import * as BABYLON from '@babylonjs/core';

export function darkenBuilding(building) {
    console.log("darkening building");

    building.darkened = true;

    for (const child of building.buildingGraphic.getChildren()) {
        if (child.material) {
            //child.material.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            //child.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
           child.material = child.darkenedMaterial;
        }
    }
    if(building.buildingGraphic.turret){
        for (const child of building.buildingGraphic.turret.getChildren()) {
            if (child.material) {
                //child.material.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                //child.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
                child.material = child.darkenedMaterial;
            }
        }
    }
}

export function setDarkenedMaterial(mesh){
    for (const child of mesh.getChildren()) {
        if (child.material) {
            child.originalMaterial = child.material;
            child.darkenedMaterial = createDarkenedMaterial(child.material);
        }
    }
}

function createDarkenedMaterial(material){
    const darkenedMaterial = material.clone();
    darkenedMaterial.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    darkenedMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    return darkenedMaterial;
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