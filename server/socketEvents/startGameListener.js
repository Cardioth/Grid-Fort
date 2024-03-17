const redisClient = require('../db/redis');
const gameConfig = require('../data/config');
const { validateDeck } = require('./validateDeck');

function startGameListener(socket, username) {
  socket.on('startGame', async (deckInfo) => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);
      const uniCredits = userData.uniCredits;

      const deck = JSON.parse(await redisClient.hGet(`decks:${username}`, deckInfo.deckName));
      const validDeck = await validateDeck(deck, username, socket);
      if(!validDeck){
        socket.emit('startGameResponse', false);
        return;
      }

      // Check if user has enough credits to start game
      if(uniCredits < gameConfig.startGameCost){
        socket.emit('startGameResponse', false);
        return;
      } else {
        if(username !== 'admin') {
          await redisClient.hSet(`user:${username}`, { uniCredits: uniCredits - gameConfig.startGameCost });
        }
        await redisClient.hSet(`game:${username}`, { strikes: 0, medals: 15, deck: JSON.stringify(deck)});
        
        socket.emit('uniCreditsUpdate', uniCredits - gameConfig.startGameCost);
        socket.emit('startGameResponse', true);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      socket.emit('error', 'Unable to start game');
    }
  });
}

exports.startGameListener = startGameListener;
