const { client } = require('./utils/api.js');
const { fromRawLsk } = require('./utils/lisk.js');
const { getSignedTransactionsFile } = require('./utils/file.js');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log('Load signed transactions...');
    const transactions = getSignedTransactionsFile();
    console.log('Start broadcasting.');
    for (let num in transactions) {
        const transaction = transactions[num];
        try {
            const { data } = await client.transactions.broadcast(transaction);
            console.log(
                `Transaction ${transaction.id}: ${
                    data.success
                        ? `Sent ${fromRawLsk(transaction.amount)} LSK to ${transaction.recipientId}.`
                        : data.message
                }`,
            );
            await sleep(1000);
        } catch (error) {
            console.log(error);
        }
    }
})();
