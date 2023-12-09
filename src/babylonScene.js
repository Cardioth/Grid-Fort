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
            console.log(helmetMesh);
            meshes.forEach(mesh => {
                mesh.scaling = new BABYLON.Vector3(2,2,2);
                mesh.rotation = new BABYLON.Vector3(0, 0, 0);
            });
        }
    );

    //beforeRender
    scene.registerBeforeRender(function () {
        //if key is down add rotation
        if (keyPresses.includes("w")) {
            rotationSpeedP += 0.001;
        }
        if (keyPresses.includes("s")) {
            rotationSpeedP -= 0.001;
        }
        if (keyPresses.includes("a")) {
            rotationSpeedY += 0.001;
        }
        if (keyPresses.includes("d")) {
            rotationSpeedY -= 0.001;
        }
        if (keyPresses.includes("q")) {
            rotationSpeedR += 0.001;
        }
        if (keyPresses.includes("e")) {
            rotationSpeedR -= 0.001;
        }


        rotationSpeedP /= 1.01;
        rotationSpeedY /= 1.01;
        rotationSpeedR /= 1.01;
        if (helmetMesh) {
            helmetMesh[0].rotation.x += rotationSpeedP;
            helmetMesh[0].rotation.y += rotationSpeedY;
            helmetMesh[0].rotation.z += rotationSpeedR;
            box.rotation.x += rotationSpeedP;
            box.rotation.y += rotationSpeedY;
            box.rotation.z += rotationSpeedR;
        }
    });
    

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
