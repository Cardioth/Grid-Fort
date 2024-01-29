const cron = require('node-cron');
const redisClient = require('../db/redis');
const { processInBatches } = require('../utils/batchProcess');


cron.schedule('0 * * * *', () => {
    console.log('Credit Gift - Hourly');
    dailyCreditsGift();
});

async function dailyCreditsGift() {
    try {
        const keys = await redisClient.keys('user:*');
        const batchSize = 100;

        await processInBatches(keys, batchSize, updateCreditsForBatch);
    } catch (err) {
        console.error('Error in dailyCreditsGift:', err);
    }
}

async function updateCreditsForBatch(batch) {
    const updatePromises = batch.map(async (key) => {
        const userData = await redisClient.hGetAll(key);
        let uniCredits = parseInt(userData.uniCredits, 10) || 0;

        // Only give credits if they have less than 200
        if (uniCredits < 200) {
            const creditsToAdd = Math.min(100, 200 - uniCredits); // Add only enough credits to reach 200
            uniCredits += creditsToAdd;
            await redisClient.hSet(key, 'uniCredits', uniCredits);
            console.log(`Gave ${creditsToAdd} credits to ${userData.username}, total now: ${uniCredits}`);
        }
    });

    await Promise.all(updatePromises);
}

// export
module.exports = dailyCreditsGift;

