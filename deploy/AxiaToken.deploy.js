const AxiaTokenDeploy = async (contracts = {}) => {
  const AxiaToken = await ethers.getContractFactory("AxiaToken");
  contracts.axiaToken = await AxiaToken.deploy();
  await contracts.axiaToken.deployed();
  return contracts;
};

module.exports = AxiaTokenDeploy;
module.exports.tags = ["AxiaTokenDeploy"];
