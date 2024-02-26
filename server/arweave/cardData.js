const createCardFromData = require("./createCardFromData");

function createMetadataJson(BUID, level, bStats) {
    const card = createCardFromData({
        level,
        BUID,
        bStats,
    });

    const name = card.name;
    const description = card.description;

    const metadata = {
        name,
        description,
        attributes:[
            {
                "trait_type": "Level",
                "value": level
            },
        ],
        properties: {
            additionalProperties:{
                level,
                BUID,
                bStats,
            },
        },
    };

    // Add the building stats as attributes
    for (const key in card.bStats) {
        if (card.bStats.hasOwnProperty(key)) {
            metadata.attributes.push({
                "trait_type":  camelCaseToTitleCase(key),
                "value": card.bStats[key]
            });
        }
    }

    return JSON.stringify(metadata);
}

function camelCaseToTitleCase(input) {
    return input
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = createMetadataJson;