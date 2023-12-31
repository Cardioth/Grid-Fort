import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';

export function createKineticExplosion(position, startPosition){
    BABYLON.ParticleHelper.BaseAssetsUrl = "particles/";

    BABYLON.ParticleHelper.CreateAsync("kineticExplosion", scene).then((set) => {
        set.start();
        for(const particleSystem of set.systems){
            let newPosition = position.clone();
            newPosition.y += .1;
            newPosition = BABYLON.Vector3.Lerp(newPosition, startPosition, 0.01);
            particleSystem.emitter = newPosition;
        }
    });
}