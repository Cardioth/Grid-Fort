const redisClient = require('../db/redis');
const configData = require('../common/data/config.js');
const { validateDeck } = require('./validateDeck.js');

function saveDeckListener(socket, username) {
    socket.on('saveDeck', async (deckInfo) => {
        try {
            const deck = deckInfo.deck;
            const deckName = deckInfo.name;

            // Check if the deck has a valid name
            if (deckName.length > 20) {
                socket.emit('saveDeckResponse', 'Deck name is too long');
                return;
            }
            if (deckName.length < 1) {
                socket.emit('saveDeckResponse', 'Deck name is too short');
                return;
            }
            if (!/^[a-zA-Z ]+$/.test(deckName)) {
                socket.emit('saveDeckResponse', 'Deck name can only contain letters');
                return;
            }
            
            const existingDecks = await redisClient.hKeys(`decks:${username}`);
            // Check if the user has too many decks
            if(existingDecks.length >= configData.maxDecks){
                socket.emit('saveDeckResponse', 'You have reached the maximum number of decks');
                return;
            }

            // Check if the deck has the correct number of cards
            if (deck.length < configData.deckSize) {
                socket.emit('saveDeckResponse', `Deck must have at least ${configData.deckSize} cards`);
                return;
            }

            // Check if deck with that name already exists for that user
            if (existingDecks.includes(deckName)) {
                socket.emit('saveDeckResponse', 'Deck with that name already exists');
                return;
            }

            const validDeck = await validateDeck(deck, username, socket);
            if(!validDeck) return;

            // Save the deck
            await redisClient.hSet(`decks:${username}`, deckName, JSON.stringify(deck));
            socket.emit('saveDeckResponse', 'Deck saved successfully');
        } catch (error) {
            console.error('Error saving deck:', error);
            socket.emit('saveDeckResponse', 'Unable to save deck');
        }
    });
}

exports.saveDeckListener = saveDeckListener;