import { gridHeight, gridWidth } from '../../data/config.js';
import { testPlaneContext } from '../sceneInitialization.js';
import { playerBoard } from '../../managers/gameSetup.js';

export function drawTestPlaneTexture(testPlaneTexture) {
    const resolution = 1000;
    // Set constants
    const cellSizeX = resolution / gridWidth;
    const cellSizeY = resolution / gridHeight;

    const bleed = 2;
    // Black background
    testPlaneContext.fillStyle = '#000';
    testPlaneContext.fillRect(0, 0, resolution, resolution);
    //Loop through player board grid and draw cells
    for (let i = 0; i < playerBoard.grid.length; i++) {
        const cell = playerBoard.grid[i];
        if (!cell.occupied) {
            testPlaneContext.fillStyle = '#FFF';
            testPlaneContext.fillRect(cell.x * cellSizeX - bleed, cell.y * cellSizeY - bleed, cellSizeX + bleed * 2, cellSizeY + bleed * 2);
        }
    }
    testPlaneTexture.update();
}
