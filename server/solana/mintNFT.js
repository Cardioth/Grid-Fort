const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft } = require('@metaplex-foundation/mpl-token-metadata');

const umi = require('./umi');
const fetchNFT = require('./fetchNFT');
const verifyNftInCollection = require('./verifyNFT');

async function mintNFT(cardName, uri, userWallet) {
  const mint = generateSigner(umi);

  try {
    const nftCreationResponse = await createNft(umi, {
      mint,
      name: 'Grid Fort Card - ' + cardName,
      uri,
      sellerFeeBasisPoints: percentAmount(5),
      collection: {
        key: '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM',
        verified: false,
      },
    }).sendAndConfirm(umi, {confirm:{commitment: 'finalized'}});
    let nft = await fetchNFT(mint.publicKey);
    if (nft) {
      const verificationResponse = await verifyNftInCollection(nft.metadata.publicKey, '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM', umi.payer);
    }
    nft = await fetchNFT(mint.publicKey);
    return nft;
  } catch (error) {
    console.error('Failed to create NFT or fetch digital asset:', error);
  }
}

module.exports = mintNFT;