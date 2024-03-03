import * as GUI from "@babylonjs/gui";
import { GUITexture } from '../graphics/sceneInitialization.js';
import { socket } from "../network/connect.js";

export function createAdminPanel() {
    // Create container
    const container = new GUI.Rectangle();
    container.width = "600px";
    container.height = "40px";
    container.top = "200px";
    container.thickness = 0;

    // Create Console Input
    const consoleInput = new GUI.InputText();
    consoleInput.width = "400px";
    consoleInput.height = "40px";
    consoleInput.color = "white";
    consoleInput.fontSize = 25;
    consoleInput.fontFamily = "GemunuLibre-Medium";
    consoleInput.left = "-50px";
    consoleInput.thickness = 0;
    consoleInput.background = "black";
    container.addControl(consoleInput);

    // Create console submit button
    const consoleSubmit = GUI.Button.CreateSimpleButton("consoleSubmit", "Submit");
    consoleSubmit.width = "100px";
    consoleSubmit.height = "40px";
    consoleSubmit.color = "white";
    consoleSubmit.fontSize = 25;
    consoleSubmit.fontFamily = "GemunuLibre-Medium";
    consoleSubmit.left = "220px";
    consoleSubmit.thickness = 0;
    consoleSubmit.background = "black";
    consoleSubmit.onPointerClickObservable.add(() => {
        socket.emit("consoleCommand", consoleInput.text);
        consoleInput.text = "";
    });
    consoleInput.onKeyboardEventProcessedObservable.add((eventData) => {
        if(eventData.key === "Enter"){
            socket.emit("consoleCommand", consoleInput.text);
            consoleInput.text = "";
        }
    });

    container.addControl(consoleSubmit);

    GUITexture.addControl(container);
}
