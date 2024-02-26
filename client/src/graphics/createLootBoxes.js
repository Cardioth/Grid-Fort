import * as BABYLON from '@babylonjs/core';
import { lootBoxes } from './sceneInitialization.js';

export function createLootBoxes(scene, rewards) {
    var duplicate = function (container, position, delayedApproach, reward) {
        setTimeout(function () {
            scene.lootBoxes = scene.lootBoxes || [];
            let entries = container.instantiateModelsToScene();

            for (var node of entries.rootNodes) {
                node.position = position;
                scene.lootBoxes.push(node);
            }

            for (var group of entries.animationGroups) {
                group.reset();
            }

            for (var children of entries.rootNodes[0].getChildMeshes()) {
                if (children.parent.rotOffset === undefined) {
                    children.parent.rotOffset = Math.random() * 2 * Math.PI;
                }

                children.pickedAnimation = scene.animationGroups[scene.animationGroups.length - 1];
                children.rootNodePosition = position;
                children.reward = reward;

                //Default Spinning Animation
                const spinningAnimation = new BABYLON.Animation("spinningAnimation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                const keys = [
                    { frame: 0, value: 0 + children.parent.rotOffset },
                    { frame: 240, value: 2 * Math.PI + children.parent.rotOffset }
                ];
                spinningAnimation.setKeys(keys);

                //First Approach Animation
                const firstApproachAnimation = new BABYLON.Animation("firstApproachAnimation", "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                const keys2 = [
                    { frame: 0, value: 6 },
                    { frame: 30, value: 3 }
                ];
                firstApproachAnimation.setKeys(keys2);
                const easingFunction = new BABYLON.CircleEase();
                easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
                firstApproachAnimation.setEasingFunction(easingFunction);

                children.animations.push(spinningAnimation);
                children.animations.push(firstApproachAnimation);
                scene.beginAnimation(children, 0, 240, true);
            }
        }, delayedApproach);
    };    

    function positionLootBoxesInCircle(rewards, centerX, centerY, radius, object) {
        let angle = Math.PI / 2;
        let step = (2 * Math.PI) / rewards.length;
        for (let i = 0; i < rewards.length; i++) {
            let y = centerX + radius * Math.cos(angle);
            let z = centerY + radius * Math.sin(angle);
            if (rewards.length === 1) {
                duplicate(object, new BABYLON.Vector3(0, centerX, centerY-100), rewards[i]);
            } else {
                duplicate(object, new BABYLON.Vector3(0, y, z), i * 300, rewards[i]);
            }
            angle += step;
        }
    }

    positionLootBoxesInCircle(rewards, 0, 0, 3, lootBoxes[0]);
}