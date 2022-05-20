const hre = require("hardhat");

async function deployContract(name, params) {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await (params ? factory.deploy(...params) : factory.deploy());
  await contract.deployed();
  return contract;
}

async function verifyContract(address, params) {
  try {
    await hre.run("verify:verify", {address, constructorArguments: params || []});
  } catch (error) {
    if (error.message.includes("Reason: Already Verified")) {
      console.log("Already verified");
    } else {
      console.error(error);
    }
  }
}

exports.deployContract = deployContract;
exports.verifyContract = verifyContract;