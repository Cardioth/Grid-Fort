const fetchAllNFTByOwner = require('./fetchNFTsByOwner.js');
const fetchDataFromArweave = require('../arweave/fetchData.js');

async function fetchNFTCards(user) {
    const allOwnerNFTs = await fetchAllNFTByOwner(user.wallet);
    const nftCardDataArray = [];
    if (allOwnerNFTs.length > 0) {
        await Promise.all(allOwnerNFTs.map(async (nft) => {
            const collection = nft.metadata.collection.value;
            if (collection &&
                collection.key === '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM' &&
                collection.verified === true &&
                nft.metadata.uri.startsWith("https://arweave.net")) {
                const nftData = await fetchDataFromArweave(nft.metadata.uri);
                const properties = nftData.properties.additionalProperties;
                nftCardDataArray.push({
                    BUID: properties.BUID,
                    bStats: properties.bStats,
                    level: properties.level,
                    tradable: true,
                    UID: nft.metadata.mint,
                });
            }
        }));
    }
    return nftCardDataArray;
}
exports.fetchNFTCards = fetchNFTCards;
