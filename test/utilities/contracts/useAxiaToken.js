const useAxiaToken = async (contracts = {}) => {
  const AxiaToken = await ethers.getContractFactory("AxiaToken");
  contracts.axiaToken = await AxiaToken.deploy();
  await contracts.axiaToken.deployed();

  return contracts;
};

module.exports = useAxiaToken;
