const defaultStats = {
    armor:0,
    energyResistance:0,
    health:30,
}

const defaultAttackingStats = {
    critChance:10,
    critDamageBonus:50,
    blastRadius:0,
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
    possibleCellTargets:[],
    preferredTarget:["Booster","Weapon","Shield","Radar", "Core"],
}

const allBuildings = { 
    miniArty:{name:"Artillery", class:"Weapon", description:" ",cost:1, width:3, height:2, shape:[0,1,0,1,2,1], color:"#3ca9c8", 
        stats:{kineticFirepower:1, blastRadius:1, ammoStorage:10, fireRate:8}},
    basicLaser:{name:"Basic\nLaser", class:"Weapon", cost:1, width:2, height:2, shape:[1,3,1,0], color:"#5497e3", 
        stats:{energyFirepower:2, powerStorage:15, powerDraw:0.2, fireRate:2}},
    damageBooster:{name:"Damage\nBooster", class:"Booster",cost:2, width:3,height:3,shape:[5,1,5,5,1,5,5,1,5], color:"#487fb6", 
        effects:{energyFirepower:1, kineticFirepower:1}},
    powerStation:{name:"Power\nStation", class:"Booster",cost:3, width:4,height:4,shape:[0,5,5,0,5,3,1,5,5,1,1,5,0,5,5,0], color:"#5497e3", 
        stats:{energyFirepower:1, fireRate:3, powerStorage:30, powerDraw:0.1},effects:{powerStorage:100}},
    ammoStation:{name:"Ammo\nStation", class:"Booster",cost:3, width:4,height:4,shape:[0,5,5,0,5,2,1,5,5,1,1,5,0,5,5,0], color:"#35608a", 
        stats:{kineticFirepower:1, ammoStorage:30, fireRate:12, ammoStorage:50}, effects:{ammoStorage:100}},
    protector:{name:"Protector", class:"Booster",cost:1,  width:2,height:3,shape:[1,5,1,5,2,1], color:"#324d62", 
        stats:{kineticFirepower:1, ammoStorage:15}, 
        effects:{armor:1,energyResistance:1}},
    energyResistance:{name:"Energy\nShield", class:"Shield",cost:2, width:6,height:3,shape:[0,5,5,5,5,0,5,5,1,1,5,5,5,1,1,1,1,5], color:"#546572", 
        effects:{energyResistance:1}},
    radar:{name:"Radar", class:"Radar",cost:2, width:3,height:3,shape:[0,1,0,1,1,1,0,1,0], color:"#546572", 
        stats:{radarRange:2}, effects:{radarRange:2}},
    powerRing:{name:"Power\nRing", class:"Booster", cost:9, width:6, height:6, shape:[0,1,0,0,1,0,1,1,1,1,1,1,0,1,5,5,1,0,0,1,5,5,1,0,1,1,1,1,1,1,0,1,0,0,1,0], color:"#fcc15b", 
        effects:{energyFirepower:5, powerStorage:10}},
    core:{name:"Core", class:"Core",cost:9, width:3,height:3,shape:[1,1,1,1,2,1,1,1,1], color:"#a9bcdb", moveable:false, returnable:false, 
        stats:{kineticFirepower:1,health:30, ammoStorage:1000, fireRate:3}},
    bubbleShield:{name:"Bubble\nShield", class:"Shield",cost:3, width:6,height:6,shape:[0,1,1,1,1,0,1,1,5,5,5,1,1,5,5,5,5,5,5,5,5,5,5,5,1,1,5,5,5,1,1,1,1,1,0,1,1,1,1,0], color:"#546572"
        ,effects:{energyResistance:2}
    },
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

export default allBuildings;