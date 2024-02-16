import { createWalletAddressAndUnlinkButton, hideLinkWalletButton } from "../../ui/profileGUI";
import { socket } from "../connect";
import { createAlertMessage } from "../createAlertMessage";

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
        socket.on('signatureVerified', (verified) => {
          if (verified) {
            createAlertMessage('Signature verified');
            createWalletAddressAndUnlinkButton();
            hideLinkWalletButton();
          } else {
            createAlertMessage('Signature not verified');
          }
        });
      } else {
        createAlertMessage('Solana wallet not found');
      }
    } catch (error) {
      console.error('Error signing message:', error);
    }
};