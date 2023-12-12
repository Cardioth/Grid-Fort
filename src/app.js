
import { initScene, engine, setOrthoSize } from './graphics/initScene';
import { updateTestGraphics } from "./graphics/testGraphics";

const scene = initScene();

let zoom = 2;
engine.runRenderLoop(() => {
    setOrthoSize(zoom);
    updateTestGraphics();
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});


