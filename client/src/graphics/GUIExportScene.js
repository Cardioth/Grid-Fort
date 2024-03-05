import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createCardGraphic } from './createCardGraphic';

const exportCanvas = document.createElement('canvas');
exportCanvas.width = 620;
exportCanvas.height = 950;

const exportEngine = new BABYLON.Engine(exportCanvas, true, { antialias: true });

const GUIExportScene = new BABYLON.Scene(exportEngine);
GUIExportScene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

const GUIExportCamera = new BABYLON.FreeCamera("GUIcamera", new BABYLON.Vector3(0, 5, 0), GUIExportScene);
GUIExportCamera.setTarget(new BABYLON.Vector3(0, 0, 0));

const GUIExportTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("exportImage", true, GUIExportScene);

export function exportCardPNG(card) {
    const cardGraphic = createCardGraphic(card);
    cardGraphic.scaleX = 1;
    cardGraphic.scaleY = 1;
    cardGraphic.left = "0px";
    cardGraphic.top = "0px";
    GUIExportTexture.addControl(cardGraphic);

    exportEngine.runRenderLoop(() => {
        GUIExportScene.render();
    });

    setTimeout(() => {
        const dataURL = exportCanvas.toDataURL();
        downloadCanvasAsPNG(dataURL, `${card.name}.png`);
        exportEngine.stopRenderLoop();
        GUIExportTexture.removeControl(cardGraphic);
    }, 100);
}


function downloadCanvasAsPNG(dataURL, filename) {
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = filename || 'canvas-image.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
