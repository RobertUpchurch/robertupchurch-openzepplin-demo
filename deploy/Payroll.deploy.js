// npx hardhat deploy --network fuji --tags Payroll
const PayrollDeploy = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Payroll", {
    from: deployer,
    args: [process.env.AXIA_TOKEN_ADDRESS],
    log: true,
  });
};

module.exports = PayrollDeploy;
module.exports.tags = ["Payroll"];
