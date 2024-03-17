const redisClient = require('../db/redis.js');
const configData = require('../common/data/config.js');

function getDecksListener(socket, username) {
    socket.on('getDecks', async () => {
        try {            
            const existingDecks = await redisClient.hKeys(`decks:${username}`);
            const deckObjects = [];
            
            for(const deck of existingDecks){
                //get card info for each deck
                const deckData = await redisClient.hGet(`decks:${username}`, deck);
                deckObjects.push({deckName:deck, deckCards: deckData});
            }

            socket.emit('getDecksResponse', deckObjects);
        } catch (error) {
            console.error('Error fetching decks:', error);
            socket.emit('getDecksResponse', 'Unable to fetch decks');
        }
    });
}

exports.getDecksListener = getDecksListener;