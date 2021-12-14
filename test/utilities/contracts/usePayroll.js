const useAxiaToken = require("./useAxiaToken");

const usePayroll = async (contracts = {}) => {
  contracts = contracts.axiaToken ? contracts : await useAxiaToken(contracts);

  const Payroll = await ethers.getContractFactory("Payroll");
  contracts.payroll = await Payroll.deploy(contracts.axiaToken.address);
  await contracts.payroll.deployed();
  return contracts;
};

module.exports = usePayroll;
module.exports.tags = ["PayrollDeploy"];
