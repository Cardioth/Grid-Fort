const redisClient = require('../db/redis');
const fetchNFT = require('../solana/fetchNFT');
const fetchNFTsByOwner = require('../solana/fetchNFTsByOwner');
const mintCollection = require('../solana/mintCollection');
const calculateRewards = require('../game/calculateRewards');

function adminListeners(socket, username) {
  socket.on('consoleCommand', async (command) => {
    if(command.startsWith('/')){
      //Admin commands

      // /fetchnftbyowner ownerAddress
      if(command.startsWith('/fetchnftbyowner')){
        const ownerAddress = command.split(' ')[1];
        socket.emit('consoleResponse', 'Fetching NFTs by owner address: ' + ownerAddress);
        try {
          const response = await fetchNFTsByOwner(ownerAddress);
          socket.emit('consoleResponse', response);
        } catch (error) {
          console.error('Error fetching NFT:', error);
        }
      }

      // /fetchnft address
      if(command.startsWith('/fetchnft')) {
        const address = command.split(' ')[1];
        fetchNFT(address).then(response => {
          socket.emit('consoleResponse', response);
        });
      }

      // /mintcollection
      if(command === '/mintcollection'){
        mintCollection();
        console.log('Collection minting function called');
      }

      // /removeallcards - Removes all cards from all users and deletes all cards
      if(command === '/removeallcards'){
        try {
          const users = await redisClient.sMembers('users');
          for (const user of users) {
            await redisClient.del(`user:${user}:cards`);
          }
          console.log('All user to card linkages deleted');

          await redisClient.del('cardID');
          console.log('Card ID incrament deleted');

          await deleteAllCards();
          
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

      // /givecredits credits username
      if(command.startsWith('/givecredits')){
        const commandCredits = command.split(' ')[1];
        const commandUser = command.split(' ')[2];
        if(commandUser !== undefined){
          const currentCredits = await redisClient.hGet(`user:${commandUser}`, 'uniCredits');
          console.log('Gave ', commandCredits, ' credits to ', commandUser);
          await redisClient.hSet(`user:${commandUser}`, { uniCredits: Number(currentCredits) + Number(commandCredits) });
        } else {
          const currentCredits = await redisClient.hGet(`user:${username}`, 'uniCredits');
          console.log('Gave ', commandCredits, ' credits to ', username);
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
        try{
          const users = await redisClient.sMembers('users');
          for(const user of users){
            for(let i = 0; i < commandCount; i++){
              const randomMedals = 40;
              calculateRewards(randomMedals, user, true);
            }
          }
        } catch (error) {
          console.error('Error creating cards for all users:', error);
        }
      }

      // /unlink wallet username
      if(command.startsWith('/unlink')){
        const commandUser = command.split(' ')[1];
        try {
          await redisClient.hSet(`user:${commandUser}`, 'wallet', 'unlinked');
          console.log('Wallet unlinked for', commandUser);
        } catch (error) {
          console.error('Error unlinking wallet:', error);
        }
      }

      // /removeuser username
      if(command.startsWith('/removeuser')){
        const commandUser = command.split(' ')[1];
        try {
          await redisClient.del(`user:${commandUser}`);
          await redisClient.sRem('users', commandUser);
          console.log('User removed:', commandUser);
        } catch (error) {
          console.error('Error removing user:', error);
        }
      }

      // /removeallwallets
      if(command === '/removeallwallets'){
        try {
          const wallets = await redisClient.sMembers('all_wallets');
          for (const wallet of wallets) {
            await redisClient.sRem('all_wallets', wallet);
          }
          console.log('All wallets removed');
        } catch (error) {
          console.error('Error removing all wallets:', error);
        }
      }

      // /removedecks username
      if(command.startsWith('/removedecks')){
        const commandUser = command.split(' ')[1];
        try {
          await redisClient.del(`decks:${commandUser}`);
          console.log('Decks removed for', commandUser);
        } catch (error) {
          console.error('Error removing decks:', error);
        }
      }

      // /deleteuser username
      if (command.startsWith('/deleteuser')) {
        const commandUser = command.split(' ')[1];
        try {
          await redisClient.del(`user:${commandUser}`);
          await redisClient.sRem('users', commandUser);
          await redisClient.del(`decks:${commandUser}`);

          // Delete user cards
          const userCardsKey = `user:${commandUser}:cards`;
          const userCards = await redisClient.sMembers(userCardsKey);
          if (userCards.length > 0) {
            const cardKeys = userCards.map(card => `card:${card}`);
            await redisClient.unlink(cardKeys);
            await redisClient.del(userCardsKey);
          }
          console.log('User deleted:', commandUser);
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      }

      // /createdefaultdecks
      if(command === '/createdefaultdecks'){
        try {
          const users = await redisClient.sMembers('users');
          for (const user of users) {
            await redisClient.hSet(`decks:${user}`, "Default Deck", JSON.stringify(["d5","d4","d3","d2","d1"]));
          }
          console.log('Default decks created for all users');
        } catch (error) {
          console.error('Error creating default decks:', error);
        }
      }

      // /listusers
      if(command === '/listusers'){
        try {
          const users = await redisClient.sMembers('users');
          console.log('Users:', users);
          socket.emit('consoleResponse', response);
        } catch (error) {
          console.error('Error listing users:', error);
        }
      }
    } else {
      //Database commands
      try {
        const response = await redisClient.eval(`return redis.call(${command})`, 0);

        console.log('admin command', command, 'response', response);
        socket.emit('consoleResponse', response);
      } catch (error) {
        socket.emit('error', 'Unable to do console command');
      }
    }
  });
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
    let cursor = '0';
    const batchSize = 100; // You can adjust this size based on your server's capacity

    do {
      // Directly using sendCommand to correctly handle the cursor as a string
      const reply = await redisClient.sendCommand(['SCAN', cursor, 'MATCH', 'card:*', 'COUNT', batchSize.toString()]);
      cursor = reply[0];
      const keys = reply[1].filter(key => key.startsWith('card:'));

      if (keys.length > 0) {
        // Deleting the batch of keys
        const result = await redisClient.unlink(keys);
        console.log(`Deleted ${keys.length} card keys`);
      }
    } while (cursor !== '0');

    console.log('All card keys have been deleted.');
  } catch (error) {
    console.error('Error when trying to delete card keys:', error);
  }
}

exports.adminListeners = adminListeners;