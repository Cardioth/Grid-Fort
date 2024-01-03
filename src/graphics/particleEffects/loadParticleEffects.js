import * as BABYLON from '@babylonjs/core';

export let loadedParticleSystems = [];

export function loadParticleSystems(scene) {
    BABYLON.ParticleHelper.BaseAssetsUrl = "particles/";

    BABYLON.ParticleHelper.CreateAsync("explosion", scene).then((set) => {
        set.name = "buildingExplosion";
        set.disposeOnStop = false;
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });

    BABYLON.ParticleHelper.CreateAsync("kineticExplosion", scene).then((set) => {
        set.name = "kineticExplosion";
        set.disposeOnStop = false;
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });

    BABYLON.ParticleHelper.CreateAsync("laserExplosion", scene).then((set) => {
        set.name = "laserExplosion";
        set.disposeOnStop = false;
        loadedParticleSystems.push(set);
    }).catch(error => {
        console.error("Error loading explosion template:", error);
    });
}