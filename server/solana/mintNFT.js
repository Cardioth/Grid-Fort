const { generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createNft, transferV1, TokenStandard } = require('@metaplex-foundation/mpl-token-metadata');
const { umi } = require('./umi');
const fetchNFT = require('./fetchNFT');
const verifyNftInCollection = require('./verifyNFT');

async function mintNFT(cardName, uri, userWallet) {
  const mint = generateSigner(umi);

  try {
    await createNft(umi, {
      mint,
      name: 'Grid Fort Card - ' + cardName,
      uri,
      symbol: 'GFC',
      sellerFeeBasisPoints: percentAmount(5),
      collection: {
        key: '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM',
        verified: false,
      },
    }).sendAndConfirm(umi, {confirm:{commitment: 'finalized'}});
    let nft = await fetchNFT(mint.publicKey);
    if (nft) {
      await verifyNftInCollection(nft.metadata.publicKey, '7XHx2KkBCyw9Q7ExCrbu32J5NqLDfS8yTz3N6hTNqBxM', umi.payer);
    }

    console.log('transferV1', umi.payer.publicKey, userWallet);
    const response = await transferV1(umi, {
      mint,
      authority: umi.payer,
      tokenOwner: umi.payer.publicKey,
      destinationOwner: userWallet,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi, {confirm:{commitment: 'finalized'}});

    console.log('NFT transfered to owner');
    return nft;
  } catch (error) {
    console.error('Failed to create NFT or fetch digital asset:', error);
  }
}

module.exports = mintNFT;