const { APIClient } = require("lisk-elements").default;
const { fromRawLsk, getTotalVoteWeight } = require("./lisk.js");
const {
  removeExludedAccounts,
  validateAccountWeight
} = require("./accounts.js");
const config = require("../../config.json");

const node = config.node && `${config.node}:${config.port}`;

const client = config.isTestnet
  ? APIClient.createTestnetAPIClient({ node })
  : APIClient.createMainnetAPIClient({ node });

const getRewards = async (fromTimestamp, toTimestamp) => {
  console.log("Get forging data...");
  // Get delegate address for next request
  const {
    data: [delegate]
  } = await client.delegates.get({ publicKey: config.delegatePubKey });
  const { address } = delegate.account;

  const { data } = await client.delegates.getForgingStatistics(address, {
    fromTimestamp,
    toTimestamp
  });
  const reward = fromRawLsk(data.forged);
  const sharingReward = (reward * config.sharedPercent) / 100;
  return {
    reward,
    sharingReward
  };
};

const getAllVoters = async () => {
  let currentOffset = 0;
  let voters = [];
  let keepGoing = true;

  while (keepGoing) {
    const { data } = await client.voters.get({
      publicKey: config.delegatePubKey,
      limit: 50,
      offset: currentOffset
    });
    voters.push.apply(voters, data.voters);
    if (data.votes <= currentOffset) {
      keepGoing = false;
    } else {
      currentOffset += 50;
    }
  }
  return voters;
};

const getAccountsAndTotalVoteWeight = async () => {
  console.log("Get accounts data...");

  const voters = await getAllVoters();

  console.log(`Found ${voters.length} voters`);

  const filteredAccounts = removeExludedAccounts(voters); // Exlude accounts based on config
  const validatedAccounts = validateAccountWeight(filteredAccounts); // Change accounts weight

  console.log("Calculate total vote weight...");
  const totalWeight = getTotalVoteWeight(filteredAccounts);
  return {
    accounts: filteredAccounts,
    totalWeight
  };
};

module.exports = {
  getAccountsAndTotalVoteWeight,
  getRewards,
  client
};
