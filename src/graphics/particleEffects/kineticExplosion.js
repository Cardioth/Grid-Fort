import { loadedParticleSystems } from "./loadParticleEffects";
import * as BABYLON from '@babylonjs/core';

export function createKineticExplosion(position, startPosition) {
    let explosionTemplate = loadedParticleSystems.find(system => system.name === "kineticExplosion");

    if (explosionTemplate && explosionTemplate.systems) {
        explosionTemplate.systems.forEach(originalSystem => {
            let clonedSystem = originalSystem.clone(originalSystem.name + "Clone", originalSystem.emitter);

            if (clonedSystem) {
                let newPosition = position.clone();
                newPosition.y += 0.1; // Adjust the height offset as needed
                newPosition = BABYLON.Vector3.Lerp(newPosition, startPosition, 0.01);
                clonedSystem.emitter = newPosition;
                
                clonedSystem.start();

                setTimeout(() => {
                    clonedSystem.stop();
                    clonedSystem.dispose();
                }, clonedSystem.maxLifeTime * 1000); // Adjust timing based on the system's lifespan
            }
        });
    }
}
