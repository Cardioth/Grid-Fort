import { strikes, medals } from "../managers/gameSetup";

export function exportBoard(board){
    const exportedBoard = {name: "Player", layout: [], strikes: strikes, medals: medals};
    board.allPlacedBuildings.forEach((building) => {
        if(building.BUID !== 0){
            exportedBoard.layout.push({BUID: building.BUID, x: building.x-8, y: building.y-8, rotation: building.rotation});
        }
    });

    //Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(exportedBoard));
}