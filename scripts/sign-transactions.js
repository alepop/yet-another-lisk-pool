const { transaction } = require('lisk-js');
const config = require('../config.json');
const {
    getBalanceFile,
    overideBalanceFile,
    saveSignedTransactions,
} = require('./utils/file.js');
const { toRawLsk } = require('./utils/lisk.js');

const secret = process.argv[2];
const secondSecret = process.argv[3];

const getPayoutAddresses = ({ accounts }) =>
    Object.keys(accounts).filter(
        address => accounts[address].pending > config.minPayout,
    );

const getSignedTransactions = data =>
    data.map(({ address, amount }) =>
        transaction.createTransaction(
            address,
            toRawLsk(amount),
            secret,
            secondSecret,
        ),
    );

const omit = (ids, obj) =>
    Object.keys(obj)
        .filter(id => !ids.includes(id))
        .reduce(
            (acc, id) => ({
                ...acc,
                [id]: obj[id],
            }),
            {},
        );

(async () => {
    const data = getBalanceFile();
    const addressIds = getPayoutAddresses(data);
    const accountsToPay = addressIds.map(id => ({
        address: id,
        amount: data.accounts[id].pending - 0.1,
    }));

    console.log('Sign transactions...');
    const signedTransactions = getSignedTransactions(accountsToPay);
    console.log('Save signed transactions to file...');
    saveSignedTransactions(signedTransactions);
    console.log('Remove signed transactions addresses from balance file');
    const updatedData = omit(addressIds, data.accounts);
    data.accounts = updatedData;
    overideBalanceFile(data);
})();
