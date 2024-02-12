import { updateCameraOrtho, engine } from "./sceneInitialization";

export function resizeCanvas() {
    const canvas = document.getElementById('renderCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateCameraOrtho();

    engine.resize(true);
}
// Call resizeCanvas initially and on every window resize and orientation change
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
