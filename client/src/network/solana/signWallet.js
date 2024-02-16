import { createAlertMessage } from "../createAlertMessage";

export const signMessage = async () => {
    try {
      const { solana } = window;
      if (solana) {
        const message = new TextEncoder().encode('Sign this message to connect your wallet.');
        const signedMessage = await solana.signMessage(message, 'utf-8');
        console.log('Signed Message:', signedMessage);
        // Send the signed message to the server for verification
      } else {
        createAlertMessage('Solana wallet not found');
      }
    } catch (error) {
      console.error('Error signing message:', error);
    }
};