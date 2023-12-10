import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');

// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true);

let sceneMeshes;

let baseMesh;

// CreateScene function that creates and returns the scene
const createScene = () => {
    // Create a basic BJS Scene object
    const scene = new BABYLON.Scene(engine);

    let orthoSize = 2.5;
    let aspectRatio = canvas.width / canvas.height; // Aspect ratio from canvas dimensions
    let orthoTop = orthoSize;
    let orthoBottom = -orthoSize;
    let orthoLeft = -orthoSize * aspectRatio;
    let orthoRight = orthoSize * aspectRatio;
    
    const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(5, 8, 5), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
    camera.setTarget(BABYLON.Vector3.Zero());

    // Creating the SSAO rendering pipeline
    const ssaoPipeline = new BABYLON.SSAORenderingPipeline("ssao", scene, { ssaoRatio: 3, combineRatio: 1 });
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
    ssaoPipeline.totalStrength = 1.3;
    ssaoPipeline.radius = 0.0002;

    // Create a bloom rendering pipeline
    const bloomPipeline = new BABYLON.DefaultRenderingPipeline("bloom", true, scene);
    bloomPipeline.bloomEnabled = true;

    // Set properties for the bloom rendering pipeline
    bloomPipeline.bloomThreshold = 0.25;
    bloomPipeline.bloomWeight = 2;
    bloomPipeline.bloomKernel = 50;
    bloomPipeline.bloomScale = 2;

    BABYLON.SceneLoader.ImportMesh(
        undefined, // Name of meshes to load, undefined to load all meshes
        "./models/", // Path to the folder where your GLTF file is located
        "base.glb", // Name of your GLTF file
        scene, // Your Babylon.js scene
        function (meshes, particleSystems, skeletons, animationGroups) {
            // Meshes are now loaded
            sceneMeshes = meshes;
            baseMesh = meshes.find(mesh => mesh.id === "BaseMesh");
            let planeMesh = meshes.find(mesh => mesh.id === "Plane001");
    
            meshes.forEach(mesh => {
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
            });

            // Create shadow generator here, after meshes are loaded
            const shadowGenerator = new BABYLON.ShadowGenerator(1024, mainLight);
            // Now add shadow casters
            for (let i = 1; i < sceneMeshes.length; i++) {
                shadowGenerator.addShadowCaster(sceneMeshes[i]);
            }
            
     
            shadowGenerator.usePercentageCloserFiltering = true;
            shadowGenerator.bias = 0.00001;

            //shadowGenerator.useBlurExponentialShadowMap = true;
            baseMesh.receiveShadows = true;
            planeMesh.receiveShadows = true;


            let baseMaterial = new BABYLON.PBRMaterial("baseMaterial", scene);
            baseMaterial.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            baseMesh.material.metallic = 0.5;
            baseMesh.material.roughness = 0.5;
            baseMesh.material.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
            baseMesh.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
            baseMesh.material.reflectionTexture.level = 1;
            for (let i = 1; i < sceneMeshes.length; i++) {
                if(sceneMeshes[i].id !== "BaseMesh"){
                    baseMesh.material.reflectionTexture.renderList.push(sceneMeshes[i]);
                }
            }

            shadowGenerator.setDarkness(0.5);

        }
    );

       //beforeRender
    scene.registerBeforeRender(function () {
        //if key is down add rotation
        if (keyPresses.includes("a")) {
            rotationSpeedY += 0.0002;
        }
        if (keyPresses.includes("d")) {
            rotationSpeedY -= 0.0002;
        }


        rotationSpeedP /= 1.01;
        rotationSpeedY /= 1.01;
        rotationSpeedR /= 1.01;
        if (sceneMeshes) {
            sceneMeshes[0].rotation.x += rotationSpeedP;
            sceneMeshes[0].rotation.y += rotationSpeedY;
            sceneMeshes[0].rotation.z += rotationSpeedR;
        }
    });

    // Subtle Blue Light on the Right
    const blueLight = new BABYLON.PointLight("blueLight", new BABYLON.Vector3(3, 7, -3), scene);
    blueLight.diffuse = new BABYLON.Color3(0.6, 0.6, 1);
    blueLight.intensity = 110;

    // Warm Light on the Left
    const warmLight = new BABYLON.PointLight("warmLight", new BABYLON.Vector3(-3, 7, 3), scene);
    warmLight.diffuse = new BABYLON.Color3(1, 0.7, 0.7);
    warmLight.intensity = 110;

    // Main Light in the Middle
    const mainLight = new BABYLON.PointLight("mainLight", new BABYLON.Vector3(-2, 10, -2), scene);
    mainLight.intensity = 200;

    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = scene.clearColor;
    scene.fogStart = 11.0;
    scene.fogEnd = 16.0;

    // Return the created scene
    return scene;
};

let rotationSpeedP = 0;
let rotationSpeedY = 0;
let rotationSpeedR = 0;
let keyPresses = [];

window.addEventListener("keydown", (e) => {
        //add key to keyPresses if it isn't already added
        if (!keyPresses.includes(e.key)){
            keyPresses.push(e.key);
        }
});

window.addEventListener("keyup", (e) => {
    //remove key from keyPresses
    keyPresses = keyPresses.filter(key => key !== e.key);
});


const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});
