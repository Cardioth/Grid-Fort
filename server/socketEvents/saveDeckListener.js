const redisClient = require('../db/redis');
const { fetchNFTCards } = require('../solana/fetchNFTCards.js');
const configData = require('../common/data/config.js');

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
            if (!/^[a-zA-Z]+$/.test(deckName)) {
                socket.emit('saveDeckResponse', 'Deck name can only contain letters');
                return;
            }
            
            const existingDecks = await redisClient.hKeys(`decks:${username}`);
            // Check if the user has too many decks
            if(existingDecks.length >= configData.maxDecks){
                socket.emit('saveDeckResponse', 'You have reached the maximum number of decks');
                return;
            }

            // Check if deck with that name already exists for that user
            if (existingDecks.includes(deckName)) {
                socket.emit('saveDeckResponse', 'Deck with that name already exists');
                return;
            }

            // Check if the deck has a valid number of cards
            if (deck.length !== configData.deckSize) {
                socket.emit('saveDeckResponse', 'Deck must have '+configData.deckSize+' cards');
                return;
            }

            // Check if the user has all the cards in the deck
            const userCards = await redisClient.sMembers(`user:${username}:cards`);
            const NFTCards = [];
            for (const card of deck) {
                if(card.length > 35){ //NFT Card
                    NFTCards.push(card);
                    continue;
                }
                if (!userCards.includes(card) && !card.startsWith('d')) {
                    socket.emit('saveDeckResponse', 'You do not have all the cards in the deck');
                    return;
                }
            }
            if(NFTCards.length > 0){
                // Check if the user has all the NFT cards in the deck
                const user = await redisClient.hGetAll(`user:${username}`);
                const userNFTCards = await fetchNFTCards(user);
                const UIDArray = userNFTCards.map(obj => obj.UID);
                for (const card of NFTCards) {
                    if (!UIDArray.includes(card)) {
                        socket.emit('saveDeckResponse', 'You do not have all the NFT cards in the deck');
                        return;
                    }
                }
            }

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