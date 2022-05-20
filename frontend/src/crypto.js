import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

const injected = injectedModule();

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
      rpcUrl: `https://mainnet.infura.io/v3/f166e893a30a4b8a9d7f41de03112fa8`, // rpcURL required for wallet balances
    },
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
  return wallets;
}
