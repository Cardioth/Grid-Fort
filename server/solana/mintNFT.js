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
        key: '6tXuJ5ARg1uh38XHvBaBR4thLq5Gzbq4XBYQaPv8pbu5',
        verified: false,
      },
    }).sendAndConfirm(umi);

    const nft = await fetchNFT(mint.publicKey);  

    if (nft) {
      const verificationResponse = await verifyNftInCollection(mint.publicKey, '6tXuJ5ARg1uh38XHvBaBR4thLq5Gzbq4XBYQaPv8pbu5', 'yYx8LEvyseRHLk4HK4oxfMnziGp74rNX8EZcmfiWuy7', 'yYx8LEvyseRHLk4HK4oxfMnziGp74rNX8EZcmfiWuy7');
      console.log('NFT minting and verification successful:', nft, verificationResponse);
    }

    return nft;
  } catch (error) {
    console.error('Failed to create NFT or fetch digital asset:', error);
  }
}

module.exports = mintNFT;