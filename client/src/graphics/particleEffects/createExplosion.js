import { loadedParticleSystems } from "./loadParticleEffects";


export function createExplosion(position, explosionName) {
    let explosionTemplate = loadedParticleSystems.find(system => system.name === explosionName);

    if (explosionTemplate && explosionTemplate.systems) {
        explosionTemplate.systems.forEach(originalSystem => {
            let clonedSystem = originalSystem.clone(originalSystem.name + "Clone", originalSystem.emitter);
            //let clonedSystem = originalSystem;

            if (clonedSystem) {
                let newPosition = position.clone();
                newPosition.y += 0.2; // Adjust the height offset as needed
                clonedSystem.emitter = newPosition;
                
                clonedSystem.start();

                setTimeout(() => {
                    clonedSystem.stop();
                    clonedSystem.dispose();
                }, 5000); // Adjust timing based on the system's lifespan
            }
        });
    }
}