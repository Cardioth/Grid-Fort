export const gridWidth = 17;
export const gridHeight = 17;
export const cellSize = 18;
export const boardWidth = 2.875;

export const startingCredits = 2;
export const startingCardCount = 2;
export const battleLoopTimeLength = 20;

export const startingLives = 7;
export const startingMedals = 0;

export let uniCredits = 0;

export function updateUniCredits(amount){
    uniCredits += amount;
}

export function setUniCredits(amount){
    uniCredits = amount;
}

export const shapeKeyLegend = {
    0: "empty",
    1: "occupied",
    2: "anchorPoint",
    3: "kineticWeapon",
    4: "energyWeapon",
    5: "missileWeapon",
    6: "booster",
    7: "anchorPointKineticWeapon",
    8: "anchorPointEnergyWeapon",
    9: "anchorPointMissileWeapon",
    10: "anchorPointBooster",
}