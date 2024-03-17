const redisClient = require('../db/redis');
const defaultCards = require('../data/defaultCards');
const { fetchNFTCards } = require('../solana/fetchNFTCards.js');

const rateLimitCache = new Map();
const rateLimitDuration = 30 * 1000;

function getCollectionListener(socket, username) {
    socket.on('getCollection', async () => {
        const currentTime = Date.now();
        const lastRequestTime = rateLimitCache.get(username);

        if (lastRequestTime && currentTime - lastRequestTime < rateLimitDuration) {
            console.log('Rate limit exceeded for ', username, ' - getCollectionListener');
            return;
        }

        try {
            rateLimitCache.set(username, currentTime);
            await fetchCollection(username, socket);           
      } catch (error) {
          socket.emit('error', 'Unable to fetch collection', error);
      }
    });
}
exports.getCollectionListener = getCollectionListener;

async function fetchCollection(username, socket) {
    console.log('Fetching collection for', username, "...");
    let collection = [];
    const uniqueCards = await redisClient.sMembers(`user:${username}:cards`); // returns an array of unique card IDs. Example: ['c1', 'c2', 'c3']
    const cardPromises = uniqueCards.map(card => redisClient.hGetAll(`card:${card}`)); // returns an array of card data promises.
    const cardDataArray = await Promise.all(cardPromises); // resolves all promises.
    const formattedCardDataArray = cardDataArray.map(cardData => ({
        BUID: Number(cardData.BUID),
        bStats: cardData.bStats,
        level: Number(cardData.level),
        tradable: false,
        UID: cardData.UID,
    }));

    // Fetch NFT cards
    const user = await redisClient.hGetAll(`user:${username}`);
    if (user.wallet !== 'unlinked') {
        const nftCardDataArray = await fetchNFTCards(user);
        collection = collection.concat(nftCardDataArray, formattedCardDataArray, defaultCards);
        console.log('Fetched collection for', username);
        socket.emit('getCollectionResponse', collection);
    } else {
        collection = collection.concat(formattedCardDataArray, defaultCards);
        console.log('Fetched collection for', username);
        socket.emit('getCollectionResponse', collection);
    }
}

exports.fetchCollection = fetchCollection;
