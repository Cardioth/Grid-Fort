import * as BABYLON from '@babylonjs/core';
import { scene, canvas } from '../graphics/sceneInitialization.js';
import { gridHeight, gridWidth } from '../data/config.js';
import { playerBoard } from "../managers/gameSetup.js";

let resolution; 
let ctx;
let gridMaskTexture;
let shaderMaterial;

export function getShaderMaterial() {
    BABYLON.Effect.ShadersStore['customVertexShader'] = `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUV;
        uniform mat4 worldViewProjection;
        
        void main(void) {
            vUV = uv;
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
    `;

    BABYLON.Effect.ShadersStore['customFragmentShader'] = `
        precision highp float;
        varying vec2 vUV;
        uniform float time;
        uniform sampler2D gridMaskTexture;
        uniform float gridWidth;
        
        void main() {
            // Grid control variables
            float gridScale = gridWidth; // The scale of the grid
            float lineThickness = 0.06; // The thickness of the grid lines
            
            // Calculate grid line strength based on UV coordinates
            vec2 grid = abs(fract(vUV * gridScale - 0.5) - 0.5);
            float lineStrength = smoothstep(0.0, lineThickness, grid.x) * smoothstep(0.0, lineThickness, grid.y);
            float cellShadow = step(0.9, texture2D(gridMaskTexture, vUV).r);

            // Shimmer effect
            float shimmerValue = sin((vUV.y + vUV.x/2.0) * 9.0 + time*1.0) * 0.3 + 0.5;
            shimmerValue = max(shimmerValue, 0.1);

            float red = (0.8 * shimmerValue * 2.0 * vUV.x);
            float green = (1.0 * shimmerValue);
            float blue = (1.0);
            float alpha = (0.7 - lineStrength) * shimmerValue;
        
            // Calculate cellShadow mix value
            float shadowMix = smoothstep(0.1, 0.0, cellShadow);
        
            // Blend the cellShadow with the current color
            vec4 shadowColor = vec4(0.0, 0.0, 0.0, 0.2); // Shadow color (black with some alpha)
            vec4 gridColor = vec4(red, green, blue, alpha);
            vec4 finalColor = mix(gridColor, shadowColor, shadowMix);
        
            gl_FragColor = finalColor;
        }
        
    `;

    shaderMaterial = new BABYLON.ShaderMaterial(
        "shader", 
        scene, 
        'custom',   
        { 
            attributes: ["position", "uv"], 
            uniforms: ["worldViewProjection", "time", "gridMaskTexture", "gridWidth"]
        }
    );

    // Set grid width uniform
    shaderMaterial.setFloat("gridWidth", gridWidth);

    // Create grid mask texture
    const gridMaskTexture = createGridTexture();
    shaderMaterial.setTexture("gridMaskTexture", gridMaskTexture);

    shaderMaterial.alpha = 0;

    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector2("resolution", new BABYLON.Vector2(canvas.width, canvas.height));

    return shaderMaterial;
}

function createGridTexture() {
    // Create grid mask texture
    resolution = 1000;

    gridMaskTexture = new BABYLON.DynamicTexture("gridMaskTexture", {width:resolution, height:resolution}, scene, false);
    ctx = gridMaskTexture.getContext();

    // Set constants
    drawGridTexture(resolution, ctx, gridMaskTexture);
    return gridMaskTexture;
}

export function drawGridTexture() {
    const cellSizeX = resolution / gridWidth;
    const cellSizeY = resolution / gridHeight;

    const bleed = 2;

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, resolution, resolution);

    //Loop through player board grid and draw cells
    for (let i = 0; i < playerBoard.grid.length; i++) {
        const cell = playerBoard.grid[i];
        if (!cell.occupied) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cell.x * cellSizeX - bleed, cell.y * cellSizeY - bleed, cellSizeX + bleed * 2, cellSizeY + bleed * 2);
        }
    }

    gridMaskTexture.update();
    shaderMaterial.setTexture("gridMaskTexture", gridMaskTexture);
}

