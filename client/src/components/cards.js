import { currentScene } from "../managers/sceneManager";
import { GUITexture, canvas } from "../graphics/sceneInitialization";
import { createCardGraphic } from "../graphics/createCardGraphic";
import * as GUI from "@babylonjs/gui";

export let hand = [];

export function removeCardFromHand(selectedCard) {
    hand = hand.filter(card => card !== selectedCard);
}

export function clearHand() {
    hand = [];
}

export function updateCardAnimation() {
    hand.forEach(card => {
        if (card.container !== undefined) {
            if (card.isHovered) {
                // Set target size and position for hovered card
                card.rotationAsCard = 0;
                card.container.scaleX = .5;
                card.container.scaleY = .5;
                card.targetPosition = { x: card.originalPosition.x, y: 200};
                card.zIndex = 200;
            } else {
                // Reset to normal size and position when not hovered
                card.rotationAsCard = card.originalRotation;
                card.container.scaleX = .3;
                card.container.scaleY = .3;
                card.targetPosition = { x: card.originalPosition.x, y: card.originalPosition.y };
                card.zIndex = card.originalZIndex;
            }
            // Animate position
            card.currentPosition.x += (card.targetPosition.x - card.currentPosition.x) * 0.05;
            card.currentPosition.y += (card.targetPosition.y - card.currentPosition.y) * 0.05;

            // If the current position is close to the target position, snap to it
            if (Math.abs(card.targetPosition.x - card.currentPosition.x) < 1) {
                card.currentPosition.x = card.targetPosition.x;
            }
            if (Math.abs(card.targetPosition.y - card.currentPosition.y) < 1) {
                card.currentPosition.y = card.targetPosition.y;
            }

            // Update container to card
            card.container.top = card.currentPosition.y;
            card.container.left = card.currentPosition.x;
            card.container.rotation = card.rotationAsCard;
            card.container.zIndex = card.zIndex;
        }
    });
}

export function setCardPositions() {
    let yCardOffset = 350; // Initial offset from middle
    const gap = 100 - hand.length * 2; // Gap between cards

    hand.forEach((buildingCard, index) => {
        // Calculate the initial position for each card
        const rotationAngle = (index + 0.5 - (hand.length / 2)) / 10;
        const arcStrength = -2; // Adjust this value to increase or decrease the curvature of the arc
        const xPosition = (index + 0.5 - hand.length / 2) * gap;
        const distanceFromCenter = (index + 0.5 - hand.length / 2);
        const yPosition = yCardOffset - Math.pow(distanceFromCenter, 2) * arcStrength;
        buildingCard.originalPosition = { x: xPosition, y: yPosition };
        if (buildingCard.initialized === undefined) {
            buildingCard.currentPosition = {x:0, y:0};//{ ...buildingCard.originalPosition };
            buildingCard.initialized = true;
        }
        buildingCard.targetSize = { ...buildingCard.currentSize };
        buildingCard.rotationAsCard = rotationAngle;
        buildingCard.originalRotation = rotationAngle;
        buildingCard.isHovered = false;
        buildingCard.isDragged = false;
        buildingCard.zIndex = index+100;
        buildingCard.originalZIndex = index;
    });
}

export function getHoveredCard(mouseX, mouseY) {
    for (let i = 0; i < hand.length; i++) {
        const hoverWidth = 70;
        const minX = hand[i].currentPosition.x - hoverWidth + canvas.width / 2;
        const maxX = hand[i].currentPosition.x + hoverWidth + canvas.width / 2;
        const minY = canvas.height - canvas.height / 4;
        const maxY = canvas.height;        
        if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
            for (let j = 0; j < hand.length; j++) {
                hand[j].isHovered = false;
            }
            hand[i].isHovered = true;
            return hand[i];
        } else {
            hand[i].isHovered = false;
        }
    }
    return null;
}

export function createCardGraphicsForHand(){
    hand.forEach(card => {
        if(card.container === undefined || card.container === null){
            const cardGraphic = createCardGraphic(card);
            GUITexture.addControl(cardGraphic);
        }
    });
}