const redisClient = require('../db/redis');

function getProfileListener(socket, username) {
    socket.on('getProfile', async () => {
      try {
        const profileData = await redisClient.hGetAll(`user:${username}`);
        socket.emit('getProfileResponse', profileData); // Send collection back to the client
      } catch (error) {
        socket.emit('error', 'Unable to fetch profile');
      }
    });
}
exports.getProfileListener = getProfileListener;
