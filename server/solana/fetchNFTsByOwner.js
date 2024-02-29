const { fetchAllDigitalAssetByOwner } = require("@metaplex-foundation/mpl-token-metadata");
const { umi } = require('./umi');

async function fetchAllNFTByOwner(address) {
  try {
    const response = await fetchAllDigitalAssetByOwner(umi, address);
    return response;
  } catch (error) {
    console.error('Failed to fetch digital asset:', error);
  }
}

module.exports = fetchAllNFTByOwner;