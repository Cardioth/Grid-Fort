import { createWalletAddressAndUnlinkButton, hideLinkWalletButton } from "../../ui/profileGUI";
import { socket } from "../connect";
import { createAlertMessage } from "../../ui/uiElements/createAlertMessage";

export const signMessage = async () => {
    try {
      const { solana } = window;
      if (solana) {
        const message = new TextEncoder().encode('Sign this message to connect your wallet.');
        const signedMessage = await solana.signMessage(message, 'utf8');
        const publicKey = localStorage.getItem('solanaPublicKey');
        console.log(signedMessage);
        // Send the signed message and public key to the server for verification
        const payload = {
          publicKey: publicKey,
          signature: signedMessage.signature,
        };
        socket.emit('verifySignature', payload);
        socket.on('signatureVerified', (response) => {
            const verified = response.verified;
            const message = response.message;
            createAlertMessage(message, null, 30, true);
            if (verified) {
                createWalletAddressAndUnlinkButton();
                hideLinkWalletButton();
            }
        });
      } else {
        createAlertMessage('Solana wallet not found', null, 30, true);
      }
    } catch (error) {
      console.error('Error signing message:', error);
    }
};