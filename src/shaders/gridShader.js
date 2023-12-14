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
        
        void main(void) {
            gl_FragColor = vec4(vUV, 0.0, 1.0); // This should display a gradient based on the UVs
        }
        
    `;

    const shaderMaterial = new BABYLON.ShaderMaterial(
        "shader", 
        scene, 
        'custom',   
        { 
            attributes: ["position", "uv"], 
            uniforms: ["worldViewProjection"]
        }
    );
    
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector2("resolution", new BABYLON.Vector2(canvas.width, canvas.height));

    return shaderMaterial;
}