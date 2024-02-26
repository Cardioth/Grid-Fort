const redisClient = require('../db/redis');
const gameConfig = require('../data/config');

function startGameListener(socket, username) {
  socket.on('startGame', async () => {
    try {
      const userData = await redisClient.hGetAll(`user:${username}`);
      const uniCredits = userData.uniCredits;

      // Check if user has enough credits to start game
      if(uniCredits < gameConfig.startGameCost){
        socket.emit('startGameResponse', false);
        return;
      } else {
        if(username !== 'admin') {
          await redisClient.hSet(`user:${username}`, { uniCredits: uniCredits - gameConfig.startGameCost });
        }
        await redisClient.hSet(`game:${username}`, { strikes: 0, medals: 22});

        //deck stuff goes here
        
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
