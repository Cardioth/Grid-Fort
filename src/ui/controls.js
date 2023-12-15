import { currentScene } from "../managers/sceneControl";
import { totalCredits } from "../gameplay/credits";
import { returnBuildingToDeck } from "../components/cards";
import { unplaceBuilding, getHoveredBuilding, canPlaceBuildingNearest, placeBuilding, rotateBuilding, cloneBuilding } from "../gameplay/buildingPlacement";
import { getHoveredCard, setCardPositions, removeCardFromHand } from "../components/cards";
import { cellSize } from "../data/config";
import { playerBoard } from "../managers/setup";
import { setZoomTarget } from "../graphics/graphics";
import { getPointerGridLocation } from '../utilities/utils';
import { updateBuildingGraphicPosition } from '../gameplay/buildingPlacement';



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
    //Mouse Scroll Listener

    let zoomTarget = 1;
    canvas.addEventListener('wheel', function (event) {
        event.preventDefault();
        zoomTarget += event.deltaY < 0 ? -0.5 : (event.deltaY > 0 ? 0.5 : 0);
        zoomTarget = Math.max(1, Math.min(zoomTarget, 3));
        setZoomTarget(zoomTarget);
    });

    canvas.addEventListener('pointermove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        //Hovering over a card
        if (selectedCard === null) {            
            hoveredCard = getHoveredCard(mouseX, mouseY);
        } else {
            updateBuildingGraphicPosition(mouseX, mouseY);
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
    });

    let startDrag = false;
    let startDragLocation = { x: 0, y: 0 };
    let distanceDragged = 0;

    
    canvas.addEventListener('pointerdown', function (event) {
        if (currentScene === "build") {
            if (hoveredCard !== null && hoveredCard.cost <= totalCredits) {
                selectedBuilding = hoveredCard;
                hoveredCard.isDragged = true;
                hoveredCard.container.isVisible = false;

                //Create a building graphic to drag around
                hoveredCard.buildingGraphic = cloneBuilding("energyBuilding", 0, 0, 0);
                hoveredCard.buildingGraphic.isDragged = true;
                hoveredCard.buildingGraphic.setEnabled(false);

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

    canvas.addEventListener('pointerup', function (event) {
        if (event.button === 0) {
            //Builing Selecting
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
                const gridX = getPointerGridLocation(currentMouseX, currentMouseY).x;
                const gridY = getPointerGridLocation(currentMouseX, currentMouseY).y;

                if(gridX !== null && gridY !== null){
                    let placementResult = canPlaceBuildingNearest(selectedBuilding, gridX, gridY);
                    if (placementResult.canPlace) {
                        placeBuilding(selectedBuilding, gridX + placementResult.adjustedX, gridY + placementResult.adjustedY, playerBoard);
                        canvas.style.cursor = "default";
                    } else {
                        returnBuildingToDeck();
                    }
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
