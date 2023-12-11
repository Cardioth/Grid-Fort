import '@babylonjs/loaders'; // If you need to import any loaders
import { initScene } from './initScene';
import { engine } from './initScene';

const scene = initScene();

engine.runRenderLoop(() => {
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});


