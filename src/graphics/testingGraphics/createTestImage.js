import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { getImage } from "../loadImages.js";
import { GUITexture, GUIscene, scene } from "../sceneInitialization.js";
import { applyTintToGuiImage } from "./tintingTexture.js";

export function createTestImage(){

    var myGuiImage = new GUI.Image("but", getImage("endBattleBacking.png"));
    GUITexture.addControl(myGuiImage);

    // Apply tint to the GUI image
    applyTintToGuiImage(getImage("endBattleBacking.png"), myGuiImage, 250, 0, 0);

}
