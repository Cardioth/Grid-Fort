import { gridShaderMaterial, camera, GUIcamera } from './sceneInitialization.js';
import { setOrthoSize} from "./sceneInitialization.js";
import { updateCardAnimation } from "../components/cards.js";
import { allBuildingGraphics } from '../gameplay/buildingPlacement.js';
import { menuBackgroundAnimation } from './menuBackgroundAnimation.js';

// Camera Zoom
let zoomTarget = 3;
let zoom = 3;

export function setZoomTarget(size){
    zoomTarget = size;
}

// Gets called every frame
export function updateGraphics(){
    // Animate Camera Zoom
    zoom += (zoomTarget - zoom) * 0.05;
    setOrthoSize(zoom);

    const cameras = [camera, GUIcamera];

    // Animate Camera Position
    for(const camera of cameras){
        camera.position.x += (camera.targetPosition.x - camera.position.x) * 0.025;
        camera.position.y += (camera.targetPosition.y - camera.position.y) * 0.025;
        camera.currentSetTargetPosition.x += (camera.setTargetTargetPosition.x - camera.currentSetTargetPosition.x) * 0.025;
        camera.currentSetTargetPosition.y += (camera.setTargetTargetPosition.y - camera.currentSetTargetPosition.y) * 0.025;
        camera.setTarget(camera.currentSetTargetPosition);
    }

    // Animate Cards
    updateCardAnimation();

    // Animate Shader Time   
    gridShaderMaterial.setFloat("time", performance.now() / 1000);
    
    // Animate Building Placement Movement
    for(const buildingGraphic of allBuildingGraphics){
        buildingGraphic.position.x += (buildingGraphic.targetPosition.x - buildingGraphic.position.x) * 0.2;
        buildingGraphic.position.z += (buildingGraphic.targetPosition.z - buildingGraphic.position.z) * 0.2;
    }

    // Animate weapons
    
}

export function updateMenuGraphics(){
    menuBackgroundAnimation();
}