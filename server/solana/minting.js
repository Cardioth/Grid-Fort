const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft, fetchDigitalAsset } = require('@metaplex-foundation/mpl-token-metadata');
const umi = require('./umi');

async function mintAndFetchNFT() {
  const mint = generateSigner(umi);
  try {
    const nftCreationResponse = await createNft(umi, {
      mint,
      name: 'My NFT',
      uri: 'https://example.com/my-nft.json',
      sellerFeeBasisPoints: percentAmount(1),
    }).sendAndConfirm(umi);

    const asset = await fetchDigitalAsset(umi, mint.publicKey);
    console.log(asset);
  } catch (error) {
    console.error('Failed to create NFT or fetch digital asset:', error);
  }
}

module.exports = mintAndFetchNFT;