import { currentScene } from "./sceneManager";
import { availableCredits } from "../gameplay/credits";
import { returnSelectedBuildingToDeck, setAnchorRotationAdjustment } from "../gameplay/buildingPlacement";
import { unplaceBuilding, canPlaceBuildingNearest, placeBuilding, rotateBuilding } from "../gameplay/buildingPlacement";
import { getHoveredBuilding, getHoveredLootBox } from "../utilities/utils";
import { getHoveredCard, setCardPositions, removeCardFromHand } from "../components/cards";
import { playerBoard } from "./gameSetup";
import { setZoomTarget } from "../graphics/renderLoop";
import { getPointerGridLocation } from '../utilities/utils';
import { updateBuildingGraphicPosition } from '../gameplay/buildingPlacement';
import { GUI3Dscene, GUIscene, engine } from "../graphics/sceneInitialization";
import { createBuildingGraphicFromCard } from "../gameplay/buildingPlacement";
import { displayBuildingInfo } from "../ui/gameGUI";
import { createLootBoxImplosionParticleSystem } from "../graphics/particleEffects/createLootBoxImplosion";
import { createLootReward } from "../graphics/lootRewardGraphic";
import { fadeInContinueButton } from "../ui/endGameGUI";
import { createAlertMessage } from "../ui/uiElements/createAlertMessage";

export let selectedPlacedBuilding = null;
export let hoveredBuilding = null;
export let selectedBuilding = null;
export let selectedCard = null;
export let currentMouseX = 0;
export let currentMouseY = 0;

export let hoveredCard = undefined;

export function setSelectedCard(card) {
    selectedCard = card;
}

export function initializeGameControls(canvas) {
    
    //Mouse Scroll Listener
    let zoomTarget = 3;
    canvas.addEventListener('wheel', function (event) {
        event.preventDefault();
        if(currentScene === "build"){
            zoomTarget += event.deltaY < 0 ? -0.5 : (event.deltaY > 0 ? 0.5 : 0);
            zoomTarget = Math.max(1, Math.min(zoomTarget, 3));
            setZoomTarget(zoomTarget);
        }
    });

    canvas.addEventListener('pointermove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        //Hovering over a card
        if (selectedCard === null && (currentScene === "build" || currentScene === "battleCountdown"  || currentScene === "battle")) {            
            hoveredCard = getHoveredCard(mouseX, mouseY);
        }

        if (selectedBuilding !== null) {
            updateBuildingGraphicPosition(selectedBuilding);
        }

        //Drags a placed building
        if (currentScene === "build") {
            if (hoveredBuilding !== null && distanceDragged > 5 && selectedBuilding === null && hoveredBuilding.moveable === true) {
                unplaceBuilding(hoveredBuilding, playerBoard);
                selectedBuilding = hoveredBuilding;
                hoveredBuilding = null;
            }
            if (selectedCard === null) {
                hoveredBuilding = getHoveredBuilding();
                if (hoveredBuilding) {
                    if(hoveredBuilding.moveable === true){
                        canvas.style.cursor = "grab";
                    } else {
                        canvas.style.cursor = "pointer";
                    }
                } else {
                    hoveredBuilding = null;
                }
            }
            if (hoveredBuilding !== null && distanceDragged > 5 && selectedBuilding === null && hoveredBuilding.moveable === false) {
                canvas.style.cursor = "not-allowed";
            }
        }

        if (currentScene === "battleCountdown" || currentScene === "battle"){
            if (selectedCard === null) {
                hoveredBuilding = getHoveredBuilding();
                if (hoveredBuilding) {
                    canvas.style.cursor = "pointer";
                } else {
                    hoveredBuilding = null;
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
        if(event.button === 0){
            if (currentScene === "build") {
                //Clicking a card in hand
                if (hoveredCard !== null && hoveredCard.cost <= availableCredits && hoveredCard.container) {
                    selectedBuilding = hoveredCard;
                    hoveredCard.isDragged = true;
                    hoveredCard.container.isVisible = false;
                    createBuildingGraphicFromCard(hoveredCard, playerBoard, "N");
                    selectedCard = hoveredCard;
                    //remove card from deck
                    removeCardFromHand(selectedCard);
                    setCardPositions();
                    setAnchorRotationAdjustment(selectedBuilding);
                } else if (hoveredCard !== null && hoveredCard.cost > availableCredits) {
                    createAlertMessage("Not enough credits", null, 30, true);
                }
            }
            startDrag = true;
            startDragLocation.x = currentMouseX;
            startDragLocation.y = currentMouseY;
        }

    });

    canvas.addEventListener('pointerup', function (event) {
        if (event.button === 0) {
            //Building Selecting
            if (selectedBuilding === null && (currentScene === "build" || currentScene === "battleCountdown" || currentScene === "battle")) {
                const clickedBuilding = getHoveredBuilding();
                if (clickedBuilding) {
                    selectedPlacedBuilding = clickedBuilding;
                    displayBuildingInfo(clickedBuilding);
                } else {
                    selectedPlacedBuilding = null;
                    displayBuildingInfo(null);
                }
            }

            if(currentScene === "endGame" || currentScene === "menu"){
                const clickedLootBox = getHoveredLootBox();
                if(clickedLootBox && clickedLootBox.pickedAnimation.isPlaying === false){
                    const parent = clickedLootBox.parent.parent;
                    clickedLootBox.pickedAnimation.play();
                    createLootBoxImplosionParticleSystem(clickedLootBox.absolutePosition);
                    setTimeout(() => {
                        parent.dispose();
                        createLootReward(clickedLootBox.reward, clickedLootBox.absolutePosition);
                        GUI3Dscene.lootBoxes.splice(GUI3Dscene.lootBoxes.indexOf(parent), 1);
                        if(GUI3Dscene.lootBoxes.length === 0){
                            fadeInContinueButton(GUIscene.continueButtonEndGame);
                        }
                    }, 3200);
                }
            }

            //If there's a building selected try to place it
            if (selectedBuilding !== null) {
                // Place the selected shape on the grid
                const gridX = getPointerGridLocation().x+(selectedBuilding.rotationAdjustment.x*4);
                const gridY = getPointerGridLocation().y-(selectedBuilding.rotationAdjustment.y*4);

                if(gridX !== null && gridY !== null){
                    let placementResult = canPlaceBuildingNearest(selectedBuilding, gridX, gridY);
                    if (placementResult.canPlace) {
                        placeBuilding(selectedBuilding, gridX + placementResult.adjustedX, gridY + placementResult.adjustedY, playerBoard);
                    } else {
                        returnSelectedBuildingToDeck();
                    }
                } else {
                    returnSelectedBuildingToDeck();
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
                updateBuildingGraphicPosition(selectedBuilding);
            } else if (event.key === 'E' || event.key === 'e') {
                rotateBuilding(selectedBuilding, 'L');
                updateBuildingGraphicPosition(selectedBuilding);
            }
        }
    });
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // Prevent the default context menu
        if (selectedBuilding) {
            rotateBuilding(selectedBuilding, 'R');
        }
    });
    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
        engine.resize();
    });
}

export function setSelectedPlacedBuilding(building) {
    selectedPlacedBuilding = building;
}