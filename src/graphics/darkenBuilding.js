import * as BABYLON from '@babylonjs/core';

export function darkenBuilding(building) {
    building.darkened = true;

    let index = 0;
    let frameCounter = 0;
    let children;

    children = building.buildingGraphic.getChildren();

    if(building.buildingGraphic.turret){
        building.buildingGraphic.turret.dispose();
    }
        
    const framesPerChange = 2;
    
    function changeMaterial() {
        if (index < children.length) {
            if (frameCounter % framesPerChange === 0) {
                const child = children[index];
                if (child.material) {
                    child.material = child.darkenedMaterial;
                    index++;
                }
            }
            frameCounter++;
            requestAnimationFrame(changeMaterial);
        }
    }
    
    changeMaterial();  

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