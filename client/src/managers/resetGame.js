import * as BABYLON from '@babylonjs/core';
import { enemyBoard, playerBoard } from './gameSetup.js';
import { baseMeshes as enemyBaseMeshes } from '../gameplay/endTurn.js';
import { resetCameraTargetPositions } from '../gameplay/endBattle.js';
import { clearHand } from '../components/cards.js';
import { clearBoard } from '../utilities/utils.js';
import { setOrthoSize, camera, cameraHeight, GUIcamera, baseMesh, baseBaseMesh, backgroundMesh, gridPlane, scene, importMenuBackground, lights } from '../graphics/sceneInitialization.js';


export const resetGame = () => {
    //Clear boards
    clearBoard(playerBoard);
    clearBoard(enemyBoard);

    //Remove cards from hand
    clearHand();

    //Reset camera
    setOrthoSize(2.45);
    resetCameraTargetPositions();
    camera.position = new BABYLON.Vector3(5, cameraHeight, 5);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    GUIcamera.position = new BABYLON.Vector3(5, cameraHeight, 5);
    GUIcamera.setTarget(new BABYLON.Vector3(0, 0, 0));

    //Hide Base Meshes
    baseMesh.setEnabled(false);
    baseBaseMesh.setEnabled(false);
    enemyBaseMeshes.forEach(mesh => {
        mesh.dispose();
    });

    //Hide game background mesh
    backgroundMesh.setEnabled(false);

    //Hide Grid
    gridPlane.setEnabled(false);

    //Remove particle systems
    scene.particleSystems.forEach(particleSystem => {
        particleSystem.dispose();
    });

    importMenuBackground(scene, lights); //Game meshes
};
