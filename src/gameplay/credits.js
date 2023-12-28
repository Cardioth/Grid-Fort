
export let availableCredits = 5;
export let totalCredits = 5;

import { addCreditIcon, removeCreditIcon, removeExistingCreditIcons } from "../ui/gameGUI";

export function updateTotalCredits(amount) {
    totalCredits += amount;
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
}

export function setAvailableCredits(amount) {
    availableCredits = amount;
    removeExistingCreditIcons();
    if(amount > 0){
        addCreditIcon(amount);
    }
}

export function getAvailableCredits() {
    return availableCredits;
}

export function getTotalCredits() {
    return totalCredits;
}