
import { initScene, initGUIScene, engine} from './graphics/initScene';
import { updateTestGraphics } from "./graphics/testGraphics";
import { updateGraphics } from "./graphics/graphics";

const scene = initScene();
const GUIscene = initGUIScene();

engine.runRenderLoop(() => {
    updateGraphics();
    scene.render();
    GUIscene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});


