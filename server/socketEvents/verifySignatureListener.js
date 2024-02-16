const redisClient = require('../db/redis');
const {PublicKey} = require('@solana/web3.js');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const bs58 = require('bs58');

function verifySignatureListener(socket, username) {
    socket.on('verifySignature', async (payload) => {
        try {
            const publicKey = payload.publicKey;
            const signature = payload.signature;
            if (publicKey) {
                const verified = await verifySignature(signature, 'Sign this message to connect your wallet.', publicKey);
                if(verified) {
                    // Add the public key to the user's profile
                    await redisClient.hSet(`user:${username}`, 'wallet', publicKey);
                    socket.emit('signatureVerified', true);
                } else {
                    socket.emit('signatureVerified', false);
                }
            } else {
                socket.emit('signatureVerified', false);
            }
        } catch (error) {
            console.error('Error verifying signature:', error);
            socket.emit('signatureVerified', false);
        }
    });

    socket.on('unlinkWallet', async () => {
        try {
            await redisClient.hSet(`user:${username}`, 'wallet', 'unlinked');
            socket.emit('unlinkWalletResponse', true);
        } catch (error) {
            console.error('Error unlinking wallet:', error);
            socket.emit('unlinkWalletResponse', false);
        }
    });
}

function verifySignature(signature, message, publicKey) {
    // Decode the base58 encoded public key and signature
    const publicKeyUint8Array = bs58.decode(publicKey);
    
    // Encode the message as a Uint8Array
    const messageUint8Array = naclUtil.decodeUTF8(message);

    // Verify the signature
    const isVerified = nacl.sign.detached.verify(messageUint8Array, signature, publicKeyUint8Array);

    return isVerified;
}

exports.verifySignatureListener = verifySignatureListener;