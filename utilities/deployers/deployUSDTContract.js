const { ethers } = require("hardhat");

const deployUSDTContract = async (contracts = {}) => {
  const USDT = await ethers.getContractFactory("USDT");
  contracts.usdt = await USDT.deploy();
  await contracts.usdt.deployed();
  return contracts;
};

module.exports = deployUSDTContract;
