import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import * as GUI from '@babylonjs/gui';
import { getShaderMaterial } from '../shaders/gridMaterial.js';
import { gridHeight, gridWidth } from '../data/config.js';
import { initializeGameControls } from '../managers/eventListeners.js';
import { drawTestPlaneTexture } from './testingGraphics/drawTestPlaneTexture.js';
import { currentScene, setCurrentScene } from '../managers/sceneManager.js';
import { updateGraphics, updateMenuGraphics } from './renderLoop.js';
import { createMenuScreen } from '../ui/menuGUI.js';
import WebFont from "webfontloader";
import { createPreloadScreen } from '../ui/preloadGUI.js';
import { fadeToBlack } from '../ui/generalGUI.js';
import { displayBottomUI } from '../ui/gameGUI.js';
import { gameSetup } from '../managers/gameSetup.js';
import { loadParticleSystems } from './particleEffects/loadParticleEffects.js';
import { loadImages as loadImages } from './loadImages.js';
import { createDarkenedMaterial } from './darkenBuilding.js';
import { checkAuth } from '../network/checkAuth.js';
import { createConnectingScreen } from '../network/authenticationScreen.js';

export const canvas = document.getElementById('renderCanvas');

export const engine = new BABYLON.Engine(canvas, true, { antialias: true });

engine.loadingScreen = {
    displayLoadingUI: function() {},
    hideLoadingUI: function() {}
};

export let scene;
export let GUIscene;
export let fadeScene;

// Meshs
let allMeshes;
export let baseMesh;
export let baseBaseMesh;
export let backgroundMesh;
export let gridPlane;
export let gridShaderMaterial;
export let buildingAssets;
export let weaponAssets;
export let shadowGenerator;
export let menuBackgrounds = [];
export let boostedCellGraphic;
export let lights;

// Material Atlas
export const materialAtlas = [];

// Laser Material Pool
export const laserMaterialPool = [];

// Testing Plane
let testPlane;
export let testPlaneContext;
export let testPlaneTexture;

// Raycasting Collision Plane
export let collisionPlane;

// Cameras
export let camera;
export let GUIcamera;
let orthoSize = 3;
export let cameraHeight = 6.5;

// GUI
export let GUITexture;

// Fade Texture
export let fadeTexture;

export const initPreloadScene = () => {
    scene = new BABYLON.Scene(engine);

    camera = initCamera(scene); //Camera
    
    WebFont.load({
        custom: {
            families: ['GemunuLibre-Bold', 'GemunuLibre-Medium', 'RussoOne-Regular'],
            urls: ['style.css']
        },
        active: function () {
            createPreloadScreen();
        }
    });

    initFadeScene();

    loadParticleSystems(scene); //Particle effects

    loadImages(scene); //Preload images and models

    loadModels(scene);

    initializeGameControls(canvas); //Event listeners

    addLaserMaterialsToMaterialPool(200);

    return scene;
}

export const initAuthenticationScene = () => {
    setOrthoSize(2.45);
    
    postProcessEffects(scene, camera); //Post processing effects

    lights = initLights(scene); //Lights

    importMenuBackground(scene, lights); //Game meshes

    createConnectingScreen(); //Connecting screen

    checkAuth();
}

export const initMenuScene = () => {
    createMenuScreen(); //Menu screen
};

export const initGameScene = () => {
    for(let i = 0; i < menuBackgrounds.length; i++){
        menuBackgrounds[i].dispose();
    }

    baseMesh.setEnabled(true);
    baseBaseMesh.setEnabled(true);
    backgroundMesh.setEnabled(true);

    //initShadows(lights);

    addReflectionsToBase(scene, allMeshes);    

    gridPlane = createGridGraphic(); //Grid graphic

    collisionPlane = createCollisionPlane(); // For raycasting

    //createTestingPlane(); // For visualising building placement

    displayBottomUI(); //Bottom UI

    gameSetup();
};

function initFadeScene() {
    fadeScene = new BABYLON.Scene(engine);
    const fadeCamera = new BABYLON.FreeCamera("fadeCamera", new BABYLON.Vector3(5, 5, 5), fadeScene);
    fadeScene.autoClear = false;
    fadeScene.autoClearDepthAndStencil = false;
    fadeTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("fadeTexture", true, fadeScene);
}

export const initGUIScene = () => {
    if(GUIscene){
        GUITexture.dispose();
    }
    GUIscene = new BABYLON.Scene(engine);
    GUIcamera = new BABYLON.FreeCamera("GUIcamera", new BABYLON.Vector3(5, cameraHeight, 5), GUIscene);
    GUIcamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    GUIcamera.setTarget(new BABYLON.Vector3(0, 0, 0));

    GUIcamera.targetPosition = new BABYLON.Vector3(5, cameraHeight, 5);
    GUIcamera.defaultTargetPosition = new BABYLON.Vector3(5, cameraHeight, 5);
    GUIcamera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    GUIcamera.currentSetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    GUIcamera.setTarget(GUIcamera.currentSetTargetPosition);
    updateCameraOrtho();    

    GUIscene.autoClear = false;
    GUIscene.autoClearDepthAndStencil = false;
    GUITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, GUIscene);

    return GUIscene;
}

function createCollisionPlane() {
    const collisionPlane = BABYLON.MeshBuilder.CreatePlane("plane", { width: 50, height: 50 }, scene);
    collisionPlane.position = new BABYLON.Vector3(0, 0, 0);
    collisionPlane.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI / 2, BABYLON.Space.WORLD);
    collisionPlane.material = new BABYLON.StandardMaterial("collisionPlaneMaterial", scene);
    collisionPlane.material.alpha = 0;
    collisionPlane.isPickable = true;
    return collisionPlane;
}

function createTestingPlane() {
    testPlane = BABYLON.MeshBuilder.CreatePlane("plane", { width: gridWidth / 4, height:gridWidth / 4 }, scene);
    testPlane.position = new BABYLON.Vector3(0, 0, 0);
    testPlane.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI / 2, BABYLON.Space.WORLD);
    testPlane.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI, BABYLON.Space.WORLD);
    testPlane.material = new BABYLON.StandardMaterial("testPlaneMaterial", scene);

    testPlaneTexture = new BABYLON.DynamicTexture("playerBoardTexture", { width: 1000, height: 1000 }, scene, true);
    testPlaneContext = testPlaneTexture.getContext();
    // Create grid mask texture
    drawTestPlaneTexture(testPlaneTexture);
    testPlane.material.diffuseTexture = testPlaneTexture;
    testPlane.material.specularColor = new BABYLON.Color3(0, 0, 0);

    //Hide test plane
    testPlane.setEnabled(false);
}

function createGridGraphic() {
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: gridWidth / 4, height: gridHeight / 4 }, scene);
    plane.position = new BABYLON.Vector3(0, 0, 0);
    plane.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI / 2, BABYLON.Space.WORLD);
    plane.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI, BABYLON.Space.WORLD);
    gridShaderMaterial = getShaderMaterial();
    plane.material = gridShaderMaterial;

    return plane;
}

function addMeshMaterialsToMaterialAtlas(mesh) {
    for (const child of mesh.getChildren()) {
        if (child.material) {
            if(!materialAtlas.includes(child.material)){
                materialAtlas.push(child.material);
                const darkenedMaterial = createDarkenedMaterial(child.material);
                darkenedMaterial.name = child.material.name + "_darkened";
                materialAtlas.push(darkenedMaterial);
            }
        }
    }
}

function addLaserMaterialsToMaterialPool(poolSize) {
    for(let i = 0; i < poolSize; i++){
        const laserMaterial = new BABYLON.StandardMaterial("laserMaterial", scene);
        laserMaterial.emissiveColor = new BABYLON.Color3(.7, 1, 1);
        laserMaterial.disableLighting = true;
        laserMaterial.diffuseTexture = new BABYLON.Texture("textures/laserTexture.png", scene);
        laserMaterial.diffuseTexture.hasAlpha = true;
        laserMaterial.useAlphaFromDiffuseTexture = true;
        laserMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
        laserMaterial.name = "laserMaterial";
        laserMaterialPool.push(laserMaterial);
    }

    const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", scene);
    glowMaterial.emissiveColor = new BABYLON.Color3(.4, .65, .65);
    glowMaterial.disableLighting = true;
    glowMaterial.diffuseTexture = new BABYLON.Texture("textures/laserTextureGlow.png", scene);
    glowMaterial.diffuseTexture.hasAlpha = true;
    glowMaterial.useAlphaFromDiffuseTexture = true;
    glowMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    glowMaterial.name = "glowMaterial";
    materialAtlas.push(glowMaterial);
}

function preWarmMaterials() {
    for (let i = 0; i < materialAtlas.length; i++) {
        materialAtlas[i].freeze();
    }
}

function loadModels(scene) {
    buildingAssets = new BABYLON.AssetContainer(scene);
    weaponAssets = new BABYLON.AssetContainer(scene);

    BABYLON.SceneLoader.ImportMesh(undefined, "./models/", "base.glb", scene,
        function (meshes) {
            allMeshes = meshes;
            baseMesh = meshes.find(mesh => mesh.id === "BaseMesh");
            backgroundMesh = meshes.find(mesh => mesh.id === "Plane001");
            baseBaseMesh = meshes.find(mesh => mesh.id === "baseBase");
            boostedCellGraphic = meshes.find(mesh => mesh.id === "boostedCell");

            boostedCellGraphic.isPickable = false;
            backgroundMesh.isPickable = false;
            baseBaseMesh.isPickable = false;
            baseMesh.isPickable = false;
            baseMesh.receiveShadows = true;

            //If id ends in Building add to building assets
            for (let i = 0; i < meshes.length; i++) {
                if (meshes[i].parent && (meshes[i].parent.id.endsWith("Building"))) {
                    if (!buildingAssets.meshes.includes(meshes[i].parent)) {
                        buildingAssets.meshes.push(meshes[i].parent);
                        addMeshMaterialsToMaterialAtlas(meshes[i].parent);                  
                    }
                    meshes[i].setEnabled(false);
                }
                if (meshes[i].parent && (meshes[i].parent.id.endsWith("Weapon"))) {
                    if (!weaponAssets.meshes.includes(meshes[i].parent)) {
                        weaponAssets.meshes.push(meshes[i].parent);
                        addMeshMaterialsToMaterialAtlas(meshes[i].parent); 
                    }
                    meshes[i].setEnabled(false);
                }
            }

            boostedCellGraphic.setEnabled(false);
            baseMesh.setEnabled(false);
            baseBaseMesh.setEnabled(false);
            backgroundMesh.setEnabled(false);

            fadeToBlack(() => {
                setCurrentScene("authentication");
                preWarmMaterials();
            });
        }
    );
}

export function importMenuBackground(scene) {
    BABYLON.SceneLoader.ImportMesh(undefined, "./models/", "menuBackground.glb", scene,
        function (meshes) {
            const backgroundMesh = meshes.find(mesh => mesh.id === "Plane001");
            menuBackgrounds.push(backgroundMesh);
            const secondBackgroundMesh = backgroundMesh.clone("backgroundMesh");
            menuBackgrounds.push(secondBackgroundMesh);
            const meshWidth = backgroundMesh.getBoundingInfo().boundingBox.extendSizeWorld.x;
            backgroundMesh.width = meshWidth;
            secondBackgroundMesh.width = meshWidth;
            backgroundMesh.position.x = -meshWidth;
            secondBackgroundMesh.position.x = meshWidth;
        }
    )
}

function initShadows(mainLight) {
    shadowGenerator = new BABYLON.ShadowGenerator(1024, mainLight);
    shadowGenerator.bias = 0.00001;
    shadowGenerator.setDarkness(0);
}

function addReflectionsToBase(scene, meshes) {
    let baseMaterial = new BABYLON.PBRMaterial("baseMaterial", scene);
    baseMaterial.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    baseMesh.material.roughness = 0.6;
    baseMesh.material.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
    baseMesh.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
    baseMesh.material.reflectionTexture.level = 3;
    for (let i = 1; i < meshes.length; i++) {
        if (meshes[i].id.endsWith("Building")) {
            baseMesh.material.reflectionTexture.renderList.push(meshes[i]);
        }
    }
}

function initLights(scene) {

    // Blue Light
    const blueLight = new BABYLON.PointLight("blueLight", new BABYLON.Vector3(-2.5, 5, 2.5), scene);
    blueLight.diffuse = new BABYLON.Color3(0, .5, 1);
    blueLight.intensity = 80;

    // Warm Light
    const warmLight = new BABYLON.PointLight("warmLight", new BABYLON.Vector3(3, 7, -3), scene);
    warmLight.diffuse = new BABYLON.Color3(1, .5, 0);
    warmLight.intensity = 120;

    // Front Light
    const frontLight = new BABYLON.DirectionalLight("frontLight", new BABYLON.Vector3(-1, -2, -1), scene);
    frontLight.diffuse = new BABYLON.Color3(1, 1, 1);
    frontLight.intensity = 6;
    frontLight.range = 10;

    // Fog
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = new BABYLON.Color3(0.2, 0.22, 0.29);
    scene.fogStart = 10;
    scene.fogEnd = 15;

    //return backLight;
}

function postProcessEffects(scene, camera) {
    const ssaoPipeline = new BABYLON.SSAORenderingPipeline("ssao", scene, 1);
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
    ssaoPipeline.totalStrength = 1;
    ssaoPipeline.radius = 0.00005;

    const bloomPipeline = new BABYLON.DefaultRenderingPipeline("bloom", true, scene);
    bloomPipeline.bloomEnabled = true;
    bloomPipeline.bloomThreshold = 0.34;
    bloomPipeline.bloomWeight = 1.65;
    bloomPipeline.bloomKernel = 30;
    bloomPipeline.bloomScale = 2;

    var fxaaPostProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, camera);
    fxaaPostProcess.samples = 1;
}

function initCamera(scene) {
    camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(5, cameraHeight, 5), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    updateCameraOrtho();
    camera.targetPosition = new BABYLON.Vector3(5, cameraHeight, 5);
    camera.defaultTargetPosition = new BABYLON.Vector3(5, cameraHeight, 5);
    camera.setTargetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    camera.currentSetTargetPosition = new BABYLON.Vector3(0, 0, 0);
    camera.setTarget(camera.currentSetTargetPosition);
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

    if(camera){
        camera.orthoTop = orthoTop;
        camera.orthoBottom = orthoBottom;
        camera.orthoLeft = orthoLeft;
        camera.orthoRight = orthoRight;
    }

    if(GUIcamera){
        GUIcamera.orthoTop = orthoTop;
        GUIcamera.orthoBottom = orthoBottom;
        GUIcamera.orthoLeft = orthoLeft;
        GUIcamera.orthoRight = orthoRight;
    }
}

engine.runRenderLoop(() => {
    if (currentScene === "menu" || currentScene === "authentication") {
        scene.render();
        GUIscene.render();
        updateMenuGraphics();
    }

    if (currentScene === "build" || currentScene === "battle" || currentScene === "battleCountdown" || currentScene === "endBattle") {
        scene.render();
        GUIscene.render();
        updateGraphics();
    }

    if (currentScene === "preload") {
        GUIscene.render();
    }
    fadeScene.render();
});