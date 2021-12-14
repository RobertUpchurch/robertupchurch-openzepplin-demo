const { ethers } = require("ethers");

const decimals = (number) => {
  return ethers.utils.parseEther(number.toString());
};

module.exports = decimals;
