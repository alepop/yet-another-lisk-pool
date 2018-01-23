const BigNumber = require('bignumber.js');

BigNumber.config({ ERRORS: false });

const fromRawLsk = value =>
    new BigNumber(value || 0).dividedBy(new BigNumber(10).pow(8)).toFixed();

const toRawLsk = value =>
    new BigNumber(value * new BigNumber(10).pow(8)).round(0).toNumber();

const updatePending = (current, newData) =>
    new BigNumber(current).plus(newData).toFixed();

const getTotalVoteWeight = accounts =>
    fromRawLsk(
        accounts.reduce(
            (acc, { balance }) => acc.plus(balance),
            new BigNumber(0),
        ),
    );

const calculateRewards = (accounts, reward, voteWeight) =>
    accounts.reduce(
        (acc, { address, balance }) =>
            acc.concat({
                address,
                balance: fromRawLsk(balance) * reward / voteWeight,
            }),
        [],
    );

const updateRewards = (data, payouts, date) => {
    payouts.map(({ address, balance }) => {
        const isAddressExist = data.accounts[address];
        if (!isAddressExist) {
            // Add new record
            data.accounts[address] = {
                pending: balance,
            };
        } else {
            // Update exist account
            data.accounts[address] = {
                pending: new BigNumber(data.accounts[address].pending)
                    .plus(balance)
                    .toFixed(),
            };
        }
    });
    data.lastpayout = date;
    return data;
};

module.exports = {
    fromRawLsk,
    toRawLsk,
    updateRewards,
    calculateRewards,
    getTotalVoteWeight,
    updatePending,
};
