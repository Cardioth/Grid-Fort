const redisClient = require('../db/redis');
const fetchNFT = require('../solana/fetchNFT');
const fetchNFTsByOwner = require('../solana/fetchNFTsByOwner');
const mintCollection = require('../solana/mintCollection');
const mintNFT = require('../solana/mintNFT');
const { createCard } = require('../game/createCard');

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
      
      // /createcard count
      if(command.startsWith('/createcard')){
        const commandCount = command.split(' ')[1];
        for(let i = 0; i < commandCount; i++){
          const randomLevel = Math.floor(Math.random() * 4) + 1;
          const randomBUID = Math.floor(Math.random() * 4) + 1;
          createCard('admin', { BUID: randomBUID, level: randomLevel, bStats: ''});
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