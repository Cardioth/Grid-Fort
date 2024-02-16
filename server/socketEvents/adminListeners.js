const redisClient = require('../db/redis');
const allBuildings = require('../data/buildings');

function adminListeners(socket, username) {
  socket.on('consoleCommand', async (command) => {
    if(command.startsWith('/')){
      //Admin commands

      // /removeallcards - Removes all cards from all users and deletes all cards
      if(command === '/removeallcards'){
        try {
          const users = await redisClient.sMembers('users');
          for (const user of users) {
            await redisClient.del(`user:${user}:cards`);
          }
          console.log('All card links deleted');

          await redisClient.del('cardID');
          console.log('Card ID deleted');

          deleteAllCards();
          console.log('All cards deleted');
          
        } catch (error) {
          console.error('Error removing all cards:', error);
        }
      }

      // /addAllUsernamesToSet - Adds all usernames to the set of all users
      if(command === '/addAllUsernamesToSet'){
        addAllUsernamesToSet();
      }

      // /removeAllUsernamesFromSet - Removes all usernames from the set of all users
      if(command === '/removeAllUsernamesFromSet'){
        try {
          const users = await redisClient.sMembers('users');
          for (const user of users) {
            await redisClient.sRem('users', user);
          }
          console.log('All usernames removed from the set');
        } catch (error) {
          console.error('Error removing all usernames from the set:', error);
        }
      }

      // /addFieldToAllUsers field value
      if(command.startsWith('/addFieldToAllUsers')){
        const field = command.split(' ')[1];
        const value = command.split(' ')[2];
        try {
          const users = await redisClient.sMembers('users');
          for (const user of users) {
            await redisClient.hSet(`user:${user}`, field, value);
          }
          console.log('Field added to all users:', field, value);
        } catch (error) {
          console.error('Error adding field to all users:', error);
        }
      }

      // /createcard BUID level username
      if(command.startsWith('/createcard') && command.startsWith('/createcardallusers') === false){
        const commandBUID = command.split(' ')[1];
        const commandLevel = command.split(' ')[2];
        const commandUser = command.split(' ')[3];
        if(commandUser !== undefined){
          createCard(commandBUID, commandLevel, commandUser);
        } else {
          createCard(commandBUID, commandLevel, username);
        }
      } else {
        socket.emit('error', 'Invalid command');
      }

      // /createrandomcard username count
      if(command.startsWith('/createrandomcard')){
        const commandUser = command.split(' ')[1];
        const commandCount = command.split(' ')[2];
        for(let i = 0; i < commandCount; i++){
          const commandBUID = Math.floor(Math.random() * 4) + 1;
          const commandLevel = Math.floor(Math.random() * 4) + 1;
          if(commandUser !== undefined){
            createCard(commandBUID, commandLevel, commandUser);
          } else {
            createCard(commandBUID, commandLevel, username);
          }
        }
      }

      // /givecredits credits username
      if(command.startsWith('/givecredits')){
        const commandCredits = command.split(' ')[1];
        const commandUser = command.split(' ')[2];
        if(commandUser !== undefined){
          const currentCredits = await redisClient.hGet(`user:${commandUser}`, 'uniCredits');
          console.log('Gave ', currentCredits, ' credits to ', commandUser);
          await redisClient.hSet(`user:${commandUser}`, { uniCredits: Number(currentCredits) + Number(commandCredits) });
        } else {
          const currentCredits = await redisClient.hGet(`user:${username}`, 'uniCredits');
          console.log('Gave ', currentCredits, ' credits to ', username);
          await redisClient.hSet(`user:${username}`, { uniCredits: Number(currentCredits) + Number(commandCredits) });
        }
      }

      // /givecreditsallusers credits
      if (command.startsWith('/givecreditsallusers')) {
        const commandCredits = parseInt(command.split(' ')[1]);
        try {
          const users = await redisClient.sMembers('users'); // Retrieve all user IDs
          for (const user of users) {
            const userKey = `user:${user}`;
            const currentCredits = parseInt(await redisClient.hGet(userKey, 'uniCredits')) || 0;
            await redisClient.hSet(userKey, 'uniCredits', currentCredits + commandCredits);
          }
        } catch (error) {
          console.error('Error giving credits to all users:', error);
        }
      }
      
      // /createcardallusers count
      if(command.startsWith('/createcardallusers')){
        const commandCount = command.split(' ')[1];
        for(let i = 0; i < commandCount; i++){
          const users = await redisClient.sMembers('users');
          users.forEach(async user => {
            const commandBUID = Math.floor(Math.random() * 4) + 1;
            const commandLevel = Math.floor(Math.random() * 4) + 1;
            createCard(commandBUID, commandLevel, user);
          });
        }
      }

    } else {
      //Database commands
      try {
        const response = await redisClient.eval(`return redis.call(${command})`, 0);

        console.log('admin command', command, 'response', response);
        socket.emit('consoleCommandResponse', response);
      } catch (error) {
        socket.emit('error', 'Unable to do console command');
      }
    }
  });
}

async function createCard(BUID, level, username){
  try {
    //Get unique ID
    const uniqueID = await redisClient.incr('cardID');

    //Create card
    await redisClient.hSet(`card:c${uniqueID}`, { BUID, level, bStats: convertLevelToBonusStats(level, BUID)});

    //Add card to user's collection
    await redisClient.sAdd(`user:${username}:cards`, `c${uniqueID}`);

    console.log('Card created:', BUID, level, username);
  } catch (error) {
    console.error('Error creating card:', BUID, level, username, error);
  }
}

function convertLevelToBonusStats(level, BUID) {
  let bStats = [];

  let buildingStats;
  for(const building in allBuildings){
    if(allBuildings[building].BUID === Number(BUID)){
      buildingStats = allBuildings[building].stats;
      break;
    }
  }

  //Do as many times as there are levels
  for(let i = 0; i < level; i++){
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

function statBanned(stat){
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

async function addAllUsernamesToSet() {
  try {
    // Get all keys that match the user hash pattern
    const keys = await redisClient.keys('user:*');

    // Iterate over each key and add the username part to the 'users' set
    for (const key of keys) {
      const username = key.split(':')[1]; // Assuming key format is 'user:username'
      await redisClient.sAdd('users', username);
    }

    console.log('All usernames added to the set.');
  } catch (error) {
    console.error('Error processing user hashes:', error);
  }
}

async function deleteAllCards() {
  try {
    // Get all keys that match the card pattern
    const keys = await redisClient.keys('card:*');

    // Delete each key found
    for (const key of keys) {
      await redisClient.del(key);
    }

    console.log('All card keys deleted.');
  } catch (error) {
    console.error('Error deleting card keys:', error);
  }
}

exports.adminListeners = adminListeners;