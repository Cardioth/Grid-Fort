import * as BABYLON from '@babylonjs/core';
import { materialAtlas } from './sceneInitialization';

export function darkenBuilding(building) {
    building.darkened = true;
    let children = building.buildingGraphic.getChildren();

    /* // Darken the building in one frame

    for (const child of children) {
        if (child.material) {
            const darkenedMaterialName = child.material.name + "_darkened";
            for(const material of materialAtlas){
                if(material.name === darkenedMaterialName){
                    child.material = material;
                }
            }
        }
    }

    if(building.buildingGraphic.turret){
        for (const child of building.buildingGraphic.turret.getChildren()) {
            if (child.material) {
                const darkenedMaterialName = child.material.name + "_darkened";
                for(const material of materialAtlas){
                    if(material.name === darkenedMaterialName){
                        child.material = material;
                    }
                }
            }
        }
    }

    */

    // Spread out the darkening of the building over a few frames

    if(building.buildingGraphic.turret){
        building.buildingGraphic.turret.dispose();
    }

    let index = 0;
    let frameCounter = 0;
    const framesPerChange = 10;
    
    function changeMaterial() {
        if (index < children.length) {
            if (frameCounter % framesPerChange === 0) {
                const child = children[index];
                if (child.material) {
                    const darkenedMaterialName = child.material.name + "_darkened";
                    for(const material of materialAtlas){
                        if(material.name === darkenedMaterialName){
                            child.material = material;
                        }
                    }
                    index++;
                }
            }
            frameCounter++;
            requestAnimationFrame(changeMaterial);
        }
    }
    
    changeMaterial();

}

export function createDarkenedMaterial(material){
    const darkenedMaterial = material.clone();
    darkenedMaterial.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    darkenedMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    return darkenedMaterial;
}

export function undarkenBuilding(building){
    building.darkened = false;
    for (const child of building.buildingGraphic.getChildren()) {
        if (child.material) {
            child.material = child.defaultMaterial;
        }
    }
    if(building.buildingGraphic.turret){
        for (const child of building.buildingGraphic.turret.getChildren()) {
            if (child.material) {
                child.material = child.defaultMaterial;
            }
        }
    }
}