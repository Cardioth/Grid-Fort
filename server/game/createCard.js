const redisClient = require('../db/redis');
const allBuildings = require('../data/buildings');


async function createCard(username, level = Math.floor(Math.random() * 4) + 1, BUID = Math.floor(Math.random() * 4) + 1) {
    // If username is linked to a wallet create NFT of Card

    //Get unique ID
    const uniqueID = await redisClient.incr('cardID');

    //Create card
    await redisClient.hSet(`card:c${uniqueID}`, { BUID, level, bStats: convertLevelToBonusStats(level, BUID) });

    //Add card to user's collection
    await redisClient.sAdd(`user:${username}:cards`, `c${uniqueID}`);

    //console.log('Card created:', BUID, level, username);
   
    const card = { BUID, level, bStats: convertLevelToBonusStats(level, BUID) };

    //Create NFT of Card

    return card;
}
exports.createCard = createCard;

function convertLevelToBonusStats(level, BUID) {
  let bStats = [];

  let buildingStats;
  for (const building in allBuildings) {
    if (allBuildings[building].BUID === Number(BUID)) {
      buildingStats = allBuildings[building].stats;
      break;
    }
  }

  //Do as many times as there are levels
  for (let i = 0; i < level; i++) {
    //pick random stat to increase
    const statKeys = Object.keys(buildingStats);

    // exclude banned stats
    const filteredStatKeys = statKeys.filter(stat => !statBanned(stat));

    // pick random stat from filtered list
    const randomStat = filteredStatKeys[Math.floor(Math.random() * filteredStatKeys.length)];

    //Add stat to bStats
    bStats.push(mapBonus(randomStat));
  }

  //Return bStats as string
  return bStats.join('/');
}

function statBanned(stat) {
  const bannedStats = [
    'windUpTime',
  ];
  return bannedStats.includes(stat);
}

function mapBonus(value) {
  const bonusMap = {
    'health': 'h10',
    'kineticFirepower': 'kf1',
    'energyFirepower': 'ef1',
    'critChance': 'cc5',
    'critDamageBonus': 'cd10',
    'blastRadius': 'br1',
    'ammoDraw': 'ad1',
    'fireRate': 'fr1',
    'energyStorage': 'es100',
    'energyResistance': 'er1',
    'armor': 'a1',
    'ammoStorage': 'as50',
    'powerStorage': 'ps100',
    'powerDraw': 'pd1',
    'radarRange': 'rr1',
  };
  return bonusMap[value] || value;
}
