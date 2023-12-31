import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';

export function createLaserExplosion(position, startPosition){
    BABYLON.ParticleHelper.BaseAssetsUrl = "particles/";

    BABYLON.ParticleHelper.CreateAsync("laserExplosion", scene).then((set) => {
        set.start();
        for(const particleSystem of set.systems){
            let newPosition = position.clone();
            newPosition.y += .2;
            particleSystem.emitter = newPosition;
        }
    });
}