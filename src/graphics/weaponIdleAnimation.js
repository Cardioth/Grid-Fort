import * as BABYLON from "@babylonjs/core";
import { scene } from "./sceneInitialization";

// Weapon idle animation, picks a random rotation and rotates weapon to that rotation
export function weaponIdleAnimation(weapon) {
    const rotation = Math.random() * 2 * Math.PI;

    const animation = new BABYLON.Animation("weaponIdle", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    animation.setKeys([
        { frame: 0, value: weapon.rotation.z },
        { frame: 90, value: rotation }
    ]);

    // Add animations to children meshes
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
        scene.beginDirectAnimation(child, child.animations, 0, 90, false, 1, () => {
        });
    }

    scene.beginDirectAnimation(weapon, weapon.animations, 0, 90, false, 1, () => {
        weaponIdleAnimation(weapon);
        weapon.parent.rotationT = undefined;
    });
}