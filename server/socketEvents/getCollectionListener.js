const redisClient = require('../db/redis');
const defaultCards = require('../data/defaultCards');
const fetchAllNFTByOwner = require('../solana/fetchNFTsByOwner');
const fetchDataFromArweave = require('../arweave/fetchData.js');
const burnNFT = require('../solana/burnNFT');

function getCollectionListener(socket, username) {
    socket.on('getCollection', async () => {
        try {
            console.log('Fetching collection for ', username, "...");
            let collection = [];
            const uniqueCards = await redisClient.sMembers(`user:${username}:cards`); // returns an array of unique card IDs. Example: ['c1', 'c2', 'c3']
            const cardPromises = uniqueCards.map(card => redisClient.hGetAll(`card:${card}`)); // returns an array of card data promises.
            const cardDataArray = await Promise.all(cardPromises); // resolves all promises.
            const formattedCardDataArray = cardDataArray.map(cardData => ({ 
                BUID: Number(cardData.BUID),
                bStats: cardData.bStats,
                level: Number(cardData.level),
                tradable: false
            }));

            // Fetch NFT cards
            const user = await redisClient.hGetAll(`user:${username}`);
            if(user.wallet !== 'unlinked') {
                const allOwnerNFTs = await fetchAllNFTByOwner(user.wallet);
                const nftCardDataArray = [];
                if (allOwnerNFTs.length > 0) {
                    await Promise.all(allOwnerNFTs.map(async (nft) => {
                        const collection = nft.metadata.collection.value;
                        if (collection && collection.key === '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM' && collection.verified === true) {
                            if (nft.metadata.uri.startsWith("https://arweave.net")) {
                                const nftData = await fetchDataFromArweave(nft.metadata.uri);
                                const properties = nftData.properties.additionalProperties;
                                nftCardDataArray.push({
                                    BUID: properties.BUID,
                                    bStats: properties.bStats,
                                    level: properties.level,
                                    tradable: true,
                                });
                            }
                        }
                    }));
                }
                collection = collection.concat(nftCardDataArray, formattedCardDataArray, defaultCards);
                socket.emit('getCollectionResponse', collection);
            } else {
                collection = collection.concat(formattedCardDataArray, defaultCards);
                socket.emit('getCollectionResponse', collection);
            }

            
      } catch (error) {
          socket.emit('error', 'Unable to fetch collection', error);
      }
    });
}
exports.getCollectionListener = getCollectionListener;
