
import { initScene, engine} from './graphics/initScene';
import { updateTestGraphics } from "./graphics/testGraphics";
import { updateGraphics } from "./graphics/graphics";

const scene = initScene();

engine.runRenderLoop(() => {
    updateGraphics();
    updateTestGraphics();
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});


