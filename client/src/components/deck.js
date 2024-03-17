

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
    for(let i = 0; i < 2; i++){
        newDeck.forEach(card => {
            card.container = null;
            card.miniCard = undefined;
            card.miniCardContainer = undefined;
            deck.push({...card});
        });
    }
    //shuffle
    for(let i = deck.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

export function drawCardFromDeckToHand(){
    if(deck.length > 0){
        hand.push(deck.pop());
    }
    
    setCardPositions();
    createCardGraphicsForHand();
}

export function pickFromCards(){
    //Choose three random cards from deck to display to play
    const cards = [];
    for(let i = 0; i < 3; i++){
        const randomNumber = Math.floor(Math.random() * deck.length);
        cards.push(deck[randomNumber]);
    }
    return cards;
}