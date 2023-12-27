import { setCurrentScene } from "../managers/sceneManager.js";
import { baseMesh, baseBaseMesh } from "../graphics/sceneInitialization.js";
import { camera, GUIcamera } from "../graphics/sceneInitialization.js";
import { allBoards, enemyBoard } from "../managers/setup.js";
import { placeBuildingToBoard } from "../gameplay/buildingPlacement.js";
import allBuildings from "../components/buildings.js";
import { updateBoardStats } from "../utilities/utils.js";
import { circularizeGrids } from "../components/grids.js";


export function endTurn() {
    return function () {
        //Clone baseMesh
        const newBaseMesh = baseMesh.clone();
        const newBaseBaseMesh = baseBaseMesh.clone();
        newBaseMesh.position.x += 5.75;
        newBaseBaseMesh.position.x += 5.75;

        camera.setTargetTargetPosition.x -= 5.75/2;
        camera.targetPosition.x -= 5.75/2;
        GUIcamera.setTargetTargetPosition.x -= 5.75/2;
        GUIcamera.targetPosition.x -= 5.75/2;

        //setCurrentScene("battleCountdown");
        allBoards.push(enemyBoard);
        placeBuildingToBoard(allBuildings.core, enemyBoard, 7, 7);
        updateBoardStats(enemyBoard);
        circularizeGrids();
        // countDownNumber = 4;
        // let countDownInterval = setInterval(function () {
        //     countDownNumber--;
        //     if (countDownNumber === 0) {
        //         setCurrentScene("battle");
        //         startBattleLoop();
        //         clearInterval(countDownInterval);
        //     }
        // }, 500);
    };
}
