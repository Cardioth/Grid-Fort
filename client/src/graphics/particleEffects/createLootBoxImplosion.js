import * as BABYLON from '@babylonjs/core';
import { GUI3Dscene } from '../sceneInitialization';

export function createLootBoxImplosionParticleSystem(location){
    innerZoomies(location);

    fluffExplosion(location);

    mainExplosion(location);
}

function mainExplosion(location) {
    const particleSystem = new BABYLON.ParticleSystem("particles", 30, GUI3Dscene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/laserTextureGlow.png");
    particleSystem.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_ALL;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    particleSystem.emitter = location;

    var noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, GUI3Dscene);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new BABYLON.Vector3(5, 5, 5);

    particleSystem.addColorGradient(0, new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 1, 0, 1)); //color at start of particle lifetime
    particleSystem.addColorGradient(0.2, new BABYLON.Color4(1, 1, 1, 1), new BABYLON.Color4(1, 0.5, 0.1, 1)); //color at end of particle lifetime
    particleSystem.addColorGradient(1, new BABYLON.Color4(0, 0, 0, 0), new BABYLON.Color4(0, 0, 0, 0)); //color at end of particle lifetime

    particleSystem.minLifeTime = 1.46;
    particleSystem.maxLifeTime = 1.46;

    particleSystem.startDelay = 3200;

    particleSystem.minEmitPower = -10;
    particleSystem.maxEmitPower = -20;
    particleSystem.updateSpeed = 0.008;

    particleSystem.addDragGradient(0, 0); //drag at start of particle lifetime
    particleSystem.addDragGradient(0.1, 0.2); //drag at start of particle lifetime
    particleSystem.addDragGradient(0.2, 0.5); //drag at start of particle lifetime
    particleSystem.addDragGradient(1, 1); //drag at end of particle lifetime

    particleSystem.targetStopDuration = 1.45;
    particleSystem.addSizeGradient(0, 1, 1.2);
    particleSystem.addSizeGradient(0.1, 0.1, 0.2);
    particleSystem.addSizeGradient(1.0, 0, 0);

    particleSystem.emitRate = 10000;

    particleSystem.createSphereEmitter(0.02, 0.01);

    particleSystem.start();
}

function fluffExplosion(location) {
    const particleSystem = new BABYLON.ParticleSystem("particles", 100, GUI3Dscene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/laserTextureGlow.png");
    particleSystem.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_ALL;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.emitter = location;

    var noiseTexture = new BABYLON.NoiseProceduralTexture("perlin", 256, GUI3Dscene);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new BABYLON.Vector3(10, 10, 10);

    particleSystem.addDragGradient(0, 0.1); //drag at start of particle lifetime
    particleSystem.addDragGradient(1, 0.8); //drag at end of particle lifetime

    particleSystem.startDelay = 3200;

    particleSystem.minLifeTime = 5;
    particleSystem.maxLifeTime = 5;

    particleSystem.addColorGradient(0, new BABYLON.Color4(1, 1, 1, 1)); //color at start of particle lifetime
    particleSystem.addColorGradient(0.2, new BABYLON.Color4(1, 1, 1, 0.1)); //color at end of particle lifetime
    particleSystem.addColorGradient(1, new BABYLON.Color4(1, 1, 1, 0)); //color at end of particle lifetime

    particleSystem.addSizeGradient(0, 0.05);
    particleSystem.addSizeGradient(0.5, 0.2);
    particleSystem.addSizeGradient(1.0, 0.3);

    particleSystem.minEmitPower = 5;
    particleSystem.maxEmitPower = 5;

    particleSystem.minInitialRotation = 0;
    particleSystem.maxInitialRotation = Math.PI / 2;

    particleSystem.updateSpeed = 0.016;

    particleSystem.targetStopDuration = 5;

    particleSystem.emitRate = 500;

    particleSystem.createSphereEmitter(0.02, 0.02);

    particleSystem.start();
}

function innerZoomies(location) {
    const particleSystem = new BABYLON.ParticleSystem("particles", 800, GUI3Dscene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/laserTextureGlow.png");
    particleSystem.billboardMode = BABYLON.ParticleSystem.BILLBOARDMODE_ALL;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.emitter = location;

    particleSystem.addColorGradient(0, new BABYLON.Color4(0, 0, 1, 0)); //color at start of particle lifetime
    particleSystem.addColorGradient(0.2, new BABYLON.Color4(1, 1, 1, 0.5)); //color at end of particle lifetime
    particleSystem.addColorGradient(1, new BABYLON.Color4(1, 1, 1, 1)); //color at end of particle lifetime

    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.1;

    particleSystem.minEmitPower = -4;
    particleSystem.maxEmitPower = -8;
    particleSystem.updateSpeed = 0.008;

    particleSystem.targetStopDuration = 1.45;

    particleSystem.addSizeGradient(0, 0, 0);
    particleSystem.addSizeGradient(0.5, 0.1, 0.1);
    particleSystem.addSizeGradient(1.0, 0, 0);

    particleSystem.emitRate = 800;

    particleSystem.addStartSizeGradient(0, 0, 0);
    particleSystem.addStartSizeGradient(0.2, 0, 0);
    particleSystem.addStartSizeGradient(0.5, 1, 1);
    particleSystem.addStartSizeGradient(1, 1, 1);

    particleSystem.createSphereEmitter(2, 1.5);

    particleSystem.start();
}
