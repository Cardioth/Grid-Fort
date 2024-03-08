import * as GUI from "@babylonjs/gui";
import { getImage } from "../../graphics/loadImages.js";

export function createPanel(width, height, withWires = false){
    // Minimum width and height
    width = width < 353.74 ? 353.74 : width;
    height = height < 102.1976 ? 102.1976 : height;

    // Create container
    const container = new GUI.Rectangle();
    container.isHitTestVisible = false;
    container.width = width + "px";
    container.height = height + "px";
    container.thickness = 0;

    const topLeft = new GUI.Image("topLeft", getImage("panelSliced/panelSlicedTopLeft.png"));
    topLeft.width = "88.4412px";
    topLeft.height = "32.8477px";
    topLeft.left = 44.2206-(width/2)+"px";
    topLeft.top = 16.4238-(height/2)+"px";

    const topMiddle = new GUI.Image("topMiddle", getImage("panelSliced/panelSlicedTopMiddle.png"));
    topMiddle.width = width - 88.4412 - 189.3003 + "px";
    topMiddle.height = "32.8477px";
    topMiddle.left = (width - 88.4412 - 189.3003)/2 + 88.4412 -(width/2) + "px";
    topMiddle.top = 16.4238-(height/2)+"px";

    const topRight = new GUI.Image("topRight", getImage("panelSliced/panelSlicedTopRight.png"));
    topRight.width = "189.3003px";
    topRight.height = "32.8477px";
    topRight.left = width - (189.3003/2) -(width/2)-1 + "px";
    topRight.top = 16.4238-(height/2)+"px";

    const middleLeft = new GUI.Image("middleLeft", getImage("panelSliced/panelSlicedMiddleLeft.png"));
    middleLeft.width = "23.3333px";
    middleLeft.height = height - 32.8477 - 69.35 + "px";
    middleLeft.left = 11.6667-(width/2) + "px";
    middleLeft.top = (height - 32.8477 - 69.35)/2 + 32.8477-(height/2) + "px";
    
    const middleMiddle = new GUI.Image("middleMiddle", getImage("panelSliced/panelSlicedMiddleMiddle.png"));
    middleMiddle.width = width + "px";
    middleMiddle.height = height + "px";
    middleMiddle.left = "0px";
    middleMiddle.top = "0px";
    middleMiddle.zIndex = -1;

    const middleRight = new GUI.Image("middleRight", getImage("panelSliced/panelSlicedMiddleRight.png"));
    middleRight.width = "26.3447px";
    middleRight.height = height - 32.8477 - 69.35 + "px";
    middleRight.left = width - (26.3447/2)-(width/2)-1 + "px";
    middleRight.top = (height - 32.8477 - 69.35)/2 + 32.8477-(height/2) + "px";

    const bottomLeft = new GUI.Image("bottomLeft", getImage("panelSliced/panelSlicedBottomLeft.png"));
    bottomLeft.width = "181px";
    bottomLeft.height = "69.35px";
    bottomLeft.left = 90.5 -(width/2)+1 + "px";
    bottomLeft.top = height - (69.35/2)-(height/2)-1 + "px";

    const bottomMiddle = new GUI.Image("bottomMiddle", getImage("panelSliced/panelSlicedBottomMiddle.png"));
    bottomMiddle.width = width - 181 - 133.7447 + "px";
    bottomMiddle.height = "69.35px";
    bottomMiddle.left = (width - 181 - 133.7447)/2 + 181-(width/2) + "px";
    bottomMiddle.top = height - (69.35/2)-(height/2)-1 + "px";

    const bottomRight = new GUI.Image("bottomRight", getImage("panelSliced/panelSlicedBottomRight.png"));
    bottomRight.width = "133.7447px";
    bottomRight.height = "69.35px";
    bottomRight.left = width - (133.7447/2)-(width/2)-1 + "px";
    bottomRight.top = height - (69.35/2)-(height/2)-1 + "px";

    if(withWires){
        const wires = new GUI.Image("wires", getImage("wires.png"));
        wires.width = "109px";
        wires.height = "63px";
        wires.left = 54 -(width/2)+1 + "px";
        wires.top = height - (63/2)-(height/2)+10 + "px";
    }

    container.addControl(topLeft);
    container.addControl(topMiddle);
    container.addControl(topRight);
    container.addControl(middleLeft);
    container.addControl(middleMiddle);
    container.addControl(middleRight);
    container.addControl(bottomLeft);
    container.addControl(bottomMiddle);
    container.addControl(bottomRight);

    return container;
}