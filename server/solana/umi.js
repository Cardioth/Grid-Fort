const { createUmi, createKeypairFromSecretKey } = require('@metaplex-foundation/umi-bundle-defaults');
const { mplTokenMetadata } = require('@metaplex-foundation/mpl-token-metadata');
const { createSignerFromKeypair, keypairIdentity } = require("@metaplex-foundation/umi");
const bs58 = require('bs58');

//
const umi = createUmi('http://127.0.0.1:8899');
umi.use(mplTokenMetadata());

//
const secretKey = bs58.decode(process.env.SECRET_KEY);
const myKeypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
umi.use(keypairIdentity(myKeypairSigner));

module.exports = umi;