const redisClient = require('../db/redis.js');

function deleteDeckListener(socket, username) {
    socket.on('deleteDeck', async (deckName) => {
        try {
            await redisClient.hDel(`decks:${username}`, deckName);
            socket.emit('deleteDeckResponse', 'Deck deleted');
        } catch (error) {
            console.error('Error deleting deck:', error);
            socket.emit('deleteDeckResponse', 'Unable to delete deck');
        }
    });
}

exports.deleteDeckListener = deleteDeckListener;