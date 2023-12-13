import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders
import * as GUI from '@babylonjs/gui';

export const canvas = document.getElementById('renderCanvas');

export const engine = new BABYLON.Engine(canvas, true, { antialias: true });

let sceneMeshes;
let baseMesh;
let buildingAssets;
let WeaponAssets;

export const initScene = () => {
    const scene = new BABYLON.Scene(engine);
   
    const lights = initLights(scene); //Lights
    
    const camera = initCamera(scene); //Camera

    postProcessEffects(scene, camera); //Post Processing

    importModels(scene, lights); //Meshes

    return scene;
};

export let advancedTexture;
export const initGUIScene = () => {
    const GUIscene = new BABYLON.Scene(engine);
    const camera = new BABYLON.FreeCamera("GUIcamera", new BABYLON.Vector3(0, 0, 0), GUIscene);
    GUIscene.autoClear = false;
    GUIscene.autoClearDepthAndStencil = false;
    advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", true, GUIscene);
    advancedTexture.idealWidth = 1250;
    return GUIscene;
}

function importModels(scene, mainLight) {
    buildingAssets = new BABYLON.AssetContainer(scene);
    WeaponAssets = new BABYLON.AssetContainer(scene);

    BABYLON.SceneLoader.ImportMesh(undefined, "./models/", "base.glb", scene,
        function (meshes) {
            sceneMeshes = meshes;
            baseMesh = meshes.find(mesh => mesh.id === "BaseMesh");

            //If id ends in Building add to building assets
            for (let i = 0; i < meshes.length; i++) {
                // meshes[i].rotation = new BABYLON.Vector3(0, 0, 0);
                if (meshes[i].parent && (meshes[i].parent.id.endsWith("Building"))) {
                    meshes[i].position = new BABYLON.Vector3(0, 0, 0);
                    meshes[i].setEnabled(false);
                    //if parent is not already in building assets add it
                    if (!buildingAssets.meshes.includes(meshes[i].parent)) {
                        buildingAssets.meshes.push(meshes[i].parent);
                    }
                }
                if (meshes[i].parent && (meshes[i].parent.id.endsWith("Weapon"))) {
                    meshes[i].setEnabled(false);
                    WeaponAssets.meshes.push(meshes[i]);
                }
            }

            initShadows(mainLight);

            addReflectionsToBase(scene);

            cloneBuilding("boringBuilding", 0, 0, 0);
            cloneBuilding("energyBuilding", 0, -12, 0);
            cloneBuilding("basicLaserBuilding", -20, 0, 180);
        }
    );
}

function cloneBuilding(name, x,z, yRotation = 0) {
    let building = buildingAssets.meshes.find(m => m.name === name);
    if (building) {
        let clone = building.clone(name + "_clone", null, true);
        for(let i = 0; i < building.getChildMeshes().length; i++){
            let child = building.getChildMeshes()[i];
            let childClone = child.clone(child.name + "_clone", clone, true);
            childClone.setEnabled(true);
            baseMesh.material.reflectionTexture.renderList.push(childClone); //Add to render list for reflections
            shadowGenerator.addShadowCaster(childClone); //Add to shadow generator
            
            //Bizzare rotation and scaling to get the building to face the right way
            childClone.rotation.x = -(90) * (Math.PI / 180);
            childClone.rotation.y = (yRotation+180) * (Math.PI / 180);
            childClone.scaling.y = -1;

            childClone.position.x = x;
            childClone.position.z = z;
        }
        return clone;
    }
    return null;
}

export let shadowGenerator;
function initShadows(mainLight) {
    shadowGenerator = new BABYLON.ShadowGenerator(1024, mainLight);
    shadowGenerator.bias = 0.00001;
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
    const warmLight = new BABYLON.PointLight("warmLight", new BABYLON.Vector3(3, 7, -3), scene);
    warmLight.diffuse = new BABYLON.Color3(1, .5, 0);
    warmLight.intensity = 120;

    // Back Light
    const backLight = new BABYLON.PointLight("backLight", new BABYLON.Vector3(-2.5, 6, -2.5), scene);
    backLight.diffuse = new BABYLON.Color3(1, 1, 1);
    backLight.intensity = 12;

    // Front Light
    const frontLight = new BABYLON.DirectionalLight("frontLight", new BABYLON.Vector3(-1, -2, -1), scene);
    frontLight.diffuse = new BABYLON.Color3(1, 1, 1);
    frontLight.intensity = 6;
    frontLight.range = 10;

    // Fog
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = scene.clearColor;
    scene.fogStart = 9;
    scene.fogEnd = 13;
    return backLight;
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
    camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(5, 6.2, 5), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    updateCameraOrtho();
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