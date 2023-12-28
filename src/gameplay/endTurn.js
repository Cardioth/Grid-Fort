import { currentScene, setCurrentScene } from "../managers/sceneManager.js";
import { baseMesh, baseBaseMesh } from "../graphics/sceneInitialization.js";
import { camera, GUIcamera } from "../graphics/sceneInitialization.js";
import { allBoards, enemyBoard } from "../managers/setup.js";
import { placeBuildingToBoard } from "../gameplay/buildingPlacement.js";
import allBuildings from "../components/buildings.js";
import { updateBoardStats } from "../utilities/utils.js";
import { circularizeGrids } from "../components/grids.js";
import { boardWidth } from "../data/config.js";
import { setZoomTarget } from "../graphics/graphics.js";
import { startBattleLoop } from "./battle.js";


export function endTurn() {
    return function () {
        if(currentScene === "build"){
            document.body.style.cursor='default'
            setCurrentScene("battleCountdown");
            //Clone baseMesh
            const newBaseMesh = baseMesh.clone();
            const newBaseBaseMesh = baseBaseMesh.clone();
            newBaseMesh.position.x += boardWidth*2;
            newBaseBaseMesh.position.x += boardWidth*2;

            camera.setTargetTargetPosition.x -= boardWidth;
            camera.targetPosition.x -= boardWidth;
            GUIcamera.setTargetTargetPosition.x -= boardWidth;
            GUIcamera.targetPosition.x -= boardWidth;

            setZoomTarget(3.5);

            allBoards.push(enemyBoard);
            placeBuildingToBoard(allBuildings.core, enemyBoard, -1, -1);
            updateBoardStats(enemyBoard);
            circularizeGrids();
            let countDownNumber = 4;
            let countDownInterval = setInterval(function () {
                countDownNumber--;
                if (countDownNumber === 0) {
                    setCurrentScene("battle");
                    startBattleLoop();
                    clearInterval(countDownInterval);
                }
            }, 500);
        }
    };
}
