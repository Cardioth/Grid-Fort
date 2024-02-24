
async function fetchNFT(address) {
  try {
    const response = await fetch('https://api.devnet.solana.com/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "rpd-op-123",
        method: "getAsset",
        params: {
          id: address,
        }
      }),
    });

    return data = await response.json();
  } catch (error) {
    console.error('Failed to fetch digital asset:', error);
  }
}
module.exports = fetchNFT;
