import { createCardFromData } from "./createCardFromData";

export let collection = [];

export function setCollection(newCollection, andStore = true){
    collection = [];
    newCollection.forEach(cardData => {
        collection.push(createCardFromData(cardData));
    });
    if(andStore){
        localStorage.setItem('collection', JSON.stringify(newCollection));
    }
}


export function resetCollection(){
    collection = [];
}