import allBuildings from "./buildings";
import { updateGraphics } from "./graphics";
import { playerBoard, canvas} from "./setup";
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

placeBuildingToBoard(allBuildings.core,playerBoard,0,0);

function gameLoop() {
    updateGraphics();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);