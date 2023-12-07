import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');

// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true);

// CreateScene function that creates and returns the scene
const createScene = () => {
    // Create a basic BJS Scene object
    const scene = new BABYLON.Scene(engine);

    let orthoSize = 5;
    let aspectRatio = canvas.width / canvas.height; // Aspect ratio from canvas dimensions
    let orthoTop = orthoSize;
    let orthoBottom = -orthoSize;
    let orthoLeft = -orthoSize * aspectRatio;
    let orthoRight = orthoSize * aspectRatio;
    
    const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 10, -10), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
    camera.setTarget(BABYLON.Vector3.Zero());

    BABYLON.SceneLoader.ImportMesh(
        undefined, // Name of meshes to load, undefined to load all meshes
        "./KhronosGroup/", // Path to the folder where your GLTF file is located
        "DamagedHelmet.gltf", // Name of your GLTF file
        scene, // Your Babylon.js scene
        function (meshes, particleSystems, skeletons, animationGroups) {
            meshes[0].rotation.y = Math.PI;
            meshes.forEach(mesh => {
                mesh.scaling = new BABYLON.Vector3(2,2,2);
            });
        }
    );
    
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

    // Return the created scene
    return scene;
};

// call the createScene function
const scene = createScene();

// run the render loop
engine.runRenderLoop(() => {
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});
