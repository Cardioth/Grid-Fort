import * as BABYLON from '@babylonjs/core';
import { GUI3Dscene } from '../sceneInitialization';

export function createMedalExplosionParticleSystem(location){
    mainExplosion(location);
}

function mainExplosion(location) {
    const particleSystem = new BABYLON.ParticleSystem("particles", 5, GUI3Dscene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/debrisTexture.png");
    particleSystem.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_ALL;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.emitter = location;

    var noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, GUI3Dscene);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new BABYLON.Vector3(7, 7, 7);

    particleSystem.addColorGradient(0, new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 0.5, 0, 1)); //color at start of particle lifetime
    particleSystem.addColorGradient(0.2, new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 0.5, 0.5, 1)); //color at end of particle lifetime
    particleSystem.addColorGradient(1, new BABYLON.Color4(0, 0, 0, 0), new BABYLON.Color4(0, 0, 0, 0)); //color at end of particle lifetime

    particleSystem.minAngularSpeed = -0.5;
    particleSystem.maxAngularSpeed = 0.5;

    particleSystem.minInitialRotation = 0;
    particleSystem.maxInitialRotation = 2 * Math.PI;

    particleSystem.minLifeTime = 1.46;
    particleSystem.maxLifeTime = 1.46;

    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.2;
    particleSystem.updateSpeed = 0.008;

    particleSystem.targetStopDuration = 1.45;
    particleSystem.addSizeGradient(0, 0.5, 0.6);
    particleSystem.addSizeGradient(0.1, 0.05, 0.1);
    particleSystem.addSizeGradient(1.0, 0, 0);

    particleSystem.emitRate = 10000;

    particleSystem.createSphereEmitter(0.02, 0.01);

    particleSystem.start();
}