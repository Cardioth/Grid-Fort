import { loadedParticleSystems } from "./loadParticleEffects";

export function createLaserExplosion(position, startPosition) {
    let explosionTemplate = loadedParticleSystems.find(system => system.name === "laserExplosion");

    if (explosionTemplate && explosionTemplate.systems) {
        explosionTemplate.systems.forEach(originalSystem => {
            let clonedSystem = originalSystem.clone(originalSystem.name + "Clone", originalSystem.emitter);

            if (clonedSystem) {
                let newPosition = position.clone();
                newPosition.y += 0.2; // Adjust the height offset as needed
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
