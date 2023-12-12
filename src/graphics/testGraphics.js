import { AIforts } from "../components/AIforts";
import { lasers, startBattleLoop } from "../gameplay/battle";
import { canPlaceBuildingNearest, circularizeGrids, placeAIFort, placeBuildingToBoard } from "../gameplay/buildingPlacement";
import allBuildings from "../components/buildings";
import { hand, updateCardAnimation } from "../components/cards";
import { cellSize, gridHeight, gridWidth } from "../data/config";
import { currentMouseX, currentMouseY, hoveredBuilding, selectedBuilding, selectedPlacedBuilding } from "../ui/controls";
import { totalCredits } from "../gameplay/credits";
import { currentScene, updateCurrentScene } from "../managers/sceneControl";
import { allBoards, canvas, ctx, enemyBoard, playerBoard } from "../managers/setup";
import { camelCaseToTitleCase, updateBoardStats, wrapText } from "../utilities/utils";

let countDownNumber = 4;

function drawBattleCountdown() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 50px Arial";
    ctx.fillText(countDownNumber, canvas.width / 2 - 25, canvas.height / 2 - 25);
}

function drawCardGraphics(card) {
    ctx.save();
    ctx.translate(card.currentPosition.x, card.currentPosition.y);

    // Rotate the context
    ctx.rotate(card.rotation);
    // Draw the card
    ctx.fillStyle = "#1b232b"; // Card background color
    ctx.fillRect(-card.currentSize.width / 2, -card.currentSize.height / 2, card.currentSize.width, card.currentSize.height);
    // Draw the outline
    ctx.strokeStyle = "#2c4c59"; // Outline color
    ctx.lineWidth = 1;
    ctx.strokeRect(-card.currentSize.width / 2, -card.currentSize.height / 2, card.currentSize.width, card.currentSize.height);
    // Display card name and description
    ctx.fillStyle = "#fff"; // Text color
    ctx.font = '12px Arial';
    wrapText(ctx, card.name, -card.currentSize.width / 2 + 8, -card.currentSize.height / 2 + 18, 14);

    // Draw circle around cost number
    ctx.beginPath();
    ctx.arc(-card.currentSize.width / 2 + 2, -card.currentSize.height / 2 + 2, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#7be8c7";
    ctx.fill();
    ctx.strokeStyle = "#1a5443";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '11px Arial';
    ctx.fillStyle = "#2c4c59";
    ctx.fillText(card.cost, -card.currentSize.width / 2 - 1, -card.currentSize.height / 2 + 6);

    let moveShape = 0;
    if (card.isHovered) {
        ctx.fillStyle = "#fff";
        ctx.font = '10px Arial';
        let lineHeight = 0;

        for (let key in card.effects) {
            const text = camelCaseToTitleCase(key) + ": " + card.effects[key];
            ctx.fillText(text, -card.currentSize.width / 2 + 8, -card.currentSize.height / 2 + 50 + lineHeight);
            lineHeight += 12;
        }
        moveShape = 20;
    }

    const miniScaleFactor = 0.4;
    const shapeX = (-(card.width * cellSize * miniScaleFactor) / 2);
    const shapeY = (-(card.height * cellSize * miniScaleFactor) / 2) + 15 + moveShape;
    drawShadowGraphic(card, shapeX, shapeY, miniScaleFactor, "#000", true, 0, 0);
    // Restore the context to its original state
    ctx.restore();
}
export function createBattleInterface() {
    buttons = [];
}
export const blasts = [];
function drawBlast(blast) {

    ctx.globalAlpha = blast.alpha;
    ctx.beginPath();
    ctx.arc(blast.x, blast.y, (blast.radius * cellSize / 2) * blast.size, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    blast.size += 0.005;
    blast.alpha /= 1.05;

    if (blast.alpha <= 0.01) {
        blasts.splice(blasts.indexOf(blast), 1);
    }

    ctx.globalAlpha = 1;
}
function drawLaser(laser) {
    ctx.globalAlpha = laser.alpha;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.moveTo(laser.x, laser.y);
    ctx.lineTo(laser.targetX, laser.targetY);
    ctx.stroke();
    laser.alpha -= 0.02;
    ctx.globalAlpha = 1;
    if (laser.alpha <= 0) {
        lasers.splice(lasers.indexOf(laser), 1);
    }
}
const projectiles = [];
export function spawnProjectile(building, board, target, enemy, turretOffsetX, turretOffsetY) {
    const newProjectile = {};
    newProjectile.x = (building.x * cellSize) + board.xGridOffset + (cellSize / 2) + turretOffsetX;
    newProjectile.y = (building.y * cellSize) + board.yGridOffset + (cellSize / 2) + turretOffsetY;
    newProjectile.targetX = (target.x * cellSize) + enemy.xGridOffset + (cellSize / 2);
    newProjectile.targetY = (target.y * cellSize) + enemy.yGridOffset + (cellSize / 2);
    newProjectile.trail = [];

    // Calculate the parabolic arc
    newProjectile.arc = calculateParabolicArc(newProjectile, newProjectile.targetX, newProjectile.targetY);
    newProjectile.currentSegment = 0;

    projectiles.push(newProjectile);
}
function calculateParabolicArc(projectile, targetX, targetY) {
    const points = [];
    const steps = 120; // Number of steps in the arc
    const dx = (targetX - projectile.x) / steps;
    const dy = (targetY - projectile.y);

    // Adjust the peak height based on the start and end Y-coordinates
    const basePeakHeight = 100; // Base value for peak height
    const peakHeightAdjustmentFactor = Math.abs(dy) / 2;
    const peakHeight = basePeakHeight + peakHeightAdjustmentFactor;

    for (let i = 0; i <= steps; i++) {
        const x = projectile.x + dx * i;
        const parabola = -4 * peakHeight / Math.pow(steps, 2) * Math.pow(i - steps / 2, 2) + peakHeight;

        // Adjust Y-coordinate to align with the target's Y-coordinate at the end of the arc
        const y = projectile.y + dy * (i / steps) - parabola;

        points.push({ x, y });
    }
    return points;
}
function animateProjectile(projectile) {
    const trailLength = projectile.trail.length;

    // Draw the trail with fading effect
    if (trailLength > 0) {
        // Starting alpha for the closest point to the projectile
        let alpha = 1;
        // Decrease alpha for points further away
        const alphaDecay = 1.5 / trailLength;

        for (let i = trailLength - 1; i >= 0; i--) {
            ctx.beginPath();
            // Use only two points at a time to draw each segment of the trail
            if (i > 0) {
                ctx.moveTo(projectile.trail[i].x, projectile.trail[i].y);
                ctx.lineTo(projectile.trail[i - 1].x, projectile.trail[i - 1].y);
            }

            ctx.strokeStyle = 'grey';
            ctx.globalAlpha = alpha;
            ctx.stroke();

            alpha -= alphaDecay; // Decrease the alpha for the next segment
            if (alpha < 0) alpha = 0; // Ensure alpha doesn't go negative
        }

        ctx.globalAlpha = 1;
    }

    // Draw the projectile
    const currentPoint = projectile.arc[projectile.currentSegment];
    if (currentPoint !== undefined) {
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 2, 0, 2 * Math.PI); // Radius of the projectile
        ctx.fillStyle = 'white'; // Projectile color
        ctx.fill();
    }

    // Add current point to the trail
    if (projectile.currentSegment < projectile.arc.length) {
        projectile.trail.push(currentPoint);
        projectile.currentSegment++;
    }
    if (projectile.currentSegment >= 50) {
        projectile.trail.shift();
    }
}
function drawButton(button) {
    if (button.highlighted) {
        ctx.fillStyle = button.highlightColor;
    } else {
        ctx.fillStyle = button.backgroundColor;
    }
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(button.x, button.y, button.width, button.height);
    ctx.fillStyle = button.textColor;
    ctx.font = "15px Arial";
    ctx.fillText(button.text, button.x + 10, button.y + 25);
}
export function createButton(text, x, y, width, height, backgroundColor, highlightColor, textColor, highlighted, onClick) {
    return { text: text, x: x, y: y, width: width, height: height, backgroundColor: backgroundColor, highlightColor: highlightColor, textColor: textColor, highlighted: highlighted, onClick: onClick };
}
function drawFortStats(board) {
    //draw white box around stats
    ctx.fillStyle = "#fff";
    const boxWidth = 143;
    const boxHeight = Object.keys(board.stats).length * 12 + 25;
    ctx.fillRect(canvas.width - boxWidth - 3, 3, boxWidth, boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - boxWidth - 3, 3, boxWidth, boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 11px Arial";
    let lineHeight = 15;
    ctx.fillText("Fort Stats", canvas.width - boxWidth + 3, lineHeight);
    lineHeight += 16;

    ctx.font = "10px Arial";
    for (let key in board.stats) {
        const text = camelCaseToTitleCase(key) + ": " + board.stats[key].stat;
        ctx.fillText(text, canvas.width - boxWidth + 3, lineHeight);
        lineHeight += 12;
    }
}
function drawBuildingStats(building) {
    //draw white box around stats
    ctx.fillStyle = "#fff";
    const boxWidth = 150;
    let boxHeight = 25;
    for (let key in building.stats) {
        if (building.stats[key] !== 0) {
            boxHeight += 12;
        }
    }

    if (Object.keys(building.effects).length > 0) {
        boxHeight += 12 * (Object.keys(building.effects).length) + 29;
    }

    ctx.fillRect(3, 3, boxWidth, boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(3, 3, boxWidth, boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 11px Arial";
    let lineHeight = 16;
    ctx.fillText(building.name, 10, lineHeight);
    lineHeight += 16;

    ctx.font = "10px Arial";
    for (let key in building.stats) {
        if (building.stats[key] !== 0) {
            const text = camelCaseToTitleCase(key) + ": " + building.stats[key];
            ctx.fillText(text, 10, lineHeight);
            lineHeight += 12;
        }
    }
    if (Object.keys(building.effects).length > 0) {
        lineHeight += 12;
        ctx.font = "bold 11px Arial";
        ctx.fillText("Boosts", 10, lineHeight);
        lineHeight += 16;
        ctx.font = "10px Arial";
        for (let key in building.effects) {
            if (building.effects[key] !== 0) {
                const text = camelCaseToTitleCase(key) + ": " + building.effects[key];
                ctx.fillText(text, 10, lineHeight);
                lineHeight += 12;
            }
        }
    }
}
export function updateTestGraphics() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a linear gradient background
    const linearGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    linearGradient.addColorStop(0, '#12313d');
    linearGradient.addColorStop(1, '#071f29');
    ctx.fillStyle = linearGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrids();

    //Outlines
    allBoards.forEach((board) => {
        board.allPlacedBuildings.forEach((building) => {
            drawBuildingOutline(building, convertGridToScreen(building.x, building.y, board), "#000", 1);
        });
        if (selectedPlacedBuilding !== null && selectedPlacedBuilding.boardId === board.id) {
            drawBuildingOutline(selectedPlacedBuilding, convertGridToScreen(selectedPlacedBuilding.x, selectedPlacedBuilding.y, board), "#fff", 1.5);
        }
        if (hoveredBuilding !== null && hoveredBuilding !== selectedPlacedBuilding) {
            drawBuildingOutline(hoveredBuilding, convertGridToScreen(hoveredBuilding.x, hoveredBuilding.y, board), "#ccc", 1.25);
        }
    });


    // Draw fort stats text
    if (selectedPlacedBuilding !== null && selectedPlacedBuilding.name === "Core") {

        let board = null;
        allBoards.forEach((b) => {
            if (b.id === selectedPlacedBuilding.boardId) {
                board = b;
            }
        });

        if (board !== null) {
            drawFortStats(board);
        }
    }

    //draw cards
    hand.forEach((card, index) => {
        updateCardAnimation(card);
        if (!card.isHovered && !card.isDragged) {
            drawCardGraphics(card);
        }
    });

    //draw hovered card
    hand.forEach((card, index) => {
        updateCardAnimation(card);
        if (card.isHovered && !card.isDragged) {
            drawCardGraphics(card);
        }
    });

    //draw dragged building
    if (selectedBuilding !== null) {
        drawShadowBuilding(selectedBuilding, currentMouseX, currentMouseY);
    }

    //draw boost arrows
    boostedAnimation();

    if (selectedPlacedBuilding !== null) {
        drawBuildingStats(selectedPlacedBuilding);
    }

    buttons.forEach((button) => {
        drawButton(button);
    });

    //Draw credits
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Credits: " + totalCredits, canvas.width - 200, canvas.height - 25);

    //Battle countdown
    if (currentScene === "battleCountdown" && countDownNumber < 4) {
        drawBattleCountdown();
    }

    //Draw projectiles
    for (let i = 0; i < projectiles.length; i++) {
        animateProjectile(projectiles[i]);
    }

    //Draw lasers
    for (let i = 0; i < lasers.length; i++) {
        drawLaser(lasers[i]);
    }

    //Draw blasts
    for (let i = 0; i < blasts.length; i++) {
        drawBlast(blasts[i]);
    }

    animateBoards();
}
function animateBoards() {
    allBoards.forEach((board) => {
        board.xGridOffset += (board.targetPosition.x - board.xGridOffset) * 0.02;
        board.yGridOffset += (board.targetPosition.y - board.yGridOffset) * 0.02;
    });
}
function drawArrow(centerX, centerY, width, height, color) {
    const bodyLength = height; // Adjust body length relative to point length
    const pointLength = height * 1.2;

    // Start the path for the arrow body
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, centerY);
    ctx.lineTo(centerX - width / 2, centerY - bodyLength);
    ctx.lineTo(centerX - width, centerY - bodyLength);
    ctx.lineTo(centerX, centerY - bodyLength - pointLength);
    ctx.lineTo(centerX + width, centerY - bodyLength);
    ctx.lineTo(centerX + width / 2, centerY - bodyLength);
    ctx.lineTo(centerX + width / 2, centerY);
    ctx.closePath();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = color; // Fill color
    ctx.fill();
    ctx.stroke();

}
function drawGrids() {
    allBoards.forEach((board) => {
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                const cellIndex = y * gridWidth + x;
                if (board.grid[cellIndex].visible === true) {
                    if (board.grid[cellIndex].occupied) {
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#000"; // Grid line color for unoccupied cells
                        ctx.fillStyle = board.grid[cellIndex].building.color;
                        ctx.fillRect(x * cellSize + board.xGridOffset - 0.5, y * cellSize + board.yGridOffset - 0.5, cellSize + 0.5, cellSize + 0.5);
                        if (board.grid[cellIndex].building && board.grid[cellIndex].building.destroyed === true) {
                            ctx.fillStyle = "#000";
                            ctx.fillRect(x * cellSize + board.xGridOffset - 0.5, y * cellSize + board.yGridOffset - 0.5, cellSize + 0.5, cellSize + 0.5);
                        }
                        //If cell is a turret draw a circle
                        if (board.grid[cellIndex].shapeKey === 2) {
                            //draw circle
                            ctx.beginPath();
                            ctx.arc(x * cellSize + board.xGridOffset + cellSize / 2, y * cellSize + board.yGridOffset + cellSize / 2, 2, 0, 2 * Math.PI);
                            ctx.strokeStyle = "#000";
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                        if (board.grid[cellIndex].shapeKey === 3) {
                            //draw circle
                            ctx.beginPath();
                            ctx.fillStyle = '#000';
                            ctx.arc(x * cellSize + board.xGridOffset + cellSize / 2, y * cellSize + board.yGridOffset + cellSize / 2, 2, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    } else {
                        ctx.fillStyle = "#1f3a45";
                        ctx.fillRect(x * cellSize + board.xGridOffset - 0.5, y * cellSize + board.yGridOffset - 0.5, cellSize + 0.5, cellSize + 0.5);
                        ctx.lineWidth = 0.25;
                        ctx.strokeStyle = "#ccc"; // Grid line color for unoccupied cells
                        ctx.strokeRect(x * cellSize + board.xGridOffset - 0.5, y * cellSize + board.yGridOffset - 0.5, cellSize + 0.5, cellSize + 0.5);
                    }
                }
            }
        }
    });
}
function drawBuildingOutline(building, location, color, width) {
    ctx.strokeStyle = color; // Outline color
    ctx.lineWidth = width; // Outline width

    let offsetX = location.x;
    let offsetY = location.y;

    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = building.shape[x + y * building.width];
            if (shapeKey <= 3 && shapeKey >= 1) {
                // Check each side for an edge
                if (x === 0 || building.shape[(x - 1) + y * building.width] < 1 || building.shape[(x - 1) + y * building.width] > 4) {
                    // Left edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x * cellSize, offsetY + y * cellSize);
                    ctx.lineTo(offsetX + x * cellSize, offsetY + (y + 1) * cellSize);
                    ctx.stroke();
                }
                if (x === building.width - 1 || building.shape[(x + 1) + y * building.width] < 1 || building.shape[(x + 1) + y * building.width] > 4) {
                    // Right edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + (x + 1) * cellSize - 0.5, offsetY + y * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize - 0.5, offsetY + (y + 1) * cellSize);
                    ctx.stroke();
                }
                if (y === 0 || building.shape[x + (y - 1) * building.width] < 1 || building.shape[x + (y - 1) * building.width] > 4) {
                    // Top edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x * cellSize, offsetY + y * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize - 0.5, offsetY + y * cellSize);
                    ctx.stroke();
                }
                if (y === building.height - 1 || building.shape[x + (y + 1) * building.width] < 1 || building.shape[x + (y + 1) * building.width] > 4) {
                    // Bottom edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x * cellSize, offsetY + (y + 1) * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize, offsetY + (y + 1) * cellSize);
                    ctx.stroke();
                }
            }
        }
    }
    ctx.lineWidth = 1; // Outline width
}
function drawShadowBuilding(building, mouseX, mouseY) {
    ctx.globalAlpha = 0.5; // Set transparency for the shadow


    // Calculate top-left corner for the building and adjust to snap to grid
    let topLeftX = (Math.floor((mouseX - playerBoard.xGridOffset) / cellSize) - Math.floor(selectedBuilding.width / 2)) * cellSize + playerBoard.xGridOffset;
    let topLeftY = (Math.floor((mouseY - playerBoard.yGridOffset) / cellSize) - Math.floor(selectedBuilding.height / 2)) * cellSize + playerBoard.yGridOffset;

    // Calculate top-left corner for the building without snapping to grid
    let topLeftXUnquantised = (((mouseX - playerBoard.xGridOffset) / cellSize) - Math.floor(selectedBuilding.width / 2)) * cellSize + playerBoard.xGridOffset;
    let topLeftYUnquantised = (((mouseY - playerBoard.yGridOffset) / cellSize) - Math.floor(selectedBuilding.height / 2)) * cellSize + playerBoard.yGridOffset;

    // Calculate Grid Coordinates
    const gridX = Math.floor((mouseX - playerBoard.xGridOffset) / cellSize) - Math.floor(selectedBuilding.width / 2);
    const gridY = Math.floor((mouseY - playerBoard.yGridOffset) / cellSize) - Math.floor(selectedBuilding.height / 2);

    let placementResult = canPlaceBuildingNearest(building, gridX, gridY);
    if (placementResult.canPlace) {
        drawShadowGraphic(building, topLeftX + placementResult.adjustedX * cellSize, topLeftY + placementResult.adjustedY * cellSize, 1, "#000", true, gridX, gridY);
    } else {
        // If building couldn't be placed in any direction, draw in red without snapping
        drawShadowGraphic(building, topLeftXUnquantised, topLeftYUnquantised, 1, "#F00", false, gridX, gridY);
    }

    ctx.globalAlpha = 1; // Reset transparency
}
function drawShadowGraphic(building, topLeftX, topLeftY, scale, color, includeEffects, gridX, gridY) {
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = building.shape[x + y * building.width];
            if (shapeKey <= 3 && shapeKey >= 1) {
                ctx.fillStyle = color; // Shadow color
                ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
            }

            if (shapeKey > 4 && includeEffects && scale === 1) {
                const cellX = Math.floor(topLeftX / cellSize) - Math.floor(playerBoard.xGridOffset / cellSize) + x;
                const cellY = Math.floor(topLeftY / cellSize) - Math.floor(playerBoard.yGridOffset / cellSize) + y;
                const cell = playerBoard.grid[cellY * gridWidth + cellX];

                if (cell !== undefined && cell.occupied && cell.building !== undefined) {
                    for (let key in building.effects) {
                        if (cell.building.stats.hasOwnProperty(key)) {
                            ctx.save();
                            ctx.globalAlpha = 0.8;
                            ctx.fillStyle = "#a3ffdf"; // Highlight color
                            ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
                            ctx.restore();
                        }
                    }
                }
                if (cell !== undefined && !cell.occupied) {
                    ctx.fillStyle = "#a3ffdf"; // Highlight color
                    ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
                }
            } else if (shapeKey > 4 && includeEffects) {
                ctx.fillStyle = "#a3ffdf"; // Highlight color
                ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
            }
        }
    }
}
export const boostArrow = { x: 50, y: 50, alpha: 1, lifeTime: 180, velocity: 0.2 };
export const arrowGraphics = [];
function boostedAnimation() {
    arrowGraphics.forEach((arrow) => {
        arrow.lifeTime--;
        arrow.alpha *= 0.98;
        arrow.y -= arrow.velocity;
        arrow.velocity *= 0.98;
        ctx.globalAlpha = arrow.alpha;
        drawArrow(arrow.x, arrow.y, 5, 5, "#a3f560");

        if (arrow.lifeTime <= 0) {
            arrowGraphics.splice(arrowGraphics.indexOf(arrow), 1);
        }
    });
    ctx.globalAlpha = 1;
}
export let buttons = [];

createBuildInterface();
export function createBuildInterface() {
    buttons = [];
    buttons.push(createButton("End Turn", canvas.width - 100, canvas.height - 50, 80, 40, "#ccc", "#eee", "#000", false, function () {
        updateCurrentScene("battleCountdown");
        playerBoard.targetPosition = { x: playerBoard.xGridOffset - 200, y: playerBoard.yGridOffset };
        allBoards.push(enemyBoard);
        placeBuildingToBoard(allBuildings.core, enemyBoard, 0, 0);
        placeAIFort(Math.floor(Math.random() * AIforts.length));
        updateBoardStats(enemyBoard);
        circularizeGrids();
        createBattleInterface();
        countDownNumber = 4;
        let countDownInterval = setInterval(function () {
            countDownNumber--;
            if (countDownNumber === 0) {
                updateCurrentScene("battle");
                startBattleLoop();
                clearInterval(countDownInterval);
            }
        }, 500);
    }));
}

export function convertGridToScreen(x, y, board) {
    return { x: x * cellSize + board.xGridOffset, y: y * cellSize + board.yGridOffset };
}