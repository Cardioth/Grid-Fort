import { updateGraphics } from "./graphics/testGraphics";

function gameLoop() {
    updateGraphics();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);