const { ethers } = require("hardhat");
const useAccounts = require("../hooks/useAccounts");
const deployUSDTContract = require("./deployUSDTContract");

const deployPropertyContract = async (contracts = {}) => {
  contracts = contracts.usdt ? contracts : await deployUSDTContract(contracts);

  const accounts = await useAccounts();

  const Property = await ethers.getContractFactory("Property");
  contracts.property = await Property.deploy(
    contracts.usdt.address,
    "12345-asdfa",
    accounts.alice.address,
    10000,
    5000,
    10
  );
  await contracts.property.deployed();

  return contracts;
};

module.exports = deployPropertyContract;
