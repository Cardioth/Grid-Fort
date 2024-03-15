const redisClient = require('../db/redis');
const calculateRewards = require('../game/calculateRewards');
const { fetchCollection } = require('./getCollectionListener');

function endGameListener(socket, username) {
  socket.on('endGame', async () => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);

      // Get game data
      const gameData = await redisClient.hGetAll(`game:${username}`);

      const medals = gameData.medals;
      const { rewards, createCardsComplete } = await calculateRewards(medals, username);
      socket.emit('endGameResponse', rewards);

      await createCardsComplete;
      await fetchCollection(username, socket);

      // Clean up game data
      await redisClient.del(`game:${username}`);
    } catch (error) {
      console.error('Error fetching credits:', error);
      socket.emit('error', 'Unable to start game');
    }
  });
}

exports.endGameListener = endGameListener;
