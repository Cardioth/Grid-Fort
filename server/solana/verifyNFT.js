const { verifyCollectionV1 } = require('@metaplex-foundation/mpl-token-metadata');
const umi = require('./umi');

async function verifyNftInCollection(metadata, collectionMint, collectionAuthority) {
  try {
    const transactionSignature = await verifyCollectionV1(umi,{
      metadata,
      collectionMint,
      authority: collectionAuthority,
    }).sendAndConfirm(umi);

    console.log("NFT verification in collection successful", transactionSignature);
    return transactionSignature;
  } catch (error) {
    console.error("Failed to verify NFT in collection", error);
  }
}

module.exports = verifyNftInCollection;