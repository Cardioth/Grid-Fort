

import allBuildings, { getRandomBuilding } from "./buildings";
import { hand } from "./cards";
import { setCardPositions, createCardGraphicsForHand } from "./cards";

export const deck = [];

export function buildRandomDeck() {
    for(let i = 0; i < 30; i++){
        deck.push(getRandomBuilding());
    }
}

export function drawCardFromDeckToHand(){
    if(deck.length > 0){
        hand.push(deck.pop());
    }
    //hand.push(allBuildings.miniArty);

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