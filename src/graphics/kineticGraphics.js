import * as BABYLON from '@babylonjs/core';
import { scene } from './sceneInitialization';
import { getMeshByMaterialName } from '../utilities/utils';

export function createKineticGraphic(startTarget,endTarget){
    //positioning
    let startPosition = new BABYLON.Vector3(startTarget.position.x+0.001, startTarget.position.y+0.5, startTarget.position.z+0.001);
    let endPosition = new BABYLON.Vector3(endTarget.x, endTarget.y+0.2, endTarget.z);

    if(startTarget.turret){
        startPosition = getMeshByMaterialName("greyGradientRadial", startTarget.turret).getBoundingInfo().boundingBox.centerWorld
    }

    //muzzle flash
    //createMuzzleFlash(startPosition);

    //create projectile
    const projectile = createProjectile(startPosition, endPosition);

    //create projectile trail
    createProjectileTrail(startPosition, projectile);
}


function createProjectileTrail(startPosition, projectile) {
    let trailPoints = [startPosition.clone()];
    let trailLines = [];
    let frameCounter = 0;

    // Update the trail in each frame
    projectile.Observable = scene.onBeforeRenderObservable.add(() => {
        frameCounter++;
        if (frameCounter % 2 !== 0) {
            // Add the new position
            if (!projectile.isDisposed()) {
                trailPoints.push(projectile.position.clone());
                var trail = BABYLON.MeshBuilder.CreateLines("trail", { points: trailPoints, instance: trail }, scene);
                trailPoints.shift();
                trail.isPickable = false;
                trailLines.push(trail);
                trail.lifeSpan = 20;
            }

            for (let i = 0; i < trailLines.length; i++) {
                trailLines[i].lifeSpan -= 1;
                trailLines[i].alpha -= 0.05;
                if (trailLines[i].lifeSpan <= 0) {
                    trailLines[i].dispose();
                    trailLines.splice(i, 1);
                }
            }

            if (trailLines.length === 0) {
                scene.onBeforeRenderObservable.remove(projectile.Observable);
            }
        }
    });
}

function createProjectile(startPosition, endPosition) {
    const projectile = BABYLON.MeshBuilder.CreateSphere("projectile", { segments: 1, diameter: 0.03 }, scene);
    projectile.position = startPosition;
    projectile.isPickable = false;
    projectile.isVisible = true;
    projectile.material = new BABYLON.StandardMaterial("projectileMaterial", scene);
    projectile.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    projectile.material.disableLighting = true;

    //create projectile animation to fly in a parabolic arc
    const projectileAnimation = new BABYLON.Animation("projectileAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    //create projectile animation keys
    const keys = [];
    keys.push({ frame: 0, value: startPosition });

    //calculate parabolic arc positions
    const projectilePath = generateProjectilePath(startPosition, endPosition, 0.7);
    for (let i = 0; i < projectilePath.length; i++) {
        keys.push({ frame: i + 1, value: projectilePath[i] });
    }

    projectileAnimation.setKeys(keys);

    //create projectile animation
    projectile.projectileAnimation = scene.beginDirectAnimation(projectile, [projectileAnimation], 0, projectilePath.length, false, 1, function () {
        projectile.dispose();
    });
    return projectile;
}

function createMuzzleFlash(startPosition) {
    const muzzleFlash = BABYLON.MeshBuilder.CreatePlane("glow", { height: 0.1, width: 0.1 }, scene);
    muzzleFlash.position = startPosition;
    muzzleFlash.isPickable = false;
    muzzleFlash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    const muzzleFlashMaterial = new BABYLON.StandardMaterial("glowMaterial", scene);
    muzzleFlashMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    muzzleFlashMaterial.disableLighting = true;
    muzzleFlashMaterial.diffuseTexture = new BABYLON.Texture("textures/laserTextureGlow.png", scene);
    muzzleFlashMaterial.diffuseTexture.hasAlpha = true;
    muzzleFlash.material = muzzleFlashMaterial;

    //create glow animation
    const muzzleFlashAnimation = new BABYLON.Animation("glowAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    muzzleFlashAnimation.setKeys([
        { frame: 0, value: 1 },
        { frame: 10, value: 0 },
    ]);

    muzzleFlash.glowAnimation = scene.beginDirectAnimation(muzzleFlash, [muzzleFlashAnimation], 0, 10, false, 1, function () {
        muzzleFlash.dispose();
    });
}

function generateProjectilePath(start, end, duration) {
    var keyframeData = [];
    var totalFrames = 60 * duration; // Assuming 60 fps

    // Calculate the distance between start and end points
    var distance = BABYLON.Vector3.Distance(start, end);

    // Set peak height to be half the distance
    var peakHeight = distance / 3;

    // Calculate the total horizontal distance (X) and coefficients a, b
    var X = end.x - start.x;
    var Z = end.z - start.z;
    var H = peakHeight - start.y;

    // Calculate coefficients a, b (c is essentially start.y)
    var a = X !== 0 ? -4 * H / (X * X) : 0;
    var b = X !== 0 ? 4 * H / X : 0;

    // Generate keyframe data
    for (var frame = 0; frame <= totalFrames; frame++) {
        var t = frame / totalFrames; // Normalized time (0 to 1)

        // Calculate the x, y, and z positions
        var x = X !== 0 ? BABYLON.Scalar.Lerp(start.x, end.x, t) : start.x;
        var y = X !== 0 ? a * (x - start.x) * (x - start.x) + b * (x - start.x) + start.y : start.y + 4 * H * t * (1 - t);
        var z = Z !== 0 ? BABYLON.Scalar.Lerp(start.z, end.z, t) : start.z;

        // Add the position to the keyframe data
        keyframeData.push(new BABYLON.Vector3(x, y, z));
    }

    return keyframeData;
}