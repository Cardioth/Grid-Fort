import allBuildings from "./buildings";
import { updateGraphics } from "./graphics";
import { playerBoard, fortStats ,canvas} from "./setup";
import { initializeControls } from "./controls";
import { placeBuildingToBoard } from "./buildingPlacement";

document.addEventListener('DOMContentLoaded', () => {
    initializeControls(canvas);
});

export let currentScene = "build";
export const allBoards = [playerBoard];

export function updateCurrentScene(scene) {
    currentScene = scene;
}

export function updateBoardStats(board){
    board.stats = JSON.parse(JSON.stringify(fortStats));
    board.allPlacedBuildings.forEach((building) => {
        for(let key in building.stats){
            if(board.stats.hasOwnProperty(key)){
                board.stats[key].stat += building.stats[key];
            }
        }5
    });
}

//Place core
placeBuildingToBoard(allBuildings.core,playerBoard,0,0);

function gameLoop() {
    updateGraphics();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);