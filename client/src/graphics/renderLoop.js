import { gridShaderMaterial, camera, GUIcamera } from './sceneInitialization.js';
import { setOrthoSize} from "./sceneInitialization.js";
import { updateCardAnimation } from "../components/cards.js";
import { allBuildingGraphics } from '../gameplay/buildingPlacement.js';
import { menuBackgroundAnimation } from './animations/menuBackgroundAnimation.js';
import { currentScene } from '../managers/sceneManager.js';

// Camera Zoom
let zoomTarget = 2.5;
export let zoom = 3;

export function setZoomTarget(size){
    zoomTarget = size;
}

// Gets called every frame
export function updateGraphics(){
    if(currentScene !== "menu"){
        // Animate Camera Zoom
        zoom += (zoomTarget - zoom) * 0.05;
        setOrthoSize(zoom);
        const cameras = [camera, GUIcamera];

        // Animate Camera Position only if target position is far from current camera position

        let distanceFromTargetPositionX = Math.abs(camera.position.x - camera.targetPosition.x);
        let distanceFromTargetPositionZ = Math.abs(camera.position.z - camera.targetPosition.z);

        if(distanceFromTargetPositionX > 0.1 || distanceFromTargetPositionZ > 0.1){
            for(const camera of cameras){
                camera.position.x += (camera.targetPosition.x - camera.position.x) * 0.015;
                camera.position.z += (camera.targetPosition.z - camera.position.z) * 0.015;
                camera.currentSetTargetPosition.x += (camera.setTargetTargetPosition.x - camera.currentSetTargetPosition.x) * 0.025;
                camera.currentSetTargetPosition.z += (camera.setTargetTargetPosition.z - camera.currentSetTargetPosition.z) * 0.025;
                camera.setTarget(camera.currentSetTargetPosition);
            }
        }


        // Animate Cards
        updateCardAnimation();

        // Animate Shader Time   
        gridShaderMaterial.setFloat("time", performance.now() / 1000);
        
        // Animate Building Placement Movement //TODO: only animate buildings being placed
        for(const buildingGraphic of allBuildingGraphics){
            buildingGraphic.position.x += (buildingGraphic.targetPosition.x - buildingGraphic.position.x) * 0.2;
            buildingGraphic.position.z += (buildingGraphic.targetPosition.z - buildingGraphic.position.z) * 0.2;
        }
    }
}

export function updateMenuGraphics(){
    menuBackgroundAnimation();
}