import * as BABYLON from '@babylonjs/core';
import { scene, canvas } from '../graphics/initScene.js';

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
        
        void main() {
            // Grid control variables
            float gridScale = 20.0; // The scale of the grid
            float lineThickness = 0.05; // The thickness of the grid lines
            
            // Calculate grid line strength based on UV coordinates
            vec2 grid = abs(fract(vUV * gridScale - 0.5) - 0.5);
            float lineStrength = smoothstep(0.0, lineThickness, grid.x) * smoothstep(0.0, lineThickness, grid.y);

            float shimmerValue = sin((vUV.y + vUV.x) * 4.0 + time*-1.5) * 0.3 + 0.5;
            shimmerValue = max(shimmerValue, 0.2);

            gl_FragColor = vec4(1.0, 1.0, 1.0, (0.5 - lineStrength) * shimmerValue);
            
        }     
    `;

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "shader", 
        scene, 
        'custom',   
        { 
            attributes: ["position", "uv", "time"], 
            uniforms: ["worldViewProjection"]
        }
    );

    shaderMaterial.alpha = 0; // Set global alpha for the material, can be adjusted as needed

    // Enable blending for transparency
    shaderMaterial.blendMode = BABYLON.Engine.ALPHA_COMBINE;
    shaderMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE; // Sets the alpha mode to combine the colors based on alpha value

    
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector2("resolution", new BABYLON.Vector2(canvas.width, canvas.height));

    return shaderMaterial;
}