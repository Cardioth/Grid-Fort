import { shaderMaterial } from './initScene.js';
import { setOrthoSize} from "./initScene.js";
import WebFont from "webfontloader";
import { hand, updateCardAnimation } from "../components/cards.js";
import { createCardGraphic } from "./createCardGraphic.js";
import { allBuildingGraphics } from '../gameplay/buildingPlacement.js';

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

    for(const buildingGraphic of allBuildingGraphics){
        buildingGraphic.position.x += (buildingGraphic.targetPosition.x - buildingGraphic.position.x) * 0.2;
        buildingGraphic.position.z += (buildingGraphic.targetPosition.z - buildingGraphic.position.z) * 0.2;
    }
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

