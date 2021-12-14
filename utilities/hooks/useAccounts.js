const { ethers } = require("hardhat");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useAccounts = async () => {
  let accounts = {};
  const signers = await ethers.getSigners();
  accounts.deployer = signers[0];
  accounts.alice = signers[1];
  accounts.bob = signers[2];
  accounts.carol = signers[3];
  accounts.dev = signers[4];
  accounts.liquidityFund = signers[5];
  accounts.communityFund = signers[6];
  accounts.founderFund = signers[7];
  accounts.zero = { address: ZERO_ADDRESS };

  return accounts;
};

module.exports = useAccounts;
