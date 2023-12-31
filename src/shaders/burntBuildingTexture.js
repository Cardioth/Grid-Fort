import * as BABYLON from '@babylonjs/core';
import { scene } from '../graphics/sceneInitialization.js';

export function getBurntBuildingMaterial(originalTexture) {
    // Vertex Shader
    BABYLON.Effect.ShadersStore['burntVertexShader'] = `
        precision highp float;

        // Attributes
        attribute vec3 position;
        attribute vec2 uv;

        // Uniforms
        uniform mat4 worldViewProjection;

        // Varying
        varying vec2 vUV;

        void main() {
            gl_Position = worldViewProjection * vec4(position, 1.0);
            vUV = uv;
        }
    `;

    // Fragment Shader
    BABYLON.Effect.ShadersStore['burntFragmentShader'] = `
        precision highp float;

        // Varying
        varying vec2 vUV;

        // Uniforms
        uniform sampler2D originalTexture;

        void main() {
            vec4 texel = texture2D(originalTexture, vUV);
            float burnFactor = 0.5; // Adjust this value to control the darkness
            gl_FragColor = vec4(texel.rgb * burnFactor, texel.a);
        }
    `;

    let shaderMaterial = new BABYLON.ShaderMaterial(
        "shader", 
        scene, 
        'burnt',   
        {
            attributes: ["position", "uv"], 
            uniforms: ["worldViewProjection", "originalTexture"]
        }
    );

    // Set the texture and other properties
    shaderMaterial.setTexture("originalTexture", originalTexture);
    shaderMaterial.alpha = 0.99;
    shaderMaterial.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

    return shaderMaterial;
}
