const { api } = require('lisk-js');
const { fromRawLsk, getTotalVoteWeight } = require('./lisk.js');
const { removeExludedAccounts } = require('./accounts.js');
const config = require('../../config.json');

const network = new api({ testnet: config.isTestnet });

const getRewards = async (start, end) => {
    console.log('Get forging data...');
    const data = await network.sendRequest(
        `delegates/forging/getForgedByAccount?generatorPublicKey=${
            config.delegatePubKey
        }&start=${start}&end=${end}`,
    );
    const reward = fromRawLsk(data.rewards);
    const sharingReward = reward * config.sharedPercent / 100;
    return {
        reward,
        sharingReward,
    };
};

const getAccountsAndTotalVoteWeight = async () => {
    console.log('Get accounts data...');
    const { accounts } = await network.sendRequest(
        `delegates/voters?publicKey=${config.delegatePubKey}`,
    );
    const filteredAccounts = removeExludedAccounts(accounts);
    console.log('Calculate total vote weight...');
    const totalWeight = getTotalVoteWeight(filteredAccounts);
    return {
        accounts: filteredAccounts,
        totalWeight,
    };
};

const getNetHash = () =>
    config.isTestnet
        ? 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba'
        : 'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';

module.exports = {
    getAccountsAndTotalVoteWeight,
    getRewards,
    getNetHash,
};
