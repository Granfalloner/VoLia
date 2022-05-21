import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

const injected = injectedModule();

const provider = 'alchemy';
const providersConfig = {
  'alchemy': {
    'mainnet': {
      'URL': 'https://eth-mainnet.alchemyapi.io/v2/z-hCypDgxvXYoS4UI2MDwybCGhCmXUdS'
    },
    'rinkeby': {
      'URL': 'https://eth-rinkeby.alchemyapi.io/v2/C2rgLGUYKWj4ygGCRP4UjHQP2QeoXCep'
    },
  },
  'infura': {
    'mainnet': {
      'URL': 'https://mainnet.infura.io/v3/f166e893a30a4b8a9d7f41de03112fa8'
    }
  }
}

const logo = `
<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="36" height="36" rx="18" fill="#7C3AED"/>
<mask id="mask0_2_148" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
<rect width="36" height="36" rx="18" fill="white"/>
</mask>
<g mask="url(#mask0_2_148)">
</g>
</svg>
`;

export const onboard = Onboard({
  wallets: [injected],
  chains: [
    {
      id: '0x1', // chain ID must be in hexadecimel
      token: 'ETH', // main chain token
      label: 'Ethereum Mainnet',
      rpcUrl: providersConfig[provider]['mainnet']['URL'] // rpcURL required for wallet balances
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Ethereum Rinkeby Testnet',
      rpcUrl: providersConfig[provider]['rinkeby']['URL']
    }
  ],
  appMetadata: {
    name: 'Volia',
    icon: logo,
    logo: logo,
    description: 'Provide volunteers with regular CRYPTO donation',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
});

export async function initWallet() {
  const wallets = await onboard.connectWallet();
  return wallets[0];
}

export async function autoSaveWallet(callback) {
  const walletsSub = onboard.state.select('wallets');

  const { unsubscribe } = walletsSub.subscribe(wallets => {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
    callback?.(connectedWallets[0]);
  });

  return unsubscribe;
}

export async function loadSavedWallet(silent = true) {
  const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets'));

  if (previouslyConnectedWallets && previouslyConnectedWallets[0]) { 
    // Connect the most recently connected wallet (first in the array)
    // return await onboard.connectWallet({ autoSelect: previouslyConnectedWallets[0] });
    
    // You can also auto connect "silently" and disable all onboard modals to avoid them flashing on page load
    return await onboard.connectWallet({
      autoSelect: { label: previouslyConnectedWallets[0], disableModals: silent }
    });
  }
}