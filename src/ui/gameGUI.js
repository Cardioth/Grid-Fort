import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';

export function createSelectionLine(mesh) {
    var line = new GUI.MultiLine();
    line.add({ x: 800, y: 50 }, mesh);
    line.lineWidth = 3;
    line.dash = [4, 7];
    line.color = "white";
    GUITexture.addControl(line);

    var rect1 = new GUI.Rectangle();
    rect1.width = "20px";
    rect1.height = "20px";
    rect1.cornerRadius = 5;
    rect1.color = "White";
    rect1.thickness = 2;
    GUITexture.addControl(rect1);
    rect1.linkWithMesh(mesh);
}