const { ethers, network } = require('hardhat');
const utils = require('./utils.js');

async function main() {
  const [owner] = await ethers.getSigners();

  const contract = await utils.deployContract('TrustedSubscription');
  console.log('TrustedSubscription deployed to:', contract.address);

  if (network.name === 'rinkeby') {
    const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';
    await contract.addTokens([USDCAddress]);

    await contract.registerProject(owner.address, [
      {
        isActive: true,
        amount: 200 * 10 ** 6,
        period: 60 * 60 * 24 * 30,
        tokenId: 1,
      },
      {
        isActive: true,
        amount: 400 * 10 ** 6,
        period: 60 * 60 * 24 * 30,
        tokenId: 1,
      },
      {
        isActive: true,
        amount: 600 * 10 ** 6,
        period: 60 * 60 * 24 * 30,
        tokenId: 1,
      },
    ]);
  }

  await utils.verifyContract(contract.address);
  console.log('TrustedSubscription verified');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
