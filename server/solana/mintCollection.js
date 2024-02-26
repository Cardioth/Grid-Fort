const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft } = require('@metaplex-foundation/mpl-token-metadata');
const fetchNFT = require('./fetchNFT');
const umi = require('./umi');

async function mintCollection() {
  try {
    const mint = generateSigner(umi);
    const nftCollectionCreationResponse = await createNft(umi, {
      mint,
      name: 'Test Collection',
      uri: 'https://example.com/my-collection.json',
      sellerFeeBasisPoints: percentAmount(5.5),
      isCollection: true,
    }).sendAndConfirm(umi);

    console.log('NFT collection creation successful:', mint.publicKey);

    const fetchReponse = await fetchNFT(mint.publicKey);

    console.log('NFT collection fetched:', fetchReponse);

    return nftCollectionCreationResponse;
  } catch (error) {
    console.error('Failed to create NFT collection:', error);
  }
}
module.exports = mintCollection;
