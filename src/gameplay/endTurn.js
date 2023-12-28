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
import { removeExistingCreditIcons } from "../ui/gameGUI.js";
import { fadeInMeshAnimation } from "../graphics/baseFadeInAnimation.js";


export function endTurn() {
    return function () {
        if(currentScene === "build"){
            document.body.style.cursor='default'
            setCurrentScene("battleCountdown");

            //Random Left or Right position of Enemy Board
            const randomLeftOrRight = Math.floor(Math.random() * 2);
            if(randomLeftOrRight === 0){
                enemyBoard.position = {x:-boardWidth*2,y:0};
                enemyBoard.targetPosition = {x:-boardWidth*2,y:0};
                
                const newBaseMesh = baseMesh.clone();
                const newBaseBaseMesh = baseBaseMesh.clone();
                newBaseMesh.position.x += boardWidth*2;
                newBaseBaseMesh.position.x += boardWidth*2;

                fadeInMeshAnimation(newBaseMesh);
                fadeInMeshAnimation(newBaseBaseMesh);

                enemyBoard.baseMesh = newBaseMesh;
                enemyBoard.baseBaseMesh = newBaseBaseMesh;

                camera.setTargetTargetPosition.x -= boardWidth;
                camera.targetPosition.x -= boardWidth;
                GUIcamera.setTargetTargetPosition.x -= boardWidth;
                GUIcamera.targetPosition.x -= boardWidth;
            } else {
                enemyBoard.position = {x:0,y:-boardWidth*2};
                enemyBoard.targetPosition = {x:0,y:-boardWidth*2};
                
                const newBaseMesh = baseMesh.clone();
                const newBaseBaseMesh = baseBaseMesh.clone();
                newBaseMesh.position.y += boardWidth*2;
                newBaseBaseMesh.position.y += boardWidth*2;

                fadeInMeshAnimation(newBaseMesh);
                fadeInMeshAnimation(newBaseBaseMesh);

                enemyBoard.baseMesh = newBaseMesh;
                enemyBoard.baseBaseMesh = newBaseBaseMesh;

                camera.setTargetTargetPosition.z -= boardWidth;
                camera.targetPosition.z -= boardWidth;
                GUIcamera.setTargetTargetPosition.z -= boardWidth;
                GUIcamera.targetPosition.z -= boardWidth;
            }

            setZoomTarget(3.5);

            removeExistingCreditIcons();

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
