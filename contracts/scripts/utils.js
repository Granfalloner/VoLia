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

async function fastForward(timeDelta, adjust = false, txTimeOffset = 1) {
    // Some txs (e.g., claim) add 1 sec to time in the contract, to match with calc we need to emulate it
    await ethers.provider.send('evm_increaseTime', [timeDelta - (adjust ? txTimeOffset : 0)]);
    await ethers.provider.send('evm_mine');
}

async function setTime(timestamp) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  await ethers.provider.send('evm_mine');
}

exports.deployContract = deployContract;
exports.verifyContract = verifyContract;
exports.fastForward = fastForward;
exports.setTime = setTime;