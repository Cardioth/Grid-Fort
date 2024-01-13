async function processInBatches(items, batchSize, batchFunction) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await batchFunction(batch);
    }
}
exports.processInBatches = processInBatches;
