
import { startingCredits } from "../../../common/data/config";
import { addCreditIcon, removeCreditIcon, removeExistingCreditIcons } from "../ui/gameGUI";

export let availableCredits = startingCredits;
export let totalCredits = startingCredits;
const totalPossibleCredits = 18;

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