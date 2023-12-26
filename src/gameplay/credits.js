
export let availableCredits = 5;
export let totalCredits = 18;

import { addCreditIcon, removeCreditIcon } from "../ui/gameGUI";

export function updateTotalCredits(amount) {
    totalCredits += amount;
    if(amount > 0){
        addCreditIcon(amount);
    } else {
        removeCreditIcon(amount);
    }
}

export function updateAvailableCredits(amount) {
    availableCredits += amount;
    if(amount > 0){
        addCreditIcon(amount);
    } else {
        removeCreditIcon(amount);
    }
}

export function setTotalCredits(amount) {
    totalCredits = amount;
    if(amount > 0){
        addCreditIcon(amount);
    } else {
        removeCreditIcon(amount);
    }
}

export function setAvailableCredits(amount) {
    availableCredits = amount;
    if(amount > 0){
        addCreditIcon(amount);
    } else {
        removeCreditIcon(amount);
    }
}

export function getAvailableCredits() {
    return availableCredits;
}

export function getTotalCredits() {
    return totalCredits;
}