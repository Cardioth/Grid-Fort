

import allBuildings, { getRandomBuilding } from "../../../common/buildings";
import { hand } from "./cards";
import { setCardPositions, createCardGraphicsForHand } from "./cards";
import { selectedDeck } from "../ui/collectionGUI.js";
import { collection } from "../managers/collectionManager.js";

export const deck = [];

export function buildRandomDeck() {
    for(let i = 0; i < 30; i++){
        deck.push(getRandomBuilding());
    }
}

export function buildDeck(){
    const newDeck = collection.filter(obj => selectedDeck.deckCards.includes(obj.UID))
    newDeck.forEach(card => {
        card.container = null;
        card.miniCard = undefined;
        card.miniCardContainer = undefined;
        deck.push({...card});
    });
}

export function drawCardFromDeckToHand(){
    if(deck.length > 0){
        hand.push(deck.pop());
    }
    setCardPositions();
    createCardGraphicsForHand();
}

export function drawSpecificCardFromDeckToHand(cardUID, moveToCentre = false){
    const card = deck.find(obj => obj.UID === cardUID);
    if(card){
        hand.push(card);
        deck.splice(deck.indexOf(card), 1);
    }
    setCardPositions();
    if(moveToCentre){
        hand[hand.length-1].targetPosition = {x:0, y:0};
    }
    createCardGraphicsForHand();
}