import { hitTest, wrapText, camelCaseToTitleCase } from "./utils";

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 17;
const gridHeight = 17;
const cellSize = 18;

let currentScene = "build";

let availableCredits = 2;
let totalCredits = 2;

const fortStats = {
    kineticFirepower: {name:"Kinetic Firepower", stat: 0},
    energyFirepower: {name:"Energy Firepower", stat: 0},
    armor: {name:"Kinetic Damage Reduction", stat: 0},
    energyShield: {name:"Energy Damage Reduction", stat: 0},
    kineticDamageBoost: {name:"Kinetic Damage Boost", stat: 0},
    energyDamageBoost: {name:"Energy Damage Boost", stat: 0},
    powerDraw: {name:"Power Draw", stat: 0},
    ammoStorage: {name:"Ammo Storage", stat: 0},
    powerStorage: {name:"Power Storage", stat: 0},
    radarRange: {name:"Radar Range", stat: 4.5},
};

const playerBoard = {
    name:"Player",
    grid:createGridWithStructuredNeighbors(gridWidth, gridHeight),
    xGridOffset:(canvas.width-(gridWidth*cellSize))/2,
    yGridOffset:(canvas.height-(gridHeight*cellSize))/2-50,
    targetPosition:{x:(canvas.width-(gridWidth*cellSize))/2,y:(canvas.height-(gridHeight*cellSize))/2-50},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:0,
};

const enemyBoard = {
    name:"Enemy",
    grid:createGridWithStructuredNeighbors(gridWidth, gridHeight),
    xGridOffset:(canvas.width-(gridWidth*cellSize))/2+200,
    yGridOffset:(canvas.height-(gridHeight*cellSize))/2-50,
    targetPosition:{x:(canvas.width-(gridWidth*cellSize))/2+200,y:(canvas.height-(gridHeight*cellSize))/2-50},
    stats:JSON.parse(JSON.stringify(fortStats)),
    allPlacedBuildings:[],
    id:1,
};

const allBoards = [playerBoard];

circularizeGrids();

const shapeKey = {
    0: {name:"Empty", highLightColor:"#FF0"},
    1: {name:"Building", highLightColor:"#FF0"},
    2: {name:"TurretArty",highLightColor:"#FF0"},
    3: {name:"TurretEnergy",highLightColor:"#0F0"},
    4: {name:"TurretMissile",highLightColor:"#0FF"},
    5: {name:"Effect",highLightColor:"#F0F"},
}

const defaultStats = {
    armor:0,
    energyShield:0,
    health:30,
}

const defaultAttackingStats = {
    critChance:10,
    critDamageBonus:50,
    blastRadius:1,
    fireRate:10,
    windUpTime:0,
    ammoDraw:1,
}

const defaultQualities = {
    fireRateCounter:0,
    windUpCounter:0,
    returnable:true,
    placed:false,
    moveable:true,
    effects:{},
    stats:{...defaultStats},
    cost:1,
    health:50,
    rejectStats:[],
    description:"",
    destroyed:false,
}

const allBuildings = { 
    miniArty:{name:"Artillery", class:"Artillery", description:" ",cost:1, width:3, height:2, shape:[0,1,0,1,2,1], color:"#3ca9c8", 
        stats:{kineticFirepower:1, blastRadius:2, ammoStorage:10, fireRate:8}},
    basicLaser:{name:"Basic\nLaser", class:"Laser", cost:1, width:2, height:2, shape:[1,3,1,0], color:"#5497e3", 
        stats:{energyFirepower:2, powerStorage:15, powerDraw:0.2, fireRate:2}},
    damageBooster:{name:"Damage\nBooster", class:"Booster",cost:2, width:3,height:3,shape:[5,1,5,5,1,5,5,1,5], color:"#487fb6", 
        effects:{energyFirepower:1, kineticFirepower:1}},
    powerStation:{name:"Power\nStation", class:"Booster",cost:3, width:4,height:4,shape:[0,5,5,0,5,3,1,5,5,1,1,5,0,5,5,0], color:"#5497e3", 
        stats:{energyFirepower:1, fireRate:3, powerStorage:30, powerDraw:0.1},effects:{powerStorage:100}},
    ammoStation:{name:"Ammo\nStation", class:"Booster",cost:3, width:4,height:4,shape:[0,5,5,0,5,2,1,5,5,1,1,5,0,5,5,0], color:"#35608a", 
        stats:{kineticFirepower:1, ammoStorage:30, fireRate:12, ammoStorage:50}, effects:{ammoStorage:100}},
    protector:{name:"Protector", class:"Booster",cost:1,  width:2,height:3,shape:[1,5,1,5,2,1], color:"#324d62", 
        stats:{kineticFirepower:1, ammoStorage:15}, 
        effects:{armor:1,energyShield:1}},
    energyShield:{name:"Energy\nShield", class:"Shield",cost:2, width:6,height:3,shape:[0,5,5,5,5,0,5,5,1,1,5,5,5,1,1,1,1,5], color:"#546572", 
        effects:{energyShield:1}},
    radar:{name:"Radar", class:"Radar",cost:2, width:3,height:3,shape:[0,1,0,1,1,1,0,1,0], color:"#546572", 
        stats:{radarRange:2}, effects:{radarRange:2}},
    powerRing:{name:"Power\nRing", class:"Booster", cost:9, width:6, height:6, shape:[0,1,0,0,1,0,1,1,1,1,1,1,0,1,5,5,1,0,0,1,5,5,1,0,1,1,1,1,1,1,0,1,0,0,1,0], color:"#fcc15b", 
        effects:{energyFirepower:5, powerStorage:10}},
    core:{name:"Core", class:"Core",cost:9, width:1,height:1,shape:[2], color:"#a9bcdb", moveable:false, returnable:false, 
        stats:{kineticFirepower:1,health:30, ammoStorage:1000}},
}

//Add default stats to all buildings if stat is not specified
for (let key in allBuildings) {
    for(let key2 in defaultQualities){
        if(!allBuildings[key].hasOwnProperty(key2)){
            allBuildings[key][key2] = defaultQualities[key2];
        }
    }
    for(let key3 in defaultStats){
        if(!allBuildings[key].stats.hasOwnProperty(key3) && !allBuildings[key].rejectStats.includes(key3)){
            allBuildings[key].stats[key3] = defaultStats[key3];
        }
    }
    if(allBuildings[key].stats.hasOwnProperty("kineticFirepower") || allBuildings[key].stats.hasOwnProperty("energyFirepower")){
        for(let key4 in defaultAttackingStats){
            if(!allBuildings[key].stats.hasOwnProperty(key4)){
                allBuildings[key].stats[key4] = defaultAttackingStats[key4];
            }
        }
    }
    allBuildings[key].keyName = key;
}

let selectedPlacedBuilding = null;
let hoveredBuilding = null;
let selectedBuilding = null;
let selectedCard = null;

//Deal cards to hand for testing
let hand = [];
for(let i = 0; i < 1; i++){
    hand.push(getRandomBuilding());
}

function getRandomBuilding() {
    const cards = Object.values(allBuildings);
    const randomNumber = Math.floor(Math.random() * cards.length);
    return {...cards[randomNumber]};
}

function updateBoardStats(board){
    board.stats = JSON.parse(JSON.stringify(fortStats));
    board.allPlacedBuildings.forEach((building) => {
        for(let key in building.stats){
            if(board.stats.hasOwnProperty(key)){
                board.stats[key].stat += building.stats[key];
            }
        }5
    });
}

//Place core
placeBuildingToBoard(allBuildings.core,playerBoard,0,0);
function placeBuildingToBoard(building, board,xLoc,yLoc){
    placeBuilding(JSON.parse(JSON.stringify(building)), board.xGridOffset+(gridWidth*cellSize)/2+(xLoc*cellSize), board.yGridOffset+(gridHeight*cellSize)/2+(yLoc*cellSize), board);
}

let countDownNumber = 4;
function drawBattleCountdown(){
    ctx.fillStyle = "#fff";
    ctx.font = "bold 50px Arial";
    ctx.fillText(countDownNumber, canvas.width/2-25,canvas.height/2-25);
}

const cardWidth = 60;
const cardHeight = 90;
function setCardPositions(){
    let xCardOffset = canvas.width/2; // Initial offset from left
    let yCardOffset = -30; // Initial offset from top
    const gap = 50-hand.length*2; // Gap between cards
    
    hand.forEach((buildingCard, index) => {
        // Calculate the initial position for each card
        const rotationAngle = (index+.5 - (hand.length / 2))/15;
        const arcStrength = -1; // Adjust this value to increase or decrease the curvature of the arc
        const xPosition = xCardOffset + (index + 0.5 - hand.length / 2) * gap;
        const distanceFromCenter = (index + 0.5 - hand.length / 2);
        const yPosition = canvas.height - cardHeight - yCardOffset - Math.pow(distanceFromCenter, 2) * arcStrength;
        
        buildingCard.originalPosition = { x: xPosition, y: yPosition };
        if(buildingCard.initialized === undefined){
            buildingCard.currentPosition = { ...buildingCard.originalPosition };
            buildingCard.currentSize = { width: cardWidth, height: cardHeight }; // Initial size
            buildingCard.initialized = true;
        }
        buildingCard.targetSize = { ...buildingCard.currentSize };
        buildingCard.rotation = rotationAngle;
        buildingCard.originalRotation = rotationAngle;
        buildingCard.isHovered = false;
        buildingCard.isDragged = false;
    });
}
setCardPositions();

function updateCardAnimation(card) {
    if (card.isHovered) {
        // Set target size and position for hovered card
        card.rotation = 0;
        card.targetSize = { width: 130, height: 130*1.5};
        card.targetPosition = { x: card.originalPosition.x, y: canvas.height - 130 };
    } else {
        // Reset to normal size and position when not hovered
        card.rotation = card.originalRotation;
        card.targetSize = { width: 60, height: 90 };
        card.targetPosition = card.originalPosition;
    }

    // Animate size
    card.currentSize.width = card.targetSize.width;
    card.currentSize.height = card.targetSize.height;

    // Animate position
    card.currentPosition.x += (card.targetPosition.x - card.currentPosition.x) * 0.06;
    card.currentPosition.y += (card.targetPosition.y - card.currentPosition.y) * 0.06;
}

function drawCardGraphics(card) {
    ctx.save();
    ctx.translate(card.currentPosition.x, card.currentPosition.y);

    // Rotate the context
    ctx.rotate(card.rotation);
    // Draw the card
    ctx.fillStyle = "#1b232b"; // Card background color
    ctx.fillRect(-card.currentSize.width /2, -card.currentSize.height/2, card.currentSize.width, card.currentSize.height);
    // Draw the outline
    ctx.strokeStyle = "#2c4c59"; // Outline color
    ctx.lineWidth = 1;
    ctx.strokeRect(-card.currentSize.width /2, -card.currentSize.height/2, card.currentSize.width, card.currentSize.height);
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
    ctx.fillText(card.cost, -card.currentSize.width / 2 -1, -card.currentSize.height / 2 +6);
    
    let moveShape = 0;
    if(card.isHovered){
        ctx.fillStyle = "#fff";
        ctx.font = '10px Arial';
        let lineHeight = 0;
        
        for(let key in card.effects){
            const text = camelCaseToTitleCase(key) + ": " + card.effects[key];
            ctx.fillText(text, -card.currentSize.width / 2 + 8, -card.currentSize.height / 2 + 50 + lineHeight);
            lineHeight += 12;
        }
        moveShape = 20;
    }

    const miniScaleFactor = .4;
    const shapeX = (-(card.width*cellSize*miniScaleFactor)/2);
    const shapeY = (-(card.height*cellSize*miniScaleFactor)/2)+15+moveShape;
    drawShadowGraphic(card, shapeX, shapeY, miniScaleFactor, "#000", true,0,0);
    // Restore the context to its original state
    ctx.restore();
}
let battleLoopInterval;
let buttons = [];
createBuildInterface();
function createBuildInterface(){
    buttons = [];
    buttons.push(createButton("End Turn",canvas.width-100,canvas.height-50,80,40,"#ccc","#eee","#000",false,function(){
        currentScene = "battleCountdown";
        playerBoard.targetPosition = {x:playerBoard.xGridOffset-200,y:playerBoard.yGridOffset};
        allBoards.push(enemyBoard);
        placeBuildingToBoard(allBuildings.core,enemyBoard,0,0);
        placeAIFort(Math.floor(Math.random() * AIforts.length));
        updateBoardStats(enemyBoard);
        circularizeGrids();
        createBattleInterface();

        countDownNumber = 4;
        let countDownInterval = setInterval(function(){
            countDownNumber--;
            if(countDownNumber === 0){
                currentScene = "battle";
                battleLoopInterval = setInterval(function(){
                    battleLoop();
                    circularizeGrids();
                },100);
                clearInterval(countDownInterval);
            }
        },500);
    }));
}

function placeAIFort(AIfortIndex) {
    const AIfort = AIforts[AIfortIndex];
    AIfort.layout.forEach((building) => {
        const newBuilding = {...building.building};
        if (building.rotation === "R" || building.rotation === "L") {
            rotateBuilding(newBuilding, building.rotation);
        } else if (building.rotation === "RR") {
            rotateBuilding(newBuilding, building.rotation);
            rotateBuilding(newBuilding, building.rotation);
        }
        placeBuildingToBoard(newBuilding, enemyBoard, building.x, building.y);
    });
}

const AIforts = [

    {name:"Yuan Lee", description:"My little fortress.",layout:[
        {building:allBuildings.miniArty, x:0, y:-2, rotation:"R"},
        {building:allBuildings.protector, x:-2, y:-1, rotation:"N"},
        {building:allBuildings.radar, x:1, y:1, rotation:"N"},
        {building:allBuildings.damageBooster, x:-2, y:-2, rotation:"N"},
        {building:allBuildings.basicLaser, x:-3, y:-2, rotation:"N"},
        {building:allBuildings.ammoStation, x:1, y:-3, rotation:"N"},
    ]},

    {name:"Sir Biggles", description:"A fortress with a lot of firepower.",layout:[
        {building:allBuildings.miniArty, x:1, y:-1, rotation:"N"},
        {building:allBuildings.miniArty, x:-1, y:2, rotation:"RR"},
        {building:allBuildings.miniArty, x:-1, y:-1, rotation:"L"},
        {building:allBuildings.miniArty, x:2, y:1, rotation:"R"},
        {building:allBuildings.basicLaser, x:1, y:-2, rotation:"N"},
        {building:allBuildings.basicLaser, x:3, y:1, rotation:"R"},
        {building:allBuildings.basicLaser, x:0, y:3, rotation:"RR"},
        {building:allBuildings.basicLaser, x:-2, y:0, rotation:"L"},
        {building:allBuildings.radar, x:-2, y:-3, rotation:"N"},
        {building:allBuildings.radar, x:3, y:-2, rotation:"N"},
        {building:allBuildings.radar, x:-3, y:2, rotation:"N"},
        {building:allBuildings.radar, x:2, y:3, rotation:"N"},
    ]},

];

function createBattleInterface(){
    buttons = [];
}

function battleLoop(){
    for(let board of allBoards){
        const enemy = board === playerBoard ? enemyBoard : playerBoard;
        let possibleCellTargets = getPossibleCellTargets(enemy);
        
        board.allPlacedBuildings.forEach((building) =>{
            //Kinetic weapons always find a new target
            if(building.stats.kineticFirepower > 0){
                building.target = possibleCellTargets[Math.floor(Math.random() * possibleCellTargets.length)];
            }
            //Fire Kinetic
            if(building.target && building.stats.kineticFirepower > 0 && building.destroyed === false && building.stats.ammoStorage > building.stats.ammoDraw){
                fireKineticTurret(building, board, building.target, enemy);
            }
            //Energy weapons only find a new target if they don't have one or if their target is destroyed
            if(building.target === undefined || building.target.building.destroyed === true){
                building.target = possibleCellTargets[Math.floor(Math.random() * possibleCellTargets.length)];
            }
            //Fire Energy
            if(building.target && building.stats.energyFirepower > 0 && building.destroyed === false && building.stats.powerStorage > building.stats.powerDraw){
                fireEnergyTurret(building, board, building.target, enemy);
            }
        });

        //if all buildings are destroyed, end game
        let allBuildingsDestroyed = true;
        board.allPlacedBuildings.forEach((building) =>{
            if(building.destroyed === false){
                allBuildingsDestroyed = false;
            }
        });

        if(allBuildingsDestroyed){
            currentScene = "build";
            hand.push(getRandomBuilding());
            hand.push(getRandomBuilding());
            playerBoard.targetPosition = {x:(canvas.width-(gridWidth*cellSize))/2,y:playerBoard.yGridOffset};
            availableCredits += 1;
            totalCredits = availableCredits;

            setCardPositions();
            createBuildInterface();

            //revive all buildings
            allBoards.forEach((board) => {
                
                board.allPlacedBuildings.forEach((building) =>{
                    building.target = undefined;
                    building.destroyed = false;
                    building.stats.health = allBuildings[building.keyName].stats.health;
                    if(building.stats.hasOwnProperty("ammoStorage")){
                        building.stats.ammoStorage = allBuildings[building.keyName].stats.ammoStorage;
                    }
                    if(building.stats.hasOwnProperty("powerStorage")){
                        building.stats.powerStorage = allBuildings[building.keyName].stats.powerStorage;
                    }
                });

            });

            if(allBoards.indexOf(enemyBoard) !== -1){
                allBoards.splice(allBoards.indexOf(enemyBoard),1);
            }
            clearInterval(battleLoopInterval);
        }
    }
}

function fireKineticTurret(building, board, target, enemy) {
    if(building.stats.windUpTime > building.windUpCounter){
        building.windUpCounter++;
        return;
    }
    building.fireRateCounter++;
    if (building.fireRateCounter >= building.stats.fireRate) {
        building.stats.ammoStorage -= building.stats.ammoDraw;
        building.fireRateCounter = 0;
        for (let x = 0; x < building.width; x++) {
            for (let y = 0; y < building.height; y++) {
                const shapeKey = building.shape[x + y * building.width];
                if (shapeKey === 2) {
                    const turretOffsetX = (x * cellSize);
                    const turretOffsetY = (y * cellSize);
                    spawnProjectile(building, board, target, enemy, turretOffsetX, turretOffsetY);
                }
            }
        }
        setTimeout(function () {
            //Adjust damage for crits
            let damage = building.stats.kineticFirepower-target.building.stats.armor;
            if(Math.random() * 100 < building.stats.critChance){
                damage = damage*(1+(100/building.stats.critDamageBonus));
            }
            if (damage < 1){
                damage = 1;
            }
  
            const blastRadius = building.stats.blastRadius;
            for(let x = target.x-blastRadius; x < target.x+blastRadius+1; x++){
                for(let y = target.y-blastRadius; y < target.y+blastRadius+1; y++){
                    if(x >= 0 && x < gridWidth && y >= 0 && y < gridHeight){
                        const cell = enemy.grid[x + y * gridWidth];
                        if(cell.occupied && cell.building !== undefined){
                            if(currentScene === "battle"){
                                cell.building.stats.health -= damage/(building.stats.blastRadius*building.stats.blastRadius);
                                cell.building.stats.health = parseFloat(cell.building.stats.health.toFixed(2));
                            }
                            blasts.push({
                                x:(target.x * cellSize) + enemy.xGridOffset + (cellSize / 2), 
                                y:(target.y * cellSize) + enemy.yGridOffset + (cellSize / 2), 
                                radius:blastRadius, 
                                alpha:1,
                                size:1,
                            });
                            if (target.building.stats.health <= 0) {
                                target.building.destroyed = true;
                            }
                        }
                    }
                }
            }
        }, 750);
    }
}

const lasers = [];
function fireEnergyTurret(building, board, target, enemy) {
    if(building.stats.windUpTime > building.windUpCounter){
        building.windUpCounter++;
        return;
    }
    let turretOffsetX = 0;
    let turretOffsetY = 0;
    building.fireRateCounter++;
    building.stats.powerStorage -= building.stats.powerDraw;
    building.stats.powerStorage = parseFloat(building.stats.powerStorage.toFixed(2));
    if (building.fireRateCounter >= building.stats.fireRate) {
        building.fireRateCounter = 0;
        for (let x = 0; x < building.width; x++) {
            for (let y = 0; y < building.height; y++) {
                const shapeKey = building.shape[x + y * building.width];
                if (shapeKey === 3) {
                    turretOffsetX = (x * cellSize);
                    turretOffsetY = (y * cellSize);
                }
            }
        }
        lasers.push({
            x:(building.x * cellSize) + board.xGridOffset + (cellSize / 2) + turretOffsetX, 
            y:(building.y * cellSize) + board.yGridOffset + (cellSize / 2) + turretOffsetY, 
            targetX:(target.x * cellSize) + enemy.xGridOffset + (cellSize / 2), 
            targetY:(target.y * cellSize) + enemy.yGridOffset + (cellSize / 2),
            alpha:1,
        });

        let damage = (building.stats.energyFirepower-target.building.stats.energyShield)/10;
        if (damage < .1){
            damage = .1;
        }

        if(currentScene === "battle"){
            target.building.stats.health -= damage;
        }
        const blastRadius = building.stats.blastRadius;
        blasts.push({
            x:(target.x * cellSize) + enemy.xGridOffset + (cellSize / 2), 
            y:(target.y * cellSize) + enemy.yGridOffset + (cellSize / 2), 
            radius:blastRadius, 
            alpha:1,
            size:1,
        });
        target.building.stats.health = parseFloat(target.building.stats.health.toFixed(2));

        if (target.building.stats.health <= 0) {
            target.building.destroyed = true;
        }
    }
}

const blasts = [];
function drawBlast(blast){

    ctx.globalAlpha = blast.alpha;
    ctx.beginPath();
    ctx.arc(blast.x, blast.y, (blast.radius*cellSize/2)*blast.size, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    blast.size += 0.001;
    blast.alpha /= 1.05;

    if(blast.alpha <= 0.01){  
        blasts.splice(blasts.indexOf(blast),1);
    }

    ctx.globalAlpha = 1;
}

function drawLaser(laser){
    ctx.globalAlpha = laser.alpha;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.moveTo(laser.x, laser.y);
    ctx.lineTo(laser.targetX, laser.targetY);
    ctx.stroke();
    laser.alpha -= 0.02;
    ctx.globalAlpha = 1;
    if(laser.alpha <= 0){
        lasers.splice(lasers.indexOf(laser),1);
    }
}

const projectiles = [];
function spawnProjectile(building, board, target, enemy, turretOffsetX, turretOffsetY) {
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
        let alpha = 1.0; 
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

        ctx.globalAlpha = 1.0; 
    }

    // Draw the projectile
    const currentPoint = projectile.arc[projectile.currentSegment];
    if(currentPoint !== undefined){
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


function getPossibleCellTargets(board){
    //Get all cells that are occupied that aren't the core
    const possibleCellTargets = [];
    board.grid.forEach((cell) => {
        if(cell.occupied && cell.building !== undefined && cell.building.destroyed === false){ //&& cell.building.name !== "Core"
            possibleCellTargets.push(cell);
        }
    });
    return possibleCellTargets;
}

function drawButton(button){
    if(button.highlighted){
        ctx.fillStyle = button.highlightColor;
    } else {
        ctx.fillStyle = button.backgroundColor;
    }
    ctx.fillRect(button.x,button.y,button.width,button.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(button.x,button.y,button.width,button.height);
    ctx.fillStyle = button.textColor;
    ctx.font = "15px Arial";
    ctx.fillText(button.text, button.x+10, button.y+25);
}

function createButton(text,x,y,width,height,backgroundColor,highlightColor,textColor,highlighted,onClick){
    return {text:text,x:x,y:y,width:width,height:height,backgroundColor:backgroundColor,highlightColor:highlightColor,textColor:textColor,highlighted:highlighted,onClick:onClick};
}

function getHoveredCard(mouseX, mouseY) {
    const hoverWidthPercentage = 0.5; // Adjust this value to change the width of the hovered card area

    for (let i = 0; i < hand.length; i++) {
        const hoverWidth = hand[i].currentSize.width * hoverWidthPercentage;
        const minX = hand[i].currentPosition.x - hoverWidth / 2 - 12;
        const maxX = hand[i].currentPosition.x + hoverWidth / 2 - 12;
        const minY = canvas.height - cardHeight - 20;
        const maxY = canvas.height;

        if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
            for (let j = 0; j < hand.length; j++) {
                hand[j].isHovered = false;
            }
            hand[i].isHovered = true;
            if(currentScene === "build"){
                canvas.style.cursor = "grab";
            }
            return hand[i];
        } else {
            hand[i].isHovered = false;
            canvas.style.cursor = "default";
        }
    }
    return undefined;
}

let currentMouseX = 0;
let currentMouseY = 0;

let lastTime = 0;

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    updateGraphics();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

function updateGraphics(){
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
        board.allPlacedBuildings.forEach((building) =>{
            drawBuildingOutline(building,convertGridToScreen(building.x,building.y,board), "#000", 1);
        });
        if(selectedPlacedBuilding !== null && selectedPlacedBuilding.boardId === board.id){
            drawBuildingOutline(selectedPlacedBuilding,convertGridToScreen(selectedPlacedBuilding.x,selectedPlacedBuilding.y,board), "#fff", 1.5);
        }
        if (hoveredBuilding !== null && hoveredBuilding !== selectedPlacedBuilding){
            drawBuildingOutline(hoveredBuilding,convertGridToScreen(hoveredBuilding.x,hoveredBuilding.y,board), "#ccc", 1.25);
        }
    });


    // Draw fort stats text
    if(selectedPlacedBuilding !== null && selectedPlacedBuilding.name === "Core"){

        let board = null;
        allBoards.forEach((b) => {
            if(b.id === selectedPlacedBuilding.boardId){
                board = b;
            }
        });

        drawFortStats(board);
    }

    //draw cards
    hand.forEach((card, index) => {
        updateCardAnimation(card);
        if(!card.isHovered && !card.isDragged){
            drawCardGraphics(card);
        }
    });
    
    //draw hovered card
    hand.forEach((card, index) => {
        updateCardAnimation(card);
        if(card.isHovered && !card.isDragged){
            drawCardGraphics(card);
        }
    });

    //draw dragged building
    if(selectedBuilding !== null){
        drawShadowBuilding(selectedBuilding, currentMouseX, currentMouseY);
    }

    //draw boost arrows
    boostedAnimation();

    if(selectedPlacedBuilding !== null){
        drawBuildingStats(selectedPlacedBuilding);
    }

    buttons.forEach((button) => {
        drawButton(button);
    });

    //Draw credits
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Credits: " + totalCredits, canvas.width-200,canvas.height-25);

    //Battle countdown
    if(currentScene === "battleCountdown" && countDownNumber < 4){
        drawBattleCountdown();
    }

    //Draw projectiles
    for(let i = 0; i < projectiles.length; i++){
        animateProjectile(projectiles[i]);
    }

    //Draw lasers
    for(let i = 0; i < lasers.length; i++){
        drawLaser(lasers[i]);
    }

    //Draw blasts
    for(let i = 0; i < blasts.length; i++){
        drawBlast(blasts[i]);
    }

    animateBoards();
}

function drawFortStats(board) {
    //draw white box around stats
    ctx.fillStyle = "#fff";
    const boxWidth = 143;
    const boxHeight = Object.keys(board.stats).length * 12 + 25;
    ctx.fillRect(canvas.width-boxWidth-3,3,boxWidth,boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width-boxWidth-3,3,boxWidth,boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 11px Arial";
    let lineHeight = 15;
    ctx.fillText("Fort Stats", canvas.width-boxWidth+3, lineHeight);
    lineHeight += 16;

    ctx.font = "10px Arial";
    for (let key in board.stats) {
        const text = camelCaseToTitleCase(key) + ": " + board.stats[key].stat;
        ctx.fillText(text, canvas.width-boxWidth+3, lineHeight);
        lineHeight += 12;
    }
}

function animateBoards(){
    allBoards.forEach((board) => {
        board.xGridOffset += (board.targetPosition.x - board.xGridOffset) * 0.02;
        board.yGridOffset += (board.targetPosition.y - board.yGridOffset) * 0.02;
    });
}

function drawBuildingStats(building){
    //draw white box around stats
    ctx.fillStyle = "#fff";
    const boxWidth = 150;
    let boxHeight = 25;
    for(let key in building.stats){
        if(building.stats[key] !== 0){
            boxHeight += 12;
        }
    }
    
    if(Object.keys(building.effects).length > 0){
        boxHeight += 12*(Object.keys(building.effects).length)+29;
    }
    
    ctx.fillRect(3,3,boxWidth,boxHeight);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(3,3,boxWidth,boxHeight);

    ctx.fillStyle = "#000";
    ctx.font = "bold 11px Arial";
    let lineHeight = 16;
    ctx.fillText(building.name, 10, lineHeight);
    lineHeight += 16;

    ctx.font = "10px Arial";
    for(let key in building.stats){
        if(building.stats[key] !== 0){
            const text = camelCaseToTitleCase(key) + ": " + building.stats[key];
            ctx.fillText(text, 10, lineHeight);
            lineHeight += 12;
        }
    }
    if(Object.keys(building.effects).length > 0){
        lineHeight += 12;
        ctx.font = "bold 11px Arial";
        ctx.fillText("Boosts", 10, lineHeight);
        lineHeight += 16;
        ctx.font = "10px Arial";
        for(let key in building.effects){
            if(building.effects[key] !== 0){
                const text = camelCaseToTitleCase(key) + ": " + building.effects[key];
                ctx.fillText(text, 10, lineHeight);
                lineHeight += 12;
            }
        }
    }
}

function convertGridToScreen(x,y,board){
    return {x:x*cellSize+board.xGridOffset,y:y*cellSize+board.yGridOffset};
}


let hoveredCard = undefined;

canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    //Hovering over a card
    if(selectedCard === null){
        hoveredCard = getHoveredCard(mouseX,mouseY);
    }
    
    //Drags a placed building
    if(currentScene === "build"){
        if(hoveredBuilding !== null && distanceDragged > 5 && selectedBuilding === null && hoveredBuilding.moveable === true){
            unplaceBuilding(hoveredBuilding);
            selectedBuilding = hoveredBuilding;
            hoveredBuilding = null;
            selectedPlacedBuilding = null;
        }
        if(selectedCard === null){
            if(getHoveredBuilding() && getHoveredBuilding().moveable === true){
                hoveredBuilding = getHoveredBuilding();
                canvas.style.cursor = "grab";
            } else {
                hoveredBuilding = null;
            }
            if(getHoveredBuilding() && getHoveredBuilding().moveable === false){
                canvas.style.cursor = "pointer";
            }
            if(!getHoveredBuilding() && hoveredCard === null && selectedBuilding === null){
                canvas.style.cursor = "default";
            }
        }
    }

    currentMouseX = mouseX;
    currentMouseY = mouseY;

    //Drag logic
    if (startDrag){
        const deltaX = currentMouseX - startDragLocation.x;
        const deltaY = currentMouseY - startDragLocation.y;
        distanceDragged = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    //HitTest Buttons
    buttons.forEach((button) => {
        if(hitTest(mouseX,mouseY,button)){
            button.highlighted = true;
            canvas.style.cursor = "pointer";
        } else {
            button.highlighted = false;
        }
    });
});

let startDragBuilding = false;
let startDrag = false;
let startDragLocation = {x:0,y:0};
let distanceDragged = 0;

canvas.addEventListener('mousedown', function() {
    //HitTest Buttons
    buttons.forEach((button) => {
        if(hitTest(currentMouseX,currentMouseY,button)){
            button.onClick();
        }
    });
    if(currentScene === "build"){
        if(hoveredCard !== undefined && hoveredCard.cost <= totalCredits){
            selectedBuilding = hoveredCard;
            hoveredCard.isDragged = true;
            selectedCard = hoveredCard;
            //remove card from deck
            hand = hand.filter(card => card !== selectedCard);
            setCardPositions();
        }
    }

    startDrag = true;
    startDragLocation.x = currentMouseX;
    startDragLocation.y = currentMouseY;
});

canvas.addEventListener('mouseup', function(event) {

    //Left Click
    if(event.button === 0){
        if (selectedBuilding === null){
            const clickedBuilding = getHoveredBuilding();
            if (clickedBuilding){
                selectedPlacedBuilding = clickedBuilding;
            } else {
                selectedPlacedBuilding = null;
            }
        }
    
        //If there's a building selected try to place it
        if(selectedBuilding !== null){
            // Place the selected shape on the grid
            const gridX = Math.floor((currentMouseX - playerBoard.xGridOffset) / cellSize - Math.floor(selectedBuilding.width/2));
            const gridY = Math.floor((currentMouseY - playerBoard.yGridOffset) / cellSize - Math.floor(selectedBuilding.height/2));
    
            let placementResult = canPlaceBuildingNearest(selectedBuilding, gridX, gridY);
            if (placementResult.canPlace) {
                placeBuilding(selectedBuilding, currentMouseX + placementResult.adjustedX * cellSize, currentMouseY + placementResult.adjustedY * cellSize, playerBoard);
                canvas.style.cursor = "default";
            } else {
                returnBuildingToDeck();
            }
    
            selectedBuilding = null;
        }
    
        //If there's a selected card finish dragging it
        if(selectedCard !== null){
            selectedCard.isDragged = false;
            selectedCard = null;
        }
        distanceDragged = 0;
        startDrag = false;
    }

});

canvas.addEventListener('click', function(e) {
});

document.addEventListener('keydown', function(event) {
    if (selectedBuilding) {
        if (event.key === 'Q' || event.key === 'q') {
            rotateBuilding(selectedBuilding, 'R');
        } else if (event.key === 'E' || event.key === 'e') {
            rotateBuilding(selectedBuilding, 'L');
        }
    }
});

canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Prevent the default context menu
    if (selectedBuilding) {
        rotateBuilding(selectedBuilding, 'R'); // Or 'counterclockwise' based on your preference
    }
});

function returnBuildingToDeck() {
    const arrayIndex = Math.floor(((currentMouseX) / (canvas.width - 50)) * hand.length);
    if (selectedCard === null) {
        selectedCard = selectedBuilding;
    }
    hand.splice(arrayIndex, 0, selectedCard);
    setCardPositions();
    selectedCard.currentPosition.x = currentMouseX;
    selectedCard.currentPosition.y = currentMouseY;

    if(selectedBuilding.placed === true){
        totalCredits += selectedCard.cost;
        updateBoardStats(playerBoard);
        circularizeGrids();
        selectedBuilding.placed = false;
    }
}

function getHoveredBuilding() {
    for (const board of allBoards) {
        // Calculate grid cell coordinates
        const gridX = Math.floor((currentMouseX - board.xGridOffset) / cellSize);
        const gridY = Math.floor((currentMouseY - board.yGridOffset) / cellSize);

        if (gridY < gridHeight && gridX < gridWidth && gridY >= 0 && gridX >= 0 && board.grid[gridY * gridWidth + gridX].occupied) {
            return board.grid[gridY * gridWidth + gridX].building;
        }
    }
    return null;
}


function placeBuilding(building, mouseX, mouseY, board) {
    // Calculate top-left corner for the building and adjust to snap to grid
    const gridX = Math.floor((mouseX - board.xGridOffset) / cellSize) - Math.floor(building.width/2);
    const gridY = Math.floor((mouseY - board.yGridOffset) / cellSize) - Math.floor(building.height/2);
   
    if (canPlaceBuilding(building, gridX, gridY, board)) {
        const newBuilding = JSON.parse(JSON.stringify(building));
        newBuilding.uid = Math.random().toString(36).substring(7);
        newBuilding.x = gridX;
        newBuilding.y = gridY;
        newBuilding.placed = true;
        newBuilding.boardId = board.id;
        board.allPlacedBuildings.push(newBuilding);
        updateBoardStats(board);
        circularizeGrids();

        if(selectedCard !== null){
            totalCredits -= newBuilding.cost;
        }

        //Update grid
        for (let x = 0; x < building.width; x++) {
            for (let y = 0; y < building.height; y++) {
                const cellIndex = (gridY + y) * gridWidth + (gridX + x);
                const shapeKey = building.shape[x + y * building.width];
                //Building
                if (shapeKey >= 1 && shapeKey <= 4) {
                    //add cell effects to building
                    for (let key in board.grid[cellIndex].effects) {
                        for(let key2 in newBuilding.stats){
                            if(key === key2){
                                newBuilding.stats[key] += board.grid[cellIndex].effects[key];
                                if(board.grid[cellIndex].effects[key] > 0){
                                    const newBoostArrow = {...boostArrow};
                                    newBoostArrow.x = (gridX+x)*cellSize+board.xGridOffset+(cellSize/2);
                                    newBoostArrow.y = (gridY+y)*cellSize+board.yGridOffset+(cellSize/2);
                                    arrowGraphics.push(newBoostArrow);
                                }
                            }
                        }
                    }
                    board.grid[cellIndex].occupied = true;
                    board.grid[cellIndex].building = newBuilding;
                    board.grid[cellIndex].shapeKey = shapeKey;
                }
                //Effects
                if (shapeKey > 4) {
                    if(board.grid[cellIndex]){
                        for(let key in newBuilding.effects){
                            //Add effects to existing building stats
                            if(board.grid[cellIndex].occupied && board.grid[cellIndex].building !== undefined){
                                for(let key2 in board.grid[cellIndex].building.stats){
                                    if(key2 === key){
                                        board.grid[cellIndex].building.stats[key] += newBuilding.effects[key];
                                        //Boost graphics
                                        const newBoostArrow = {...boostArrow};
                                        newBoostArrow.x = (gridX+x)*cellSize+board.xGridOffset+(cellSize/2);
                                        newBoostArrow.y = (gridY+y)*cellSize+board.yGridOffset+(cellSize/2);
                                        arrowGraphics.push(newBoostArrow);
                                    }
                                }
                            }
                            //Add effects to cell effects
                            if (board.grid[cellIndex].effects.hasOwnProperty(key)) {
                                board.grid[cellIndex].effects[key] += newBuilding.effects[key];
                            } else {
                                board.grid[cellIndex].effects[key] = newBuilding.effects[key];
                            }
                        }
                    }
                }
            }
        }
        updateBoardStats(board);
    } else {
        console.log(building);
        return false;
    }
}

const boostArrow = {x:50,y:50,alpha:1,lifeTime:180,velocity:.2};
const arrowGraphics = [];
function boostedAnimation(){
    arrowGraphics.forEach((arrow) => {
        arrow.lifeTime --;
        arrow.alpha *= 0.98;
        arrow.y -= arrow.velocity;
        arrow.velocity *= .98;
        ctx.globalAlpha = arrow.alpha;
        drawArrow(arrow.x,arrow.y,5,5,"#a3f560")

        if(arrow.lifeTime <= 0){
            arrowGraphics.splice(arrowGraphics.indexOf(arrow),1);
        }
    });
    ctx.globalAlpha = 1;
}

function unplaceBuilding(building){
    const gridX = building.x;
    const gridY = building.y;

    playerBoard.allPlacedBuildings = playerBoard.allPlacedBuildings.filter(obj => obj !== building);
    //Update grid
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const cellIndex = (gridY + y) * gridWidth + (gridX + x);
            const shapeKey = building.shape[x + y * building.width];
            
            if (shapeKey >= 1 && shapeKey <= 4) {
                playerBoard.grid[cellIndex].occupied = false; 
                playerBoard.grid[cellIndex].building = null;
                for(let key in building.stats){
                    if(playerBoard.grid[cellIndex].effects.hasOwnProperty(key)){
                        building.stats[key] -= playerBoard.grid[cellIndex].effects[key];
                    }
                }
                playerBoard.grid[cellIndex].shapeKey = 0;
            }
            if (shapeKey > 4) {
                if(playerBoard.grid[cellIndex]){
                    if(playerBoard.grid[cellIndex].occupied && playerBoard.grid[cellIndex].building !== undefined){
                        for(let key in building.effects){
                            for(let key2 in playerBoard.grid[cellIndex].building.stats){
                                if(key2 === key){
                                    playerBoard.grid[cellIndex].building.stats[key] -= building.effects[key];
                                }
                            }
                        }
                    }
                    for(let key in building.effects){
                        if (playerBoard.grid[cellIndex].effects.hasOwnProperty(key)) {
                            playerBoard.grid[cellIndex].effects[key] -= building.effects[key];
                        }
                    }
                }
            }
        }
    }
}

function canPlaceBuilding(building, gridX, gridY, board) {
    for (let x = 0; x < building.width; x++) {
        for (let y = 0; y < building.height; y++) {
            const shapeKey = building.shape[x + y * building.width];
            if (shapeKey >= 1 && shapeKey <= 4) {
                const cellX = gridX + x;
                const cellY = gridY + y;
                // Check bounds and if cell is already occupied
                if (cellX < 0 || cellX >= gridWidth || cellY < 0 || cellY >= gridHeight || board.grid[cellY * gridWidth + cellX].occupied) {
                    return false;
                }
            }
        }
    }
    return true;
}

function drawShadowBuilding(building, mouseX, mouseY) {
    ctx.globalAlpha = 0.5; // Set transparency for the shadow

    // Calculate top-left corner for the building and adjust to snap to grid
    let topLeftX = (Math.floor((mouseX - playerBoard.xGridOffset) / cellSize) - Math.floor(selectedBuilding.width/2)) * cellSize + playerBoard.xGridOffset;
    let topLeftY = (Math.floor((mouseY - playerBoard.yGridOffset) / cellSize) - Math.floor(selectedBuilding.height/2)) * cellSize + playerBoard.yGridOffset;

    // Calculate top-left corner for the building without snapping to grid
    let topLeftXUnquantised = (((mouseX - playerBoard.xGridOffset) / cellSize) - Math.floor(selectedBuilding.width/2)) * cellSize + playerBoard.xGridOffset;
    let topLeftYUnquantised = (((mouseY - playerBoard.yGridOffset) / cellSize) - Math.floor(selectedBuilding.height/2)) * cellSize + playerBoard.yGridOffset;
  
    // Calculate Grid Coordinates
    const gridX = Math.floor((mouseX - playerBoard.xGridOffset) / cellSize)- Math.floor(selectedBuilding.width/2);
    const gridY = Math.floor((mouseY - playerBoard.yGridOffset) / cellSize)- Math.floor(selectedBuilding.height/2);
  
    let placementResult = canPlaceBuildingNearest(building, gridX, gridY);
    if (placementResult.canPlace) {
        drawShadowGraphic(building, topLeftX + placementResult.adjustedX * cellSize, topLeftY + placementResult.adjustedY * cellSize, 1, "#000", true, gridX, gridY);
    } else {
        // If building couldn't be placed in any direction, draw in red without snapping
        drawShadowGraphic(building, topLeftXUnquantised, topLeftYUnquantised, 1, "#F00", false, gridX, gridY);
    }

    ctx.globalAlpha = 1.0; // Reset transparency
}

function canPlaceBuildingNearest(building,gridX,gridY){
    const directions = [[0, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    for (let [dx, dy] of directions) {
        if (canPlaceBuilding(building, gridX + dx, gridY + dy,playerBoard)) {
            return { canPlace: true, adjustedX: dx, adjustedY: dy };
        }
    }
    return { canPlace: false };
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
                const cellX = Math.floor(topLeftX/cellSize)-Math.floor(playerBoard.xGridOffset/cellSize)+x;
                const cellY = Math.floor(topLeftY/cellSize)-Math.floor(playerBoard.yGridOffset/cellSize)+y;
                const cell = playerBoard.grid[cellY * gridWidth + cellX];

                if(cell !== undefined && cell.occupied && cell.building !== undefined){
                    for(let key in building.effects){
                        if(cell.building.stats.hasOwnProperty(key)){
                            ctx.save();
                            ctx.globalAlpha = .8;
                            ctx.fillStyle = "#a3ffdf" // Highlight color
                            ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
                            ctx.restore();
                        }
                    }
                }
                if(cell !== undefined && !cell.occupied){
                    ctx.fillStyle = "#a3ffdf" // Highlight color
                    ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
                }
            } else if(shapeKey > 4 && includeEffects){
                ctx.fillStyle = "#a3ffdf" // Highlight color
                ctx.fillRect(topLeftX + x * cellSize * scale, topLeftY + y * cellSize * scale, cellSize * scale, cellSize * scale);
            }
        }
    }
}

function drawBuildingOutline(building, location, color, width) {
    ctx.strokeStyle = color; // Outline color
    ctx.lineWidth = width; // Outline width

    let offsetX = location.x
    let offsetY = location.y

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
                    ctx.moveTo(offsetX + (x + 1) * cellSize -.5, offsetY + y * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize -.5, offsetY + (y + 1) * cellSize);
                    ctx.stroke();
                }
                if (y === 0 || building.shape[x + (y - 1) * building.width] < 1 || building.shape[x + (y - 1) * building.width] > 4) {
                    // Top edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x * cellSize, offsetY + y * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize -.5, offsetY + y * cellSize);
                    ctx.stroke();
                }
                if (y === building.height - 1 || building.shape[x + (y + 1) * building.width] < 1 || building.shape[x + (y + 1) * building.width] > 4) {
                    // Bottom edge
                    ctx.beginPath();
                    ctx.moveTo(offsetX + x * cellSize, offsetY + (y + 1) * cellSize);
                    ctx.lineTo(offsetX + (x + 1) * cellSize, offsetY + (y + 1) * cellSize );
                    ctx.stroke();
                }
            }
        }
    }
    ctx.lineWidth = 1; // Outline width
}

function rotateBuilding(building, direction = 'R') {
    let newShape = [];
    const { width, height, shape } = building;

    if (direction === 'R') {
        // Transpose and reverse rows for clockwise rotation
        for (let x = 0; x < width; x++) {
            for (let y = height - 1; y >= 0; y--) {
                newShape.push(shape[y * width + x]);
            }
        }
    } else {
        // Transpose and reverse columns for counterclockwise rotation
        for (let x = width - 1; x >= 0; x--) {
            for (let y = 0; y < height; y++) {
                newShape.push(shape[y * width + x]);
            }
        }
    }
    // Update the shape object
    building.shape = newShape;
    building.width = height;
    building.height = width;
}

function drawGrids(){
    allBoards.forEach((board) => {
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                const cellIndex = y * gridWidth + x;
                if(board.grid[cellIndex].visible === true){
                    if (board.grid[cellIndex].occupied) {
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#000"; // Grid line color for unoccupied cells
                        ctx.fillStyle = board.grid[cellIndex].building.color;
                        ctx.fillRect(x * cellSize+board.xGridOffset-.5, y * cellSize+board.yGridOffset-.5, cellSize+.5, cellSize+.5);
                        if(board.grid[cellIndex].building && board.grid[cellIndex].building.destroyed === true){
                            ctx.fillStyle = "#000";
                            ctx.fillRect(x * cellSize+board.xGridOffset-.5, y * cellSize+board.yGridOffset-.5, cellSize+.5, cellSize+.5);
                        }
                        //If cell is a turret draw a circle
                        if(board.grid[cellIndex].shapeKey === 2){
                            //draw circle
                            ctx.beginPath();
                            ctx.arc(x * cellSize+board.xGridOffset+cellSize/2, y * cellSize+board.yGridOffset+cellSize/2, 2, 0, 2 * Math.PI);
                            ctx.strokeStyle = "#000";
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                        if(board.grid[cellIndex].shapeKey === 3){
                            //draw circle
                            ctx.beginPath();
                            ctx.fillStyle = '#000';
                            ctx.arc(x * cellSize+board.xGridOffset+cellSize/2, y * cellSize+board.yGridOffset+cellSize/2, 2, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    } else {
                        ctx.fillStyle = "#1f3a45";
                        ctx.fillRect(x * cellSize+board.xGridOffset-.5, y * cellSize+board.yGridOffset-.5, cellSize+.5, cellSize+.5);
                        ctx.lineWidth = .25;
                        ctx.strokeStyle = "#ccc"; // Grid line color for unoccupied cells
                        ctx.strokeRect(x * cellSize+board.xGridOffset-.5, y * cellSize+board.yGridOffset-.5, cellSize+.5, cellSize+.5);
                    }
                }
            }
        }
    });
}

function createGridWithStructuredNeighbors(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            grid.push({ x, y, occupied: false, neighbors: {},building:undefined,effects:{}});
        }
    }

    // Compute neighbors for each cell
    grid.forEach(cell => {
        cell.visible = true;
        cell.neighbors = getStructuredNeighbors(cell.x, cell.y, width, height, grid);
        cell.shape = 0;
    });
    return grid;
}

function circularizeGrids(){
    const centerX = (gridWidth - 1) / 2;
    const centerY = (gridHeight - 1) / 2;

    allBoards.forEach((board) => {
        const radius = board.stats.radarRange.stat;
        board.grid.forEach(cell => {
            const distanceFromCenter = Math.sqrt(Math.pow(cell.x - centerX, 2) + Math.pow(cell.y - centerY, 2));
            const outsideRadius = distanceFromCenter > radius;
            if(outsideRadius){
                if(cell.occupied === true && cell.building !== undefined){
                    hand.push(cell.building);
                    setCardPositions();
                    cell.building.currentPosition.x = canvas.width/2;
                    cell.building.currentPosition.y = canvas.height/2;
                    totalCredits += cell.building.cost;
                    cell.building.placed = false;
                    unplaceBuilding(cell.building);
                }
                cell.occupied = true;
                cell.visible = false;
                cell.building = undefined;
            } else {
                if(cell.visible === false){
                    cell.occupied = false;
                    cell.visible = true;
                }
            }
        });
    });

}

function getStructuredNeighbors(x, y, width, height, grid) {
    const neighborPositions = {
        topLeft: { dx: -1, dy: -1 },
        top: { dx: 0, dy: -1 },
        topRight: { dx: 1, dy: -1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
        bottomLeft: { dx: -1, dy: 1 },
        bottom: { dx: 0, dy: 1 },
        bottomRight: { dx: 1, dy: 1 }
    };

    const neighbors = {};

    for (const [key, { dx, dy }] of Object.entries(neighborPositions)) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            neighbors[key] = grid[ny * width + nx];
        }
    }

    return neighbors;
}

function drawArrow(centerX,centerY,width,height,color){
    const bodyLength = height; // Adjust body length relative to point length
    const pointLength = height*1.2;

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

    ctx.lineWidth = .5;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = color; // Fill color
    ctx.fill();
    ctx.stroke();

}
