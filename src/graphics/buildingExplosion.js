import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';

export function createBuildingExplosion(position){
    BABYLON.ParticleHelper.BaseAssetsUrl = "particles/";

    BABYLON.ParticleHelper.CreateAsync("explosion", scene).then((set) => {
        set.start();
        for(const particleSystem of set.systems){
            particleSystem.emitter = position.clone();
        }
    });
}