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
                }, 2500); // Adjust timing based on the system's lifespan
            }
        });
    }
}

/*
export function createExplosion(position, explosionName) {
    let explosionTemplate = loadedParticleSystems.find(system => system.name === explosionName);

    if (explosionTemplate && explosionTemplate.systems) {
        explosionTemplate.systems.forEach(system => {

            let newPosition = position.clone();
            newPosition.y += 0.2; // Adjust the height offset as needed
            system.emitter = newPosition;
            
            system.start();
        });
    }
}
*/