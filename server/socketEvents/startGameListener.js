const redisClient = require('../db/redis');
const gameConfig = require('../data/config');
const { validateDeck } = require('./validateDeck');
const configData = require('../common/data/config.js');

function startGameListener(socket, username) {
  socket.on('startGame', async (deckInfo) => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);
      const uniCredits = userData.uniCredits;

      // Check if user has enough credits to start game
      if(uniCredits < gameConfig.startGameCost){
        socket.emit('startGameResponse', "Insufficient credits to start game");
        return;
      }

      // Check if user has a deck with the given name
      const deck = JSON.parse(await redisClient.hGet(`decks:${username}`, deckInfo.deckName));
      const validDeck = await validateDeck(deck, username, socket);
      if(!validDeck){
        socket.emit('startGameResponse', "Invalid deck selected");
        return;
      }

      // Shuffle deck
      deck.sort(() => Math.random() - 0.5); 

      // Deduct credits from user
      if(username !== 'admin') {
        await redisClient.hSet(`user:${username}`, { uniCredits: uniCredits - gameConfig.startGameCost });
      }

      // Set game data for user
      await redisClient.hSet(`game:${username}`, { strikes: 0, medals: 0, deck: JSON.stringify(deck), state: 'startup'});
      
      socket.emit('uniCreditsUpdate', uniCredits - gameConfig.startGameCost);
      socket.emit('startGameResponse', "success");

      socket.once('getDraft', () => {
        socket.emit('getDraftResponse', deck.slice(0, configData.draftSize));
      });

    } catch (error) {
      console.error('Error fetching credits:', error);
      socket.emit('error', 'Unable to start game');
    }
  });
}

exports.startGameListener = startGameListener;
