const fs = require('jsonfile');
const { getRewards, getAccountsAndTotalVoteWeight } = require('./utils/api.js');
const config = require('../config.json');
const path = require('path');
const { calculateRewards, updateRewards } = require('./utils/lisk.js');
const { getBalanceFile, saveRewards } = require('./utils/file.js');

(async () => {
    const data = getBalanceFile();
    const today = Math.floor(new Date().getTime() / 1000);
    const { reward, sharingReward } = await getRewards(data.lastpayout, today);

    console.log(
        `Forged: ${reward} LSK from ${new Date(
            data.lastpayout * 1000,
        ).toLocaleString()}`,
    );
    console.log(
        `Sharing ${config.sharedPercent}% with voters: ${sharingReward} LSK`,
    );

    const { accounts, totalWeight } = await getAccountsAndTotalVoteWeight();

    console.log(`Total weight is ${totalWeight} LSK`);
    console.log('Calculate voters rewards...');

    const rewards = calculateRewards(accounts, sharingReward, totalWeight);
    console.log('Saving data...');
    saveRewards(data, rewards, today);
    console.log('Data saved to file.');
})();
