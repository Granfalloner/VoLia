const { ethers, network } = require('hardhat');
const utils = require('./utils.js');
const { parseUnits, formatUnits } = ethers.utils;

async function main() {
  const [owner] = await ethers.getSigners();
  console.log('Deploying to: ', network.name);
  console.log('Deploying from: ', owner.address);

  const contract = await utils.deployContract('Samsara');
  console.log('Samsara deployed to:', contract.address);

  let decimals;
  if (network.name === 'rinkeby') {
    USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';
    decimals = 6;
  } else if (network.name === 'mumbai') {
    USDCAddress = '0xe11A86849d99F524cAC3E7A0Ec1241828e332C62';
    decimals = 18;
  }

  if (network.name === 'rinkeby' || network.name === 'mumbai') {
    await (await contract.enableTokens([USDCAddress])).wait();
    console.log('Added token: ', USDCAddress);


    await contract.registerProject(owner.address, USDCAddress, [
      {
        isActive: true,
        amount: parseUnits('50', decimals),
        period: 60 * 60 * 24 * 30
      },
      {
        isActive: true,
        amount: parseUnits('100', decimals),
        period: 60 * 60 * 24 * 30
      },
      {
        isActive: true,
        amount: parseUnits('500', decimals),
        period: 60 * 60 * 24 * 30
      }
    ]);
    console.log('Registered projects: ', 1);

    await contract.registerProject(owner.address, USDCAddress, [
      {
        isActive: true,
        amount: parseUnits('10', decimals),
        period: 60 * 60 * 24 * 7
      },
      {
        isActive: true,
        amount: parseUnits('50', decimals),
        period: 60 * 60 * 24 * 14
      },
      {
        isActive: true,
        amount: parseUnits('150', decimals),
        period: 60 * 60 * 24 * 30
      }
    ]);
    console.log('Registered projects: ', 2);

    await contract.registerProject(owner.address, USDCAddress, [
      {
        isActive: true,
        amount: parseUnits('10', decimals),
        period: 60 * 60 * 24 * 7
      },
      {
        isActive: true,
        amount: parseUnits('50', decimals),
        period: 60 * 60 * 24 * 14
      },
      {
        isActive: true,
        amount: parseUnits('200', decimals),
        period: 60 * 60 * 24 * 30
      }
    ]);
    console.log('Registered projects: ', 3);

  }

  await new Promise(resolve => setTimeout(resolve, 30_000));
  await utils.verifyContract(contract.address);
  console.log('Samsara contract verified');
  console.log('Deploy finished');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });