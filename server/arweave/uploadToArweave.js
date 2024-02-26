require('dotenv').config();
const { arweave } = require('./arweave');

async function uploadToArweave(data) {
  const wallet = JSON.parse(process.env.ARWEAVE_WALLET_JSON);
  let transaction = await arweave.createTransaction({ data: data }, wallet);

  transaction.addTag('Content-Type', 'application/json');

  await arweave.transactions.sign(transaction, wallet);
  const response = await arweave.transactions.post(transaction);

  if (response.status === 200) {
    return `https://arweave.net/${transaction.id}`;
  } else {
    console.error('Error uploading to Arweave:', response.status);
    return null;
  }
}

module.exports = uploadToArweave;