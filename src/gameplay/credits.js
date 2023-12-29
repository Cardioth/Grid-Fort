
export let availableCredits = 2;
export let totalCredits = 2;
const totalPossibleCredits = 18;

import { addCreditIcon, removeCreditIcon, removeExistingCreditIcons } from "../ui/gameGUI";

export function updateTotalCredits(amount) {
    totalCredits += amount;
}

export function updateAvailableCredits(amount) {
    if(availableCredits + amount > totalPossibleCredits){
        setAvailableCredits(totalPossibleCredits);
        return;
    }
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