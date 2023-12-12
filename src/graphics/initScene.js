import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders

// Get the canvas DOM element
export const canvas = document.getElementById('renderCanvas');

export const engine = new BABYLON.Engine(canvas, true, { antialias: true });

let sceneMeshes;
let baseMesh;

export const initScene = () => {
    const scene = new BABYLON.Scene(engine);
    const buildingAssets = new BABYLON.AssetContainer(scene);
    
    const mainLight = initLights(scene); //Lights
    
    const camera = initCamera(scene); //Camera

    postProcessEffects(scene, camera); //Post Processing

    //Meshes
    BABYLON.SceneLoader.ImportMesh(undefined,"./models/","base.glb",scene,
        function (meshes) {
            sceneMeshes = meshes;
            baseMesh = meshes.find(mesh => mesh.id === "BaseMesh");

            
            //If id ends in Building add to building assets
            for(let i = 0; i < meshes.length; i++){
                console.log(meshes.parentNode);
                if(meshes[i].parentNode){
                    buildingAssets.meshes.push(meshes[i]);
                    meshes[i].setEnabled(false);
                }
            }
            
            meshes.forEach(mesh => {
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
            });

            initShadows(mainLight);

            addReflectionsToBase(scene);
        }
    );

    return scene;
};

export let shadowGenerator;
function initShadows(mainLight) {
    shadowGenerator = new BABYLON.ShadowGenerator(1024, mainLight);
    shadowGenerator.bias = 0.00001;
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.setDarkness(0);
    baseMesh.receiveShadows = true;
}

function addReflectionsToBase(scene) {
    let baseMaterial = new BABYLON.PBRMaterial("baseMaterial", scene);
    baseMaterial.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    baseMesh.material.roughness = 0.6;
    baseMesh.material.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
    baseMesh.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
    baseMesh.material.reflectionTexture.level = 1;
    for (let i = 1; i < sceneMeshes.length; i++) {
        if (sceneMeshes[i].id !== "BaseMesh") {
            baseMesh.material.reflectionTexture.renderList.push(sceneMeshes[i]);
        }
    }
}

function initLights(scene) {
    // Blue Light
    const blueLight = new BABYLON.PointLight("blueLight", new BABYLON.Vector3(-2.5, 5, 2.5), scene);
    blueLight.diffuse = new BABYLON.Color3(0, .5, 1);
    blueLight.intensity = 80;

    // Warm Light
    const warmLight = new BABYLON.PointLight("warmLight", new BABYLON.Vector3(3, 5, -3), scene);
    warmLight.diffuse = new BABYLON.Color3(1, .5, 0);
    warmLight.intensity = 80;

    //Main Light 1
    const mainLight = new BABYLON.DirectionalLight("mainLight", new BABYLON.Vector3(-1, -2, -1), scene);
    mainLight.diffuse = new BABYLON.Color3(1, 1, 1);
    mainLight.intensity = 5;
    mainLight.range = 10;

    // Main Light 2
    const mainLight2 = new BABYLON.PointLight("mainLight2", new BABYLON.Vector3(-2.5, 1.2, -2.5), scene);
    mainLight2.diffuse = new BABYLON.Color3(1, 1, 1);
    mainLight2.intensity = 12;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = scene.clearColor;
    scene.fogStart = 9;
    scene.fogEnd = 13;
    return mainLight;
}

function postProcessEffects(scene, camera) {
    const ssaoPipeline = new BABYLON.SSAORenderingPipeline("ssao", scene, { ssaoRatio: 3, combineRatio: 1 });
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
    ssaoPipeline.totalStrength = 1.2;
    ssaoPipeline.radius = 0.00005;

    const bloomPipeline = new BABYLON.DefaultRenderingPipeline("bloom", true, scene);
    bloomPipeline.bloomEnabled = true;

    bloomPipeline.bloomThreshold = 0.27;
    bloomPipeline.bloomWeight = 2;
    bloomPipeline.bloomKernel = 30;
    bloomPipeline.bloomScale = 4;

    var fxaaPostProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, camera);
    fxaaPostProcess.samples = 2;
}

let camera;
let orthoSize = 1;
function initCamera(scene) {
    let aspectRatio = canvas.width / canvas.height;
    let orthoTop = orthoSize;
    let orthoBottom = -orthoSize;
    let orthoLeft = -orthoSize * aspectRatio;
    let orthoRight = orthoSize * aspectRatio;

    camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(5, 6.2, 5), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
    camera.setTarget(BABYLON.Vector3.Zero());
    return camera;
}

export function setOrthoSize(size) {
    orthoSize = size;
    updateCameraOrtho();
}

function updateCameraOrtho() {
    let aspectRatio = canvas.width / canvas.height;
    let orthoTop = orthoSize;
    let orthoBottom = -orthoSize;
    let orthoLeft = -orthoSize * aspectRatio;
    let orthoRight = orthoSize * aspectRatio;

    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
}