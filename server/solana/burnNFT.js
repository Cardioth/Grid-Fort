const { burnV1, TokenStandard } = require("@metaplex-foundation/mpl-token-metadata");
const {umi, myKeypairSigner } = require('./umi');

async function burnNFT(mint, owner) {
  try {
    await burnV1(umi, {
      mint,
      authority: myKeypairSigner,
      tokenOwner: owner,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi)
  } catch (error) {
    console.error('Failed to burn NFT:', error);
  }
}

module.exports = burnNFT;