import * as BABYLON from '@babylonjs/core';
import { scene } from '../graphics/sceneInitialization';

export function fadeInMeshAnimation(mesh){
    const animation = new BABYLON.Animation("fadeIn", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 80, value: 1 }
    ]);
    mesh.material = mesh.material.clone();
    mesh.material.alpha = 0;
    mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    mesh.animations = [];
    mesh.animations.push(animation);

    scene.beginDirectAnimation(mesh.material, mesh.animations, 0, 80, false, 1);
}

export function fadeOutMeshAnimation(mesh){
    const animation = new BABYLON.Animation("fadeOut", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: 1 },
        { frame: 80, value: 0 }
    ]);
    mesh.material = mesh.material.clone();
    mesh.material.alpha = 1;
    mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    mesh.material.animations = [];
    mesh.material.animations.push(animation);

    scene.beginDirectAnimation(mesh.material, mesh.material.animations, 0, 80, false, 1, function(){
        mesh.dispose();
    });
}