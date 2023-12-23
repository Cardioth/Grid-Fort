import { boostedCellGraphic } from "./sceneInitialization";

// createBoosterCellGraphic
export function createBoosterCellGraphic(cell, building){
    const clone = boostedCellGraphic.clone();
    clone.position.x = (cell.x-8)/4;
    clone.position.y = -(cell.y-8)/4;
    if(building.boostedCellGraphics === undefined){
        building.boostedCellGraphics = [];
    }
    building.boostedCellGraphics.push(clone);
    clone.setEnabled(true);
}

export function removeBoosterCellGraphics(building){
    if(building.boostedCellGraphics === undefined){
        return;
    }
    for(const cellGraphic of building.boostedCellGraphics){
        cellGraphic.dispose();
    }
    building.boostedCellGraphics = [];
}