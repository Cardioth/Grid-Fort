import * as BABYLON from '@babylonjs/core';
import { scene } from '../graphics/sceneInitialization';

export function addBuildingSpecificAnimations(building){
    if(building.name.startsWith("core")){
        coreAnimation(building);
    }
    if(building.name.startsWith("damageBooster")){
        damageBoosterAnimation(building);
    }
}

function damageBoosterAnimation(building){
    const animation = new BABYLON.Animation("spinny", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 40, value: Math.PI*2 }
    ]);
    
    const animatedMeshes = [];
    animatedMeshes.push(getMeshByMaterialName("copperWire", building));
    animatedMeshes.push(getMeshByMaterialName("blueGlow", building));

    for(let j = 0; j<animatedMeshes.length; j++){
        animatedMeshes[j].position.y = 6;
        animatedMeshes[j].rotation.y = Math.PI/2;
        animatedMeshes[j].rotation.z = Math.PI/2;
        animatedMeshes[j].animations = [];
        animatedMeshes[j].animations.push(animation);
        scene.beginDirectAnimation(animatedMeshes[j], animatedMeshes[j].animations, 0, 30, true, 1);
    }
}

function coreAnimation(building){
    const animation = new BABYLON.Animation("spinny", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    animation.setKeys([
        { frame: 0, value: 0 },
        { frame: 500, value: Math.PI*2 }
    ]);

    const mesh = getMeshByMaterialName("darkestGrippy", building);
    mesh.animations = [];
    mesh.animations.push(animation);

    scene.beginDirectAnimation(mesh, mesh.animations, 0, 300, true, 1);

    const animation2 = new BABYLON.Animation("spinny", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    animation2.setKeys([
        { frame: 0, value: 0 },
        { frame: 300, value: -Math.PI*2 }
    ]);

    const mesh2 = getMeshByMaterialName("blueGlow", building);
    mesh2.animations = [];
    mesh2.animations.push(animation2);

    const mesh3 = getMeshByMaterialName("greyGradientRadialLight", building);
    mesh3.animations = [];
    mesh3.animations.push(animation2);

    scene.beginDirectAnimation(mesh2, mesh2.animations, 0, 240, true, 1);
    scene.beginDirectAnimation(mesh3, mesh3.animations, 0, 240, true, 1);
}

function getMeshByMaterialName(name, building){
    const buildingChildren = building.getChildren();
    for(let i = 0; i<buildingChildren.length; i++){
        const meshes = buildingChildren[i];
        if(meshes.material.name === name){
            return buildingChildren[i];
        }
    }
}