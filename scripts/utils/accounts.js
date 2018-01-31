const { exclude } = require('../../config.json');
const { fromRawLsk } = require('./lisk.js');

const removeExludedAccounts = accounts =>
    accounts.filter(account => {
        return !(Boolean(exclude.weightCap) && fromRawLsk(account.balance) >= exclude.weightCap) &&
            !exclude.addresses.includes(account.address)
    });

module.exports = {
    removeExludedAccounts
}