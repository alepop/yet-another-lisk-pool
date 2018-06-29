const { APIClient } = require('lisk-elements').default;
const { fromRawLsk, getTotalVoteWeight } = require('./lisk.js');
const { removeExludedAccounts, validateAccauntWeight } = require('./accounts.js');
const config = require('../../config.json');

const node = config.node && `${config.node}:${config.port}`

const client = config.isTestnet ?
    APIClient.createTestnetAPIClient({node}) :
    APIClient.createMainnetAPIClient({node});

const getRewards = async (fromTimestamp, toTimestamp) => {
    console.log('Get forging data...');
    // Get delegate address for next request
    const { data: [ delegate ]} = await client.delegates.get({ publicKey: config.delegatePubKey});
    const { address } = delegate.account;

    const { data } = await client.delegates.getForgingStatistics(address, { fromTimestamp, toTimestamp })
    const reward = fromRawLsk(data.rewards);
    const sharingReward = reward * config.sharedPercent / 100;
    return {
        reward,
        sharingReward,
    };
};

const getAccountsAndTotalVoteWeight = async () => {
    console.log('Get accounts data...');
    const { data: { voters }} = await client.voters.get({publicKey: config.delegatePubKey});

    const filteredAccounts = removeExludedAccounts(voters); // Exlude accounts based on config
    const validatedAccounts = validateAccauntWeight(filteredAccounts); // Change accaunts weight

    console.log('Calculate total vote weight...');
    const totalWeight = getTotalVoteWeight(filteredAccounts);
    return {
        accounts: filteredAccounts,
        totalWeight,
    };
};

module.exports = {
    getAccountsAndTotalVoteWeight,
    getRewards,
    client
};
