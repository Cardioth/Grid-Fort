const { createCard, convertLevelToBonusStats } = require("./createCard");
const redisClient = require('../db/redis');

async function calculateRewards(medals, username, cardsOnly = false){
    // Define the parameters
    const maxMedals = 50;
    const maxLootBoxes = 6;
    const minLootBoxes = 2;

    // Calculate the level of loot boxes
    const level = Math.min(4, Math.floor(medals / (maxMedals / 4)));

    // Calculate the number of loot boxes
    const lootBoxesCount = Math.floor(minLootBoxes + (level * (maxLootBoxes - minLootBoxes)) / 4);
    let lootLevel = Math.floor(level)+1;

    const allRewards = [];
    const createCardPromises = [];
    
    for(let i = 0; i < lootBoxesCount; i++){
        let rewardType = Math.floor(Math.random() * 2) === 0 ? "cards" : "credits";
        if(cardsOnly){
            rewardType = "cards";
        }

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

        if (rewardType === "cards") {
            const randomBUID = Math.floor(Math.random() * 4) + 1;
      
            // Calculate the probabilities for each card level based on the medal count
            const level4Probability = Math.min(medals / maxMedals, 0.2); // Max 20% chance for level 4
            const level3Probability = Math.min((medals / maxMedals) * 0.3, 0.3); // Max 30% chance for level 3
            const level2Probability = Math.min((medals / maxMedals) * 0.4, 0.4); // Max 40% chance for level 2
      
            // Determine the card level based on the probabilities
            const randomValue = Math.random();
            let cardLevel;
            if (randomValue < level4Probability) {
              cardLevel = 4;
            } else if (randomValue < level4Probability + level3Probability) {
              cardLevel = 3;
            } else if (randomValue < level4Probability + level3Probability + level2Probability) {
              cardLevel = 2;
            } else {
              cardLevel = 1;
            }
      
            const cardDetails = {
              BUID: randomBUID,
              level: cardLevel,
              bStats: convertLevelToBonusStats(cardLevel, randomBUID),
            };
      
            const reward = {
              type: "card",
              card: cardDetails,
            };
      
            allRewards.push(reward);
            createCardPromises.push(createCard(username, cardDetails));
        }
    }

    const createCardsComplete = Promise.all(createCardPromises);

    return {
        rewards: allRewards,
        createCardsComplete,
      };
}

module.exports = calculateRewards;