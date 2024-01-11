const { createClient } = require("redis");
require('dotenv').config();

// Create and configure Redis client
const client = createClient({
  url: process.env.REDIS_URL
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.on("connect", () => {
  console.log("DB Connected");
});

// Connect to Redis server
client.connect();

module.exports = client;