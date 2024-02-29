const fetch = require('node-fetch');

async function fetchDataFromArweave(uri) {
    try {
        const response = await fetch(uri);
        if (response.ok) {
            const json_data = await response.json();
            return json_data;
        } else {
            console.error('Failed to retrieve NFT data from Arweave. Status code:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching NFT data from Arweave:', error);
        return null;
    }
}

module.exports = fetchDataFromArweave;