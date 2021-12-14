// npx hardhat deploy --network fuji --tags AxiaToken
const AxiaTokenDeploy = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("AxiaToken", {
    from: deployer,
    args: [],
    log: true,
  });
};

module.exports = AxiaTokenDeploy;
module.exports.tags = ["AxiaToken"];
