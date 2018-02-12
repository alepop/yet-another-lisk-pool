const axios = require('axios');
const config = require('../config.json');
const { getNetHash } = require('./utils/api.js');
const { fromRawLsk } = require('./utils/lisk.js');
const { getSignedTransactionsFile } = require('./utils/file.js');

const instance = axios.create({
    baseURL: `${config.node}:${config.port}`,
    headers: {
        'Content-Type': 'application/json',
        nethash: getNetHash(),
        version: '1.0.0',
        minVersion: '>=0.9.5',
        port: 1,
    },
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log('Load signed transactions...');
    const transactions = getSignedTransactionsFile();
    console.log('Start broadcasting.');
    for (let num in transactions) {
        const transaction = transactions[num];
        try {
            const { data } = await instance.post('/peer/transactions', {
                transaction,
            });
            console.log(
                `Transaction ${transaction.id}: ${
                    data.success
                        ? `Sent ${fromRawLsk(transaction.amount)} LSK to ${transaction.recipientId}.`
                        : data.message
                }`,
            );
            await sleep(1000);
        } catch (error) {
            console.log(error.message);
        }
    }
})();
