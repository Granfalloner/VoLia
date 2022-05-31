/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require('dotenv').config();
 const {
   API_URL,
   DEPLOYER_PRIVATE_KEY,
   ETHERSCAN_API_KEY,
   COINMARKETCAP_API_KEY,
 } = process.env;
 
 require('@nomiclabs/hardhat-waffle');
 require('@nomiclabs/hardhat-etherscan');
 require('hardhat-gas-reporter');
 
 module.exports = {
   solidity: '0.8.9',
   defaultNetwork: 'hardhat',
   networks: {
     hardhat: {},
     rinkeby: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
     ropsten: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
     mainnet: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
     arbitrum_rinkeby: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
     mumbai: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
     polygon: {
       url: API_URL,
       accounts: [`0x${DEPLOYER_PRIVATE_KEY}`],
     },
   },
   etherscan: {
     apiKey: `${ETHERSCAN_API_KEY}`,
   },
   gasReporter: {
     currency: 'USD',
     coinmarketcap: `${COINMARKETCAP_API_KEY}`,
     gasPrice: 100,
   },
 };