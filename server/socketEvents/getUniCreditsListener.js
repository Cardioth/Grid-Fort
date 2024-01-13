const redisClient = require('../db/redis');

function getUniCreditsListener(socket, username) {
  socket.on('getUniCredits', async () => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);
      socket.emit('uniCreditsUpdate', userData.uniCredits); // Send credits back to the client
    } catch (error) {
      socket.emit('error', 'Unable to fetch credits');
    }
  });
}
exports.getUniCreditsListener = getUniCreditsListener;
