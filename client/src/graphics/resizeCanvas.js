import { updateCameraOrtho } from "./sceneInitialization";

export function resizeCanvas() {
    const canvas = document.getElementById('renderCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    updateCameraOrtho();

}
// Call resizeCanvas initially and on every window resize and orientation change
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
