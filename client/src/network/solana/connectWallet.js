import { createAlertMessage } from "../createAlertMessage";
import { signMessage } from "./signWallet";

// Assuming the user has a Solana wallet extension installed
export const connectWallet = async () => {
    try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
            const response = await solana.connect();
            localStorage.setItem('solanaPublicKey', response.publicKey.toString());
            createAlertMessage('Solana wallet connected');
            signMessage();
        } else {
            createAlertMessage('Solana wallet not found');
        }
    } catch (error) {
        console.error(error);
        createAlertMessage('Error connecting to Solana wallet');
    }
};
