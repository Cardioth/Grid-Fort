const redisClient = require('../db/redis');
const allBuildings = require('../common/buildings');
const createMetadataJson = require('../arweave/cardData');
const uploadToArweave = require('../arweave/uploadToArweave');
const mintNFT = require('../solana/mintNFT');
require('dotenv').config();


async function createCard(username, card) {
    //Get user data
    const user = await redisClient.hGetAll(`user:${username}`);
    //Get unique ID
    const uniqueID = await redisClient.incr('cardID');
    //Create card
    await redisClient.hSet(`card:c${uniqueID}`, card);
    await redisClient.hSet(`card:c${uniqueID}`, 'UID', `c${uniqueID}`);
    //Add card to user's collection
    await redisClient.sAdd(`user:${username}:cards`, `c${uniqueID}`);

    console.log('Card created');

    if(user.wallet !== 'unlinked' && process.env.MINTING === 'true') {
      //Create metadata JSON
      console.log('Creating metadata JSON');
      const cardMetaData = createMetadataJson( card.BUID, card.level, card.bStats);
      //Upload metadata JSON to Arweave
      console.log('Uploading to Arweave');
      const cardURI = await uploadToArweave(cardMetaData); //costs money
      //Mint NFT
      console.log('Minting NFT');
      const nft = await mintNFT(JSON.parse(cardMetaData).name, cardURI, user.wallet);
      console.log('Minting Complete');
      //Delete card from db
      redisClient.del(`card:c${uniqueID}`);
      redisClient.sRem(`user:${username}:cards`, `c${uniqueID}`);
    }
}
exports.createCard = createCard;

function convertLevelToBonusStats(level, BUID) {
  let bStats = [];

  let buildingStats;
  for (const building in allBuildings.default) {
    if (allBuildings.default[building].BUID === Number(BUID)) {
      buildingStats = allBuildings.default[building].stats;
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

exports.convertLevelToBonusStats = convertLevelToBonusStats;

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
