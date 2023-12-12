import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders

// Get the canvas DOM element
export const canvas = document.getElementById('renderCanvas');

export const engine = new BABYLON.Engine(canvas, true, { antialias: true });

let sceneMeshes;
let baseMesh;

export const initScene = () => {
    // Create a basic BJS Scene object
    const scene = new BABYLON.Scene(engine);

    const camera = initCamera(scene);

    // Creating the SSAO rendering pipeline
    postProcessEffects(scene, camera);

    BABYLON.SceneLoader.ImportMesh(
        undefined, // Name of meshes to load, undefined to load all meshes
        "./models/", // Path to the folder where your GLTF file is located
        "base.glb", // Name of your GLTF file
        scene, // Your Babylon.js scene
        function (meshes, particleSystems, skeletons, animationGroups) {
            // Meshes are now loaded
            sceneMeshes = meshes;
            baseMesh = meshes.find(mesh => mesh.id === "BaseMesh");

            meshes.forEach(mesh => {
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
            });

            // Create shadow generator here, after meshes are loaded
            const shadowGenerator = new BABYLON.ShadowGenerator(1024, mainLight);
            // Now add shadow casters
            for (let i = 2; i < sceneMeshes.length; i++) {
                shadowGenerator.addShadowCaster(sceneMeshes[i]);
                sceneMeshes.receiveShadows = true;
            }


            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.bias = 0.00001;

            shadowGenerator.useBlurExponentialShadowMap = true;
            baseMesh.receiveShadows = true;


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

            shadowGenerator.setDarkness(0.5);

        }
    );

    // // Subtle Blue Light on the Right
    const blueLight = new BABYLON.PointLight("blueLight", new BABYLON.Vector3(-2.5, 5, 2.5), scene);
    blueLight.diffuse = new BABYLON.Color3(0, .5, 1);
    blueLight.intensity = 80;

    // Warm Light on the Left
    const warmLight = new BABYLON.PointLight("warmLight", new BABYLON.Vector3(3, 5, -3), scene);
    warmLight.diffuse = new BABYLON.Color3(1, .5, 0);
    warmLight.intensity = 80;

    //Main Light in the Middle
    const mainLight = new BABYLON.DirectionalLight("mainLight", new BABYLON.Vector3(-1, -2, -1), scene);
    mainLight.diffuse = new BABYLON.Color3(1, 1, 1);
    mainLight.intensity = 5;
    mainLight.range = 10;

    // Main Light in the Middle 2
    const mainLight2 = new BABYLON.PointLight("mainLight2", new BABYLON.Vector3(-2.5, 1.2, -2.5), scene);
    mainLight2.diffuse = new BABYLON.Color3(1, 1, 1);
    mainLight2.intensity = 12;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = scene.clearColor;
    scene.fogStart = 9;
    scene.fogEnd = 13;

    // Return the created scene
    return scene;
};


function postProcessEffects(scene, camera) {
    const ssaoPipeline = new BABYLON.SSAORenderingPipeline("ssao", scene, { ssaoRatio: 3, combineRatio: 1 });
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
    ssaoPipeline.totalStrength = 1.2;
    ssaoPipeline.radius = 0.00005;

    // Create a bloom rendering pipeline
    const bloomPipeline = new BABYLON.DefaultRenderingPipeline("bloom", true, scene);
    bloomPipeline.bloomEnabled = true;

    // Set properties for the bloom rendering pipeline
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
    let aspectRatio = canvas.width / canvas.height; // Aspect ratio from canvas dimensions
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

//addEventListener keydown Up Key to change camera position

addEventListener('keydown', function (event) {
    if (event.key === "ArrowUp") {
        camera.position.y += 0.05;
    }
    if (event.key === "ArrowDown") {
        camera.position.y -= 0.05;
    }
    if (event.key === "ArrowLeft") {
        camera.position.x -= 0.1;
    }
    if (event.key === "ArrowRight") {
        camera.position.x += 0.1;
    }
    if (event.key === "w") {
        camera.position.z += 0.1;
    }
    if (event.key === "s") {
        camera.position.z -= 0.1;
    }

    console.log(camera.position);
    camera.setTarget(BABYLON.Vector3.Zero());
});

export function setOrthoSize(size) {
    orthoSize = size;
    updateCameraOrtho();
}

function updateCameraOrtho() {
    let aspectRatio = canvas.width / canvas.height; // Aspect ratio from canvas dimensions
    let orthoTop = orthoSize;
    let orthoBottom = -orthoSize;
    let orthoLeft = -orthoSize * aspectRatio;
    let orthoRight = orthoSize * aspectRatio;

    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
}