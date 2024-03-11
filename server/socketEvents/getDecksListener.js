const redisClient = require('../db/redis.js');
const configData = require('../common/data/config.js');

function getDecksListener(socket, username) {
    socket.on('getDecks', async () => {
        try {            
            const existingDecks = await redisClient.hKeys(`decks:${username}`);
            socket.emit('getDecksResponse', existingDecks);
        } catch (error) {
            console.error('Error fetching decks:', error);
            socket.emit('getDecksResponse', 'Unable to fetch decks');
        }
    });
}

exports.getDecksListener = getDecksListener;