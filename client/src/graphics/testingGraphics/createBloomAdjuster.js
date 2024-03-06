import * as GUI from '@babylonjs/gui';
import { GUITexture } from '../sceneInitialization.js';


export function createBloomAdjuster(bloomPipeline) {
    const thresholdSlider = new GUI.Slider();
    thresholdSlider.minimum = 0;
    thresholdSlider.maximum = 1;
    thresholdSlider.top = "-200px";
    thresholdSlider.value = bloomPipeline.bloomThreshold;
    thresholdSlider.height = "20px";
    thresholdSlider.width = "200px";
    thresholdSlider.onValueChangedObservable.add(function (value) {
        bloomPipeline.bloomThreshold = value;
        console.log('threshold: ' + value);
    });
    GUITexture.addControl(thresholdSlider);

    // Bloom Weight
    const weightSlider = new GUI.Slider();
    weightSlider.minimum = 0;
    weightSlider.maximum = 1;
    weightSlider.top = "-150px";
    weightSlider.value = bloomPipeline.bloomWeight;
    weightSlider.height = "20px";
    weightSlider.width = "200px";
    weightSlider.onValueChangedObservable.add(function (value) {
        bloomPipeline.bloomWeight = value;
        console.log('weight: ' + value);
    });
    GUITexture.addControl(weightSlider);

    // Bloom Kernel
    const kernelSlider = new GUI.Slider();
    kernelSlider.minimum = 1;
    kernelSlider.maximum = 100;
    kernelSlider.top = "-100px";
    kernelSlider.value = bloomPipeline.bloomKernel;
    kernelSlider.height = "20px";
    kernelSlider.width = "200px";
    kernelSlider.onValueChangedObservable.add(function (value) {
        bloomPipeline.bloomKernel = value;
        console.log('kernel: ' + value);
    });
    GUITexture.addControl(kernelSlider);

    // Bloom Scale
    const scaleSlider = new GUI.Slider();
    scaleSlider.minimum = 0;
    scaleSlider.maximum = 2;
    scaleSlider.top = "-50px";
    scaleSlider.value = bloomPipeline.bloomScale;
    scaleSlider.height = "20px";
    scaleSlider.width = "200px";
    scaleSlider.onValueChangedObservable.add(function (value) {
        bloomPipeline.bloomScale = value;
        console.log('scale: ' + value);
    });
    GUITexture.addControl(scaleSlider);
}
