const redisClient = require('../db/redis');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const bs58 = require('bs58');

function verifySignatureListener(socket, username) {
    socket.on('verifySignature', async (payload) => {
        try {
            const publicKey = payload.publicKey;
            const signature = payload.signature;
            if (publicKey) {
                const verified = verifySignature(signature, 'Sign this message to connect your wallet.', publicKey);
                if(verified) {
                    const isAlreadyLinked = await redisClient.sIsMember('all_wallets', publicKey);
                    if (isAlreadyLinked) {
                        socket.emit('signatureVerified', {verified: false, message: 'Wallet already linked to an account.'});
                        return;
                    }

                    // Add the public key to the user's profile
                    await redisClient.hSet(`user:${username}`, 'wallet', publicKey);

                    // Add the public key to a set of all wallet addresses
                    await redisClient.sAdd('all_wallets', publicKey);

                    socket.emit('signatureVerified', {verified: true, message: 'Wallet linked successfully!'});
                } else {
                    socket.emit('signatureVerified', {verified: false, message: 'Signature not verified.'});
                }
            } else {
                socket.emit('signatureVerified',  {verified: false, message: 'No public key.'});
            }
        } catch (error) {
            console.error('Error verifying signature:', error);
            socket.emit('signatureVerified', {verified: false, message: 'Error verifying signature'});
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