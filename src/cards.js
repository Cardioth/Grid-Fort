import { currentScene } from "./sceneControl";
import { canvas } from "./setup";
import { updateTotalCredits } from "./credits";
import { circularizeGrids } from "./buildingPlacement";
import { currentMouseX, selectedCard, selectedBuilding, currentMouseY, setSelectedCard } from "./controls";

export let hand = [];

const cardWidth = 60;
const cardHeight = 90;

export function removeCardFromHand(selectedCard) {
    hand = hand.filter(card => card !== selectedCard);
}

export function updateCardAnimation(card) {
    if (card.isHovered) {
        // Set target size and position for hovered card
        card.rotation = 0;
        card.targetSize = { width: 130, height: 130 * 1.5 };
        card.targetPosition = { x: card.originalPosition.x, y: canvas.height - 130 };
    } else {
        // Reset to normal size and position when not hovered
        card.rotation = card.originalRotation;
        card.targetSize = { width: 60, height: 90 };
        card.targetPosition = card.originalPosition;
    }

    // Animate size
    card.currentSize.width = card.targetSize.width;
    card.currentSize.height = card.targetSize.height;

    // Animate position
    card.currentPosition.x += (card.targetPosition.x - card.currentPosition.x) * 0.06;
    card.currentPosition.y += (card.targetPosition.y - card.currentPosition.y) * 0.06;

}

export function setCardPositions() {
    let xCardOffset = canvas.width / 2; // Initial offset from left
    let yCardOffset = -30; // Initial offset from top
    const gap = 50 - hand.length * 2; // Gap between cards

    hand.forEach((buildingCard, index) => {
        // Calculate the initial position for each card
        const rotationAngle = (index + 0.5 - (hand.length / 2)) / 15;
        const arcStrength = -1; // Adjust this value to increase or decrease the curvature of the arc
        const xPosition = xCardOffset + (index + 0.5 - hand.length / 2) * gap;
        const distanceFromCenter = (index + 0.5 - hand.length / 2);
        const yPosition = canvas.height - cardHeight - yCardOffset - Math.pow(distanceFromCenter, 2) * arcStrength;

        buildingCard.originalPosition = { x: xPosition, y: yPosition };
        if (buildingCard.initialized === undefined) {
            buildingCard.currentPosition = { ...buildingCard.originalPosition };
            buildingCard.currentSize = { width: cardWidth, height: cardHeight }; // Initial size
            buildingCard.initialized = true;
        }
        buildingCard.targetSize = { ...buildingCard.currentSize };
        buildingCard.rotation = rotationAngle;
        buildingCard.originalRotation = rotationAngle;
        buildingCard.isHovered = false;
        buildingCard.isDragged = false;
    });
}

export function getHoveredCard(mouseX, mouseY) {
    const hoverWidthPercentage = 0.5; // Adjust this value to change the width of the hovered card area

    for (let i = 0; i < hand.length; i++) {
        const hoverWidth = hand[i].currentSize.width * hoverWidthPercentage;
        const minX = hand[i].currentPosition.x - hoverWidth / 2 - 12;
        const maxX = hand[i].currentPosition.x + hoverWidth / 2 - 12;
        const minY = canvas.height - cardHeight - 20;
        const maxY = canvas.height;

        if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
            for (let j = 0; j < hand.length; j++) {
                hand[j].isHovered = false;
            }
            hand[i].isHovered = true;
            if (currentScene === "build") {
                canvas.style.cursor = "grab";
            }
            return hand[i];
        } else {
            hand[i].isHovered = false;
            canvas.style.cursor = "default";
        }
    }
    return undefined;
}

export function returnBuildingToDeck() {
    const arrayIndex = Math.floor(((currentMouseX) / (canvas.width - 50)) * hand.length);
    if (selectedCard === null) {
        setSelectedCard(selectedBuilding);
    }
    hand.splice(arrayIndex, 0, selectedCard);
    setCardPositions();
    selectedCard.currentPosition.x = currentMouseX;
    selectedCard.currentPosition.y = currentMouseY;

    if (selectedBuilding.placed === true) {
        updateTotalCredits(selectedCard.cost);
        circularizeGrids();
        selectedBuilding.placed = false;
    }
}

