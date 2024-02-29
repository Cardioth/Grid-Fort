"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridWidth = exports.gridHeight = exports.cellSize = exports.boardWidth = exports.battleLoopTimeLength = void 0;
exports.setUniCredits = setUniCredits;
exports.uniCredits = exports.startingCredits = exports.startingCardCount = exports.shapeKeyLegend = void 0;
exports.updateUniCredits = updateUniCredits;
const gridWidth = exports.gridWidth = 17;
const gridHeight = exports.gridHeight = 17;
const cellSize = exports.cellSize = 18;
const boardWidth = exports.boardWidth = 2.875;
const startingCredits = exports.startingCredits = 2;
const startingCardCount = exports.startingCardCount = 2;
const battleLoopTimeLength = exports.battleLoopTimeLength = 20;
let uniCredits = exports.uniCredits = 0;
function updateUniCredits(amount) {
  exports.uniCredits = uniCredits = uniCredits + amount;
}
function setUniCredits(amount) {
  exports.uniCredits = uniCredits = amount;
}
const shapeKeyLegend = exports.shapeKeyLegend = {
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
  10: "anchorPointBooster"
};