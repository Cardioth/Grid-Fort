import * as BABYLON from '@babylonjs/core';

export let loadedParticleSystems = [];

export function loadExplosionTemplate(scene) {
    BABYLON.ParticleHelper.BaseAssetsUrl = "particles/";

    BABYLON.ParticleHelper.CreateAsync("explosion", scene).then((set) => {
        set.name = "buildingExplosion";
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });

    BABYLON.ParticleHelper.CreateAsync("kineticExplosion", scene).then((set) => {
        set.name = "kineticExplosion";
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });

    BABYLON.ParticleHelper.CreateAsync("laserExplosion", scene).then((set) => {
        set.name = "laserExplosion";
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });
}