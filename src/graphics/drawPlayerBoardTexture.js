import { gridHeight, gridWidth } from '../data/config.js';
import { ctx } from './initScene.js';
import { playerBoard } from '../managers/setup.js';

export function drawPlayerBoardTexture(testPlaneTexture) {
    const resolution = 1000;
    // Set constants
    const cellSizeX = resolution / gridWidth;
    const cellSizeY = resolution / gridHeight;

    const bleed = 2;
    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, resolution, resolution);
    //Loop through player board grid and draw cells
    for (let i = 0; i < playerBoard.grid.length; i++) {
        const cell = playerBoard.grid[i];
        if (!cell.occupied) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cell.x * cellSizeX - bleed, cell.y * cellSizeY - bleed, cellSizeX + bleed * 2, cellSizeY + bleed * 2);
        }
    }
    testPlaneTexture.update();
}
