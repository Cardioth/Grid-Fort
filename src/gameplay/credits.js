
export let availableCredits = 2;
export let totalCredits = 10;

export function updateTotalCredits(amount) {
    totalCredits += amount;
}

export function updateAvailableCredits(amount) {
    availableCredits += amount;
}

export function setTotalCredits(amount) {
    totalCredits = amount;
}

export function setAvailableCredits(amount) {
    availableCredits = amount;
}

export function getAvailableCredits() {
    return availableCredits;
}

export function getTotalCredits() {
    return totalCredits;
}