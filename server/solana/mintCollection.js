const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft } = require('@metaplex-foundation/mpl-token-metadata');
const umi = require('./umi');

async function mintCollection() {
  try {
    const mint = generateSigner(umi);
    const nftCollectionCreationResponse = await createNft(umi, {
      mint,
      name: 'Gridly Collection',
      uri: 'https://example.com/my-collection.json',
      sellerFeeBasisPoints: percentAmount(5.5),
      isCollection: true,
    }).sendAndConfirm(umi);

    console.log('NFT collection creation successful:', mint.publicKey);
    return nftCollectionCreationResponse;
  } catch (error) {
    console.error('Failed to create NFT collection:', error);
  }
}
module.exports = mintCollection;
