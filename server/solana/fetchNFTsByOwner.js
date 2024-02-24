async function fetchNFTsByOwner(ownerAddress) {
  try {
    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'; // Constant for the SPL Token program
    const response = await fetch('https://api.devnet.solana.com/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          ownerAddress,
          {
            programId: TOKEN_PROGRAM_ID
          },
          {
            encoding: "jsonParsed" 
          }
        ]
      }),
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Failed to fetch NFTs:', error);
  }
}
module.exports = fetchNFTsByOwner;
