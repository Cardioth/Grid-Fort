import { updateGraphics } from "./graphics";

function gameLoop() {
    updateGraphics();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);