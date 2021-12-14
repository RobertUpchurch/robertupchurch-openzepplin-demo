const AxiaTokenDeploy = require("./AxiaToken.deploy");

const PayrollDeploy = async (contracts = {}) => {
  contracts = contracts.axiaToken
    ? contracts
    : await AxiaTokenDeploy(contracts);

  const Payroll = await ethers.getContractFactory("Payroll");
  contracts.payroll = await Payroll.deploy(contracts.axiaToken.address);
  await contracts.payroll.deployed();
  return contracts;
};

module.exports = PayrollDeploy;
module.exports.tags = ["PayrollDeploy"];
