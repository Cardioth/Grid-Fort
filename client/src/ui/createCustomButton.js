import * as GUI from "@babylonjs/gui";
import { getImage } from "../graphics/loadImages.js";


export function createCustomButton(text, functionToCall) {
    // Create container
    const container = new GUI.Rectangle();
    container.thickness = 0;
    container.width = "134px";
    container.height = "33px";

    // Create Button
    const buttonGraphic = new GUI.Image("emptyButton", getImage("emptyButton.png"));
    buttonGraphic.width = "134px";
    buttonGraphic.height = "33px";
    container.addControl(buttonGraphic);

    // Create Button Text
    const buttonText = new GUI.TextBlock();
    buttonText.width = "134px";
    buttonText.height = "33px";
    buttonText.text = text;
    buttonText.color = "white";
    buttonText.fontSize = 20;
    buttonText.fontFamily = "GemunuLibre-Medium";
    container.addControl(buttonText);

    container.onPointerClickObservable.add(() => {
        document.body.style.cursor = 'default';
        functionToCall();
    });
    container.onPointerEnterObservable.add(function () {
        document.body.style.cursor = 'pointer';
    });
    container.onPointerOutObservable.add(function () {
        document.body.style.cursor = 'default';
    });

    return container;
}
