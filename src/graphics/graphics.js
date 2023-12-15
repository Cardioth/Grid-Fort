import { shaderMaterial } from './initScene.js';
import { setOrthoSize} from "./initScene.js";
import WebFont from "webfontloader";
import { hand, updateCardAnimation } from "../components/cards.js";
import { createCardGraphic } from "./createCardGraphic.js";

let zoomTarget = 2.5;
let zoom = 2.5;

export function setZoomTarget(size){
    zoomTarget = size;
}

// Gets called every frame
export function updateGraphics(){
    // Animate Camera Zoom
    zoom += (zoomTarget - zoom) * 0.05;
    setOrthoSize(zoom);

    // Animate Cards
    updateCardAnimation();

    // Update Shader Time   
    shaderMaterial.setFloat("time", performance.now() / 1000);

}



WebFont.load({
    custom: {
        families: ['GemunuLibre-Bold', 'GemunuLibre-Medium', 'RussoOne-Regular'],
        urls: ['style.css']
    },
    active: function () {
        hand.forEach(card => {
            createCardGraphic(card);
        });
    }
});

