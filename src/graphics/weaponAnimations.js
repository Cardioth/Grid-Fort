import * as BABYLON from "@babylonjs/core";
import { scene } from "./sceneInitialization";

// Weapon idle animation, picks a random rotation and rotates weapon to that rotation
export function weaponIdleAnimation(weapon) {
    const targetRotation = Math.random() * 2 * Math.PI;
    let deltaRotation = targetRotation - weapon.rotation.z;

    if (deltaRotation > Math.PI) {
        deltaRotation -= 2 * Math.PI;
    } else if (deltaRotation < -Math.PI) {
        deltaRotation += 2 * Math.PI;
    }

    const finalRotation = weapon.rotation.z + deltaRotation;

    const waitTime = Math.floor(Math.random() * 20 + 80);

    const animation = new BABYLON.Animation("weaponIdle", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: weapon.rotation.z },
        { frame: waitTime, value: finalRotation }
    ]);

    for(const child of weapon.getChildren()){
        child.animations = [];
        child.animations.push(animation);
    }
    
    weapon.animations = [];
    weapon.animations.push(animation);
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(ease);

    for (const child of weapon.getChildren()) {
        child.weaponIdle = scene.beginDirectAnimation(child, child.animations, 0, waitTime, false, 1, () => {
        });
    }

    weapon.weaponIdle = scene.beginDirectAnimation(weapon, weapon.animations, 0, waitTime, false, 1, () => {
        if(weapon.parent && weapon.parent.building && weapon.parent.building.destroyed === false && weapon.attacking === false){
            weaponIdleAnimation(weapon);
        }
    });
}


export function weaponFireAnimation(weapon, targetRotation) {
    let deltaRotation = targetRotation - weapon.rotation.z;
    if (deltaRotation > Math.PI) {
        deltaRotation -= 2 * Math.PI;
    } else if (deltaRotation < -Math.PI) {
        deltaRotation += 2 * Math.PI;
    }
    weapon.attacking = true;

    const finalRotation = weapon.rotation.z + deltaRotation;

    const swingSpeed = 20;
    const animation = new BABYLON.Animation("weaponAttack", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: weapon.rotation.z },
        { frame: swingSpeed, value: finalRotation }
    ]);

    //clear existing animations
    for(const child of weapon.getChildren()){
        child.animations = [];
        child.animations.push(animation);
    }
    weapon.animations = [];
    weapon.animations.push(animation);

    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    animation.setEasingFunction(ease);

    for (const child of weapon.getChildren()) {
        //stop existing animations
        if(child.weaponIdle){
            child.weaponIdle.stop();
        }        
        
        child.weaponAttack = scene.beginDirectAnimation(child, child.animations, 0, swingSpeed, false, 1);
    }

    //stop existing animations
    if(weapon.weaponIdle){
        weapon.weaponIdle.stop();
    }
    weapon.weaponAttack = scene.beginDirectAnimation(weapon, weapon.animations, 0, swingSpeed, false, 1);
}

export function getTargetRotation(turret, target) {
    var targetPosition = target.position.clone();

    var dummy = new BABYLON.TransformNode("dummy");
    dummy.position = turret.position;
    dummy.lookAt(new BABYLON.Vector3(targetPosition.x, dummy.position.y, targetPosition.z));

    var targetRotation = dummy.rotation.clone();
    dummy.dispose();

    return targetRotation;
}