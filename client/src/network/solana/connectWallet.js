import { createAlertMessage } from "../createAlertMessage";

// Assuming the user has a Solana wallet extension installed
export const connectWallet = async () => {
    try {
        const { solana } = window;
        console.log(solana);
        if (solana && solana.isPhantom) {
            const response = await solana.connect({ onlyIfTrusted: true });
            console.log(response);
            console.log('Connected with Public Key:', response.publicKey.toString());
            // Proceed with further actions such as signing a message
        } else {
            createAlertMessage('Solana wallet not found');
        }
    } catch (error) {
        console.error(error);
        createAlertMessage('Error connecting to Solana wallet');
    }
};
