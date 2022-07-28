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
  } else if (network.name === 'polygon') {
    USDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    decimals = 6;
  } else if (network.name === 'mainnet') {
    USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    decimals = 6;
  }

  await (await contract.enableTokens([USDCAddress])).wait();
  console.log('Added token: ', USDCAddress);

  let project1Owner = owner.address;
  let project2Owner = owner.address;
  let project3Owner = owner.address;

  project1Owner = '0x54868733Cdb41Ec03D4c935b9332c3042771981E';
  project2Owner = '0xcec9a2fdBF5fC44d8772E4f2b672d113f3750292';
  project3Owner = '0xb8604241db5fc80be08788cb13dec9ebd58ee3c5';

  const tx1 = await contract.registerProject(project1Owner, USDCAddress, [
    {
      isActive: true,
      amount: parseUnits('50', decimals),
      period: 60 * 60 * 24 * 30,
    },
    {
      isActive: true,
      amount: parseUnits('100', decimals),
      period: 60 * 60 * 24 * 30,
    },
    {
      isActive: true,
      amount: parseUnits('500', decimals),
      period: 60 * 60 * 24 * 30,
    },
  ]);
  await tx1.wait()
  console.log('Registered projects: ', 1);

  const tx2 = await contract.registerProject(project2Owner, USDCAddress, [
    {
      isActive: true,
      amount: parseUnits('10', decimals),
      period: 60 * 60 * 24 * 7,
    },
    {
      isActive: true,
      amount: parseUnits('50', decimals),
      period: 60 * 60 * 24 * 14,
    },
    {
      isActive: true,
      amount: parseUnits('150', decimals),
      period: 60 * 60 * 24 * 30,
    },
  ]);
  await tx2.wait()
  console.log('Registered projects: ', 2);

  await contract.registerProject(project3Owner, USDCAddress, [
    {
      isActive: true,
      amount: parseUnits('10', decimals),
      period: 60 * 60 * 24 * 7,
    },
    {
      isActive: true,
      amount: parseUnits('50', decimals),
      period: 60 * 60 * 24 * 14,
    },
    {
      isActive: true,
      amount: parseUnits('200', decimals),
      period: 60 * 60 * 24 * 30,
    },
  ]);
  console.log('Registered projects: ', 3);

  await new Promise((resolve) => setTimeout(resolve, 30_000));
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
