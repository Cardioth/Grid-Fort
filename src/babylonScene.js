import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // If you need to import any loaders

// Get the canvas DOM element
const canvas = document.getElementById('renderCanvas');

// Load the 3D engine
const engine = new BABYLON.Engine(canvas, true);

let helmetMesh;
let box;

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
    
    const camera = new BABYLON.FreeCamera("orthoCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = orthoTop;
    camera.orthoBottom = orthoBottom;
    camera.orthoLeft = orthoLeft;
    camera.orthoRight = orthoRight;
    camera.setTarget(BABYLON.Vector3.Zero());

    BABYLON.SceneLoader.ImportMesh(
        undefined, // Name of meshes to load, undefined to load all meshes
        "./models/", // Path to the folder where your GLTF file is located
        "DamagedHelmet.gltf", // Name of your GLTF file
        scene, // Your Babylon.js scene
        function (meshes, particleSystems, skeletons, animationGroups) {
            helmetMesh = meshes;
            meshes.forEach(mesh => {
                mesh.scaling = new BABYLON.Vector3(2,2,2);
            });
        }
    );

    //Create a cube
    box = BABYLON.MeshBuilder.CreateBox('box', { size:  8 }, scene);
    //wireframe the cube
    box.enableEdgesRendering();
    box.edgesWidth = 4.0;
    box.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

    //only show the wireframe
    box.material = new BABYLON.StandardMaterial("mat", scene);
    box.material.wireframe = true;
    


    
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

    // Return the created scene
    return scene;
};

let rotationSpeed = 0.05; // Adjust rotation speed as needed

window.addEventListener("keydown", (e) => {
        if (!box.rotationQuaternion) {
            box.rotationQuaternion = BABYLON.Quaternion.Identity();
        }

        // PITCH (Nose Up/Down)
        if (e.key === "w" || e.key === "s") {
            let pitchDirection = e.key === "w" ? -1 : 1;
            box.addRotation(pitchDirection * rotationSpeed, 0, 0);
            //rotate the helmet
            helmetMesh.forEach(mesh => {
                mesh.addRotation(pitchDirection * rotationSpeed, 0, 0);
            });
        }

        // YAW (Turn Left/Right)
        if (e.key === "a" || e.key === "d") {
            let yawDirection = e.key === "a" ? -1 : 1;
            box.addRotation(0, yawDirection * rotationSpeed, 0);
            //rotate helmet
            helmetMesh.forEach(mesh => {
                mesh.addRotation(0, yawDirection * rotationSpeed, 0);
            });
        }

        // ROLL (Tilt Left/Right)
        if (e.key === "q" || e.key === "e") {
            let rollDirection = e.key === "q" ? -1 : 1;
            box.addRotation(0, 0, rollDirection * rotationSpeed);
            //rotate helmet
            helmetMesh.forEach(mesh => {
                mesh.addRotation(0, 0, rollDirection * rotationSpeed);
            });
        }
});



const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', () => {
    engine.resize();
});
