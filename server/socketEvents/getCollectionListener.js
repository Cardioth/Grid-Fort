const redisClient = require('../db/redis');
const defaultCards = require('../data/defaultCards');

function getCollectionListener(socket, username) {
    socket.on('getCollection', async () => {
      try {
          let collection = [];
          const uniqueCards = await redisClient.sMembers(`user:${username}:cards`);
          const cardPromises = uniqueCards.map(card => redisClient.hGetAll(`card:${card}`));
          const cardDataArray = await Promise.all(cardPromises);
          const formattedCardDataArray = cardDataArray.map(cardData => ({
              BUID: Number(cardData.BUID),
              bStats: cardData.bStats,
              level: Number(cardData.level)
          }));
          collection = collection.concat(formattedCardDataArray, defaultCards);
          socket.emit('getCollectionResponse', collection); // Send collection back to the client
      } catch (error) {
          socket.emit('error', 'Unable to fetch collection');
      }
    });
}
exports.getCollectionListener = getCollectionListener;
