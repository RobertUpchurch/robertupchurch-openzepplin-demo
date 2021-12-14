async function main() {
  const Property = await ethers.getContractFactory("Property");
  const property = await Property.deploy();
  await property.deployed();
  console.log("Property deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });