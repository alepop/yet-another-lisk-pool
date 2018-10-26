const { exclude, weightCap } = require("../../config.json");
const { fromRawLsk, toRawLsk } = require("./lisk.js");

const cap = weightCap.sort((a, b) => a > b);

const removeExludedAccounts = accounts =>
  accounts.filter(account => {
    return (
      !(
        Boolean(exclude.weightCap) &&
        fromRawLsk(account.balance) >= exclude.weightCap
      ) && !exclude.addresses.includes(account.address)
    );
  });

const weightCapValidator = balance =>
  cap.reduce(
    (prev, current) =>
      balance <= prev
        ? balance
        : balance >= prev && balance <= current
          ? prev
          : current,
    cap[0]
  );

const accountWeightChanger = account => {
  account.balance = toRawLsk(weightCapValidator(fromRawLsk(account.balance)));
  return account;
};

const validateAccountWeight = accounts =>
  cap.length > 0 ? accounts.map(accountWeightChanger) : accounts;

module.exports = {
  removeExludedAccounts,
  validateAccountWeight
};
