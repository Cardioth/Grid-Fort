

import { getRandomBuilding } from "./buildings";

export const deck = [];

export function buildRandomDeck() {
    for(let i = 0; i < 30; i++){
        deck.push(getRandomBuilding());
    }
    console.log(deck);
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