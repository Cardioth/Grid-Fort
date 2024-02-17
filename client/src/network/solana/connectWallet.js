import { createAlertMessage } from "../createAlertMessage";
import { signMessage } from "./signWallet";

export const connectWallet = async () => {
    try {
        // Attempt to detect Phantom Wallet
        const phantom = window.solana && window.solana.isPhantom ? window.solana : null;

        // Attempt to detect Solflare Wallet
        const solflare = window.solflare && window.solflare.isSolflare ? window.solflare : null;

        // Select the wallet to connect to
        const wallet = phantom || solflare; // Add other wallets in the priority order

        if (wallet) {
            const response = await wallet.connect(); // 'onlyIfTrusted: false' to show the connect popup
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
