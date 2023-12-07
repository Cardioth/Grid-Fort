import { currentScene } from "./sceneControl";
import { totalCredits } from "./credits";
import { returnBuildingToDeck } from "./cards";
import { unplaceBuilding, getHoveredBuilding, canPlaceBuildingNearest, placeBuilding, rotateBuilding } from "./buildingPlacement";
import { getHoveredCard, setCardPositions, removeCardFromHand } from "./cards";
import { cellSize } from "./config";
import { buttons } from "./graphics";
import { playerBoard } from "./setup";
import { hitTest } from "./utils";

export let selectedPlacedBuilding = null;
export let hoveredBuilding = null;
export let selectedBuilding = null;
export let selectedCard = null;
export let currentMouseX = 0;
export let currentMouseY = 0;

let hoveredCard = undefined;

export function setSelectedCard(card) {
    selectedCard = card;
}

export function initializeControls(canvas) {
    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        //Hovering over a card
        if (selectedCard === null) {
            hoveredCard = getHoveredCard(mouseX, mouseY);
        }
    
        //Drags a placed building
        if (currentScene === "build") {
            if (hoveredBuilding !== null && distanceDragged > 5 && selectedBuilding === null && hoveredBuilding.moveable === true) {
                unplaceBuilding(hoveredBuilding, playerBoard);
                selectedBuilding = hoveredBuilding;
                hoveredBuilding = null;
                selectedPlacedBuilding = null;
            }
            if (selectedCard === null) {
                if (getHoveredBuilding() && getHoveredBuilding().moveable === true) {
                    hoveredBuilding = getHoveredBuilding();
                    canvas.style.cursor = "grab";
                } else {
                    hoveredBuilding = null;
                }
                if (getHoveredBuilding() && getHoveredBuilding().moveable === false) {
                    canvas.style.cursor = "pointer";
                }
                if (!getHoveredBuilding() && hoveredCard === null && selectedBuilding === null) {
                    canvas.style.cursor = "default";
                }
            }
        }
    
        currentMouseX = mouseX;
        currentMouseY = mouseY;
    
        //Drag logic
        if (startDrag) {
            const deltaX = currentMouseX - startDragLocation.x;
            const deltaY = currentMouseY - startDragLocation.y;
            distanceDragged = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
    
        //HitTest Buttons
        buttons.forEach((button) => {
            if (hitTest(mouseX, mouseY, button)) {
                button.highlighted = true;
                canvas.style.cursor = "pointer";
            } else {
                button.highlighted = false;
            }
        });
    });
    let startDrag = false;
    let startDragLocation = { x: 0, y: 0 };
    let distanceDragged = 0;
    canvas.addEventListener('mousedown', function () {
        //HitTest Buttons
        buttons.forEach((button) => {
            if (hitTest(currentMouseX, currentMouseY, button)) {
                button.onClick();
            }
        });
        if (currentScene === "build") {
            if (hoveredCard !== undefined && hoveredCard.cost <= totalCredits) {
                selectedBuilding = hoveredCard;
                hoveredCard.isDragged = true;
                selectedCard = hoveredCard;
                //remove card from deck
                removeCardFromHand(selectedCard);
                setCardPositions();
            }
        }
    
        startDrag = true;
        startDragLocation.x = currentMouseX;
        startDragLocation.y = currentMouseY;
    });
    canvas.addEventListener('mouseup', function (event) {
    
        //Left Click
        if (event.button === 0) {
            if (selectedBuilding === null) {
                const clickedBuilding = getHoveredBuilding();
                if (clickedBuilding) {
                    selectedPlacedBuilding = clickedBuilding;
                } else {
                    selectedPlacedBuilding = null;
                }
            }
    
            //If there's a building selected try to place it
            if (selectedBuilding !== null) {
                // Place the selected shape on the grid
                const gridX = Math.floor((currentMouseX - playerBoard.xGridOffset) / cellSize - Math.floor(selectedBuilding.width / 2));
                const gridY = Math.floor((currentMouseY - playerBoard.yGridOffset) / cellSize - Math.floor(selectedBuilding.height / 2));
    
                let placementResult = canPlaceBuildingNearest(selectedBuilding, gridX, gridY);
                if (placementResult.canPlace) {
                    placeBuilding(selectedBuilding, currentMouseX + placementResult.adjustedX * cellSize, currentMouseY + placementResult.adjustedY * cellSize, playerBoard);
                    canvas.style.cursor = "default";
                } else {
                    returnBuildingToDeck();
                }
    
                selectedBuilding = null;
            }
    
            //If there's a selected card finish dragging it
            if (selectedCard !== null) {
                selectedCard.isDragged = false;
                selectedCard = null;
            }
            distanceDragged = 0;
            startDrag = false;
        }
    
    });
    document.addEventListener('keydown', function (event) {
        if (selectedBuilding) {
            if (event.key === 'Q' || event.key === 'q') {
                rotateBuilding(selectedBuilding, 'R');
            } else if (event.key === 'E' || event.key === 'e') {
                rotateBuilding(selectedBuilding, 'L');
            }
        }
    });
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // Prevent the default context menu
        if (selectedBuilding) {
            rotateBuilding(selectedBuilding, 'R');
        }
    });
}
