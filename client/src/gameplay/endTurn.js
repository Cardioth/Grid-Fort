import { currentScene, setCurrentScene } from "../managers/sceneManager.js";
import { baseMesh, baseBaseMesh } from "../graphics/sceneInitialization.js";
import { camera, GUIcamera } from "../graphics/sceneInitialization.js";
import { allBoards, enemyBoard, playerBoard } from "../managers/gameSetup.js";
import { placeBuildingToBoard } from "../gameplay/buildingPlacement.js";
import allBuildings from "../../../common/buildings.js";
import { updateBoardStats } from "../utilities/utils.js";
import { circularizeGrids } from "../components/grids.js";
import { boardWidth } from "../../../common/data/config.js";
import { setZoomTarget } from "../graphics/renderLoop.js";
import { startBattleLoop } from "./battle.js";
import { hideEndTurnButton, removeExistingCreditIcons } from "../ui/gameGUI.js";
import { fadeInMeshAnimation } from "../graphics/animations/meshFadeAnimations.js";
import { AIforts } from "../components/AIforts.js";
import { placeAIFort } from "./buildingPlacement.js";
import { drawBattleCountdown } from "../graphics/drawBattleCountdown.js";
import { exportBoard } from "./exportBoard.js";
import { serverUrl } from "../network/serverURL.js";

export const baseMeshes = [];

export function endTurn() {
    return function () {
        if(currentScene === "build"){
            document.body.style.cursor='default'
            setCurrentScene("battleCountdown");
            
            if(serverUrl === "https://localhost:3000"){
                exportBoard(playerBoard);
            }  
            hideEndTurnButton();          

            //Random Left or Right position of Enemy Board //TODO: merge into one function
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

                baseMeshes.push(newBaseMesh);
                baseMeshes.push(newBaseBaseMesh);
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

                baseMeshes.push(newBaseMesh);
                baseMeshes.push(newBaseBaseMesh);
            }

            setZoomTarget(3.5);

            removeExistingCreditIcons();

            allBoards.push(enemyBoard);

            placeBuildingToBoard(allBuildings.core, enemyBoard, -1, -1);
            placeAIFort(Math.floor(Math.random() * AIforts.length));

            updateBoardStats(enemyBoard);
            circularizeGrids();
            let countDownNumber = 4;
            let countDownInterval = setInterval(function () {
                countDownNumber--;

                drawBattleCountdown(countDownNumber);
                if (countDownNumber === 0) {
                    setCurrentScene("battle");
                    startBattleLoop();
                    clearInterval(countDownInterval);
                }
            }, 800);
        }
    };
}
