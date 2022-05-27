const { ethers, network } = require('hardhat');
const utils = require('./utils.js');

async function main() {
  const [owner] = await ethers.getSigners();
  console.log('Deploying to: ', network.name);
  console.log('Deploying from: ', owner.address);

  const contract = await utils.deployContract('Samsara');
  console.log('Samsara deployed to:', contract.address);

  if (network.name === 'rinkeby') {
    USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';
  } else if (network.name === 'mumbai') {
    USDCAddress = '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747';
  }

  if (network.name === 'rinkeby' || network.name === 'mumbai') {
    await contract.enableTokens([USDCAddress]);
    console.log('Added token: ', USDCAddress);

    await contract.registerProject(owner.address, USDCAddress, [
      {
        isActive: true,
        amount: 200 * 10 ** 6,
        period: 60 * 60 * 24 * 30
      },
      {
        isActive: true,
        amount: 400 * 10 ** 6,
        period: 60 * 60 * 24 * 30
      },
      {
        isActive: true,
        amount: 600 * 10 ** 6,
        period: 60 * 60 * 24 * 30
      }
    ]);
    console.log('Registered projects: ', 1);
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
