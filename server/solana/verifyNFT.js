const { setAndVerifyCollection } = require('@metaplex-foundation/mpl-token-metadata');
const umi = require('./umi');

async function verifyNftInCollection(mintAddress, collectionAddress, payer, authority) {
console.log("mintAddress: ", mintAddress);
  try {
    const transactionSignature = setAndVerifyCollection({
      mintAddress,
      collectionAddress,
      payer,
      authority,
      connection: umi,
    });

    console.log("NFT verification in collection successful", transactionSignature);
    return transactionSignature;
  } catch (error) {
    console.error("Failed to verify NFT in collection", error);
  }
}

module.exports = verifyNftInCollection;