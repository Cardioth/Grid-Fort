const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft } = require('@metaplex-foundation/mpl-token-metadata');

const umi = require('./umi');
const fetchNFT = require('./fetchNFT');
const verifyNftInCollection = require('./verifyNFT');

async function mintNFT() {
  const mint = generateSigner(umi);

  try {
    const nftCreationResponse = await createNft(umi, {
      mint,
      name: 'Basic Laser Test',
      uri: 'https://test.com/basic-laser.json',
      sellerFeeBasisPoints: percentAmount(1),
      collection: {
        key: '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM',
        verified: false,
      },
    }).sendAndConfirm(umi, {confirm:{commitment: 'finalized'}});
    const nft = await fetchNFT(mint.publicKey);
    if (nft) {
      const verificationResponse = await verifyNftInCollection(nft.metadata.publicKey, '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM', umi.payer);
    }
    return nft.metadata;
  } catch (error) {
    console.error('Failed to create NFT or fetch digital asset:', error);
  }
}

module.exports = mintNFT;