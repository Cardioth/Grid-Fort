const { createCard, convertLevelToBonusStats } = require("./createCard");
const redisClient = require('../db/redis');

async function calculateRewards(medals, username){
    // Define the parameters
    const maxMedals = 40;
    const maxLootBoxes = 6;
    const minLootBoxes = 2;

    // Calculate the level of loot boxes
    const level = Math.min(4, Math.floor(medals / (maxMedals / 4)));

    // Calculate the number of loot boxes
    const lootBoxesCount = Math.floor(minLootBoxes + (level * (maxLootBoxes - minLootBoxes)) / 4);
    let lootLevel = Math.floor(level)+1;

    const allRewards = [];
    
    for(let i = 0; i < lootBoxesCount; i++){
        const rewardType = Math.floor(Math.random() * 2) === 0 ? "cards" : "credits";


        if(rewardType === "credits"){
            const baseReward = (lootLevel*25);
            const bonusReward = Math.floor(Math.random() * 4) *25;
            const credits = baseReward + bonusReward;
            const reward = {
                type: "credits",
                amount: credits
            }
            const currentCredits = await redisClient.hGet(`user:${username}`, 'uniCredits');
            await redisClient.hSet(`user:${username}`, { uniCredits: Number(currentCredits) + credits });
            allRewards.push(reward);
        }

        if(rewardType === "cards"){
            const levelReducer = Math.random() > 0.5 ? 1 : 0; // 50% chance of reducing lootLevel by 1
            const randomBUID = Math.floor(Math.random() * 4) + 1;
            const cardDetails = { BUID: randomBUID, level: lootLevel-levelReducer, bStats: convertLevelToBonusStats(lootLevel-levelReducer, randomBUID) }
            const reward = {
                type: "card",
                card: cardDetails,
            }
            allRewards.push(reward);

            createCard(username, cardDetails);
        }
    }

    return allRewards;
}

module.exports = calculateRewards;