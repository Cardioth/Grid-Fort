import allBuildings from "../components/buildings";

export let collection = [];

export function setCollection(newCollection){
    newCollection.forEach(card => {
        for (let building in allBuildings) {
            if(allBuildings[building].BUID === card.BUID){
                const newBuilding = JSON.parse(JSON.stringify(allBuildings[building]));
                addBonusesToCard(card.bStats, newBuilding);
                newBuilding.level = card.level;
                collection.push(newBuilding);
            }
        }
    });
}

function mapKey(key) {
    const keyMap = {
        h: 'health',
        kf: 'kineticFirepower',
        ef: 'energyFirepower',
        cc: 'critChance',
        cd: 'critDamage',
        br: 'blastRadius',
        ad: 'ammoDraw',
        fr: 'fireRate',
        es: 'energyStorage',
        er: 'energyResistance',
        a: 'armor',
        as: 'ammoStorage',
        ps: 'powerStorage',
        pd: 'powerDraw',
        rr: 'radarRange',
    };
    return keyMap[key] || key;
}

function addBonusesToCard(bStats, card) {
    bStats.forEach(bonus => {
        const [keyPart, valuePart] = bonus.match(/[a-zA-Z]+|\d+/g);
        const key = mapKey(keyPart);
        const value = parseInt(valuePart, 10);
        if (card.bStats[key]) {
            card.bStats[key] += value;
          } else {
            card.bStats[key] = value;
        }
        //add bonus stats to card stats
        if(card.stats.hasOwnProperty(key)){
            card.stats[key] += value;
        }
    });
}