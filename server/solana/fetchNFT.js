const { fetchDigitalAsset } = require("@metaplex-foundation/mpl-token-metadata");
const umi = require('./umi');

async function fetchNFT(address) {
  try {
    const response = await fetchDigitalAsset(umi, address);
    return response;
  } catch (error) {
    console.error('Failed to fetch digital asset:', error);
  }
}

module.exports = fetchNFT;