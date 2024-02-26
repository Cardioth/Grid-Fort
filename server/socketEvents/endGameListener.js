const redisClient = require('../db/redis');
const calculateRewards = require('../game/calculateRewards');

function endGameListener(socket, username) {
  socket.on('endGame', async () => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);

      // Get game data
      const gameData = await redisClient.hGetAll(`game:${username}`);

      const medals = gameData.medals;
      const rewards = await calculateRewards(medals, username);

      await redisClient.del(`game:${username}`);
      socket.emit('endGameResponse', rewards);
    } catch (error) {
      console.error('Error fetching credits:', error);
      socket.emit('error', 'Unable to start game');
    }
  });
}

exports.endGameListener = endGameListener;
