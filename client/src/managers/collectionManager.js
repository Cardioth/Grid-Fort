import { createCardFromData } from "./createCardFromData";

export let collection = [];

export function setCollection(newCollection){
    collection = [];
    newCollection.forEach(cardData => {
        collection.push(createCardFromData(cardData));
    });
}

export function resetCollection(){
    collection = [];
}