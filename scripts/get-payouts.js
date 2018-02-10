const fs = require('jsonfile');
const { getRewards, getAccountsAndTotalVoteWeight } = require('./utils/api.js');
const config = require('../config.json');
const path = require('path');
const { calculateRewards, updateRewards, calculateDonations } = require('./utils/lisk.js');
const { getBalanceFile, saveRewards } = require('./utils/file.js');

const getDate = () => {
    const now = new Date();
    const startsOfTheDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );
    return startsOfTheDay.getTime() / 1000;
};

(async () => {
    const data = getBalanceFile();
    const today = getDate(); // Calculate rewards only from start of the day not from execution time
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

    let donations = {};
    if (config.donations) {
        console.log('Calculate donations rewards...');
        donations = calculateDonations(config.donations, reward);
    }

    console.log('Saving data...');
    saveRewards(data, { rewards, donations }, today);
    console.log('Data saved to file.');
})();
