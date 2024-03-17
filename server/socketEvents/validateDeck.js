const redisClient = require('../db/redis');
const { fetchNFTCards } = require('../solana/fetchNFTCards.js');
const configData = require('../common/data/config.js');


async function validateDeck(deck, username, socket) {
    // Check if the user has all the cards in the deck
    const userCards = await redisClient.sMembers(`user:${username}:cards`);
    const NFTCards = [];
    for (const card of deck) {
        if (card.length > 35) { //NFT Card
            NFTCards.push(card);
            continue;
        }
        if (!userCards.includes(card) && !card.startsWith('d')) {
            socket.emit('saveDeckResponse', 'You do not have all the cards in the deck');
            return false;
        }
    }
    if (NFTCards.length > 0) {
        // Check if the user has all the NFT cards in the deck
        const user = await redisClient.hGetAll(`user:${username}`);
        const userNFTCards = await fetchNFTCards(user);
        const UIDArray = userNFTCards.map(obj => obj.UID);
        for (const card of NFTCards) {
            if (!UIDArray.includes(card)) {
                socket.emit('saveDeckResponse', 'You do not have all the NFT cards in the deck');
                return false;
            }
        }
    }
    return true;
}

exports.validateDeck = validateDeck;
