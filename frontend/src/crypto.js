import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import gnosisModule from '@web3-onboard/gnosis';
import walletConnectModule from '@web3-onboard/walletconnect';

const injected = injectedModule();

const provider = 'alchemy';
const providersConfig = {
  alchemy: {
    mainnet: {
      URL: 'https://eth-mainnet.alchemyapi.io/v2/z-hCypDgxvXYoS4UI2MDwybCGhCmXUdS',
    },
    rinkeby: {
      URL: 'https://eth-rinkeby.alchemyapi.io/v2/C2rgLGUYKWj4ygGCRP4UjHQP2QeoXCep',
    },
  },
  infura: {
    mainnet: {
      URL: 'https://mainnet.infura.io/v3/f166e893a30a4b8a9d7f41de03112fa8',
    },
  },
};

const logo = `
<svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.14322 22.9786L0.000522614 17.8627L2.57205 15.3046L5.14357 12.7898L7.71509 10.2317L12.8581 15.3479L15.4297 12.7898L10.287 7.67397L12.8574 5.11586L18.0001 0L25.7143 7.67388L20.5712 12.7901L23.1427 15.3049L28.2854 10.189L30.857 12.7471L33.4285 15.3046L36 17.8627L30.857 22.9789L33.3849 25.537L35.9565 28.0944L28.2423 35.7683L25.6708 33.2102L23.1428 30.6521L20.5713 33.2102L25.714 38.326L20.571 43.4422L18.0001 46L10.286 38.3261L15.429 33.2099L12.8575 30.6518L7.71448 35.768L0 28.0938L2.57153 25.5357L5.14322 22.9786ZM7.71474 15.3477L5.14322 17.8625L7.71474 20.4206L10.2863 17.9058L7.71474 15.3477ZM18.0005 5.1156L15.429 7.67371L18.0005 10.2315L20.572 7.67336L18.0005 5.1156ZM18.0005 15.3477L15.429 17.9058L18.0005 20.4206L20.572 17.8625L18.0005 15.3477ZM30.8577 17.8628L28.2861 15.3047L25.7146 17.8628L28.2861 20.4209L30.8577 17.8628ZM28.243 30.6529L30.8145 28.0948L28.2865 25.5367L25.715 28.0948L28.243 30.6529ZM23.1435 25.5371L25.715 22.979L23.1435 20.4209L20.572 22.979L23.1435 25.5371ZM18.0008 40.8843L20.5724 38.3262L18.0008 35.7684L15.4293 38.3266L18.0008 40.8843ZM18.0008 30.6522L20.5724 28.0941L18.0008 25.5364L15.4293 28.0945L18.0008 30.6522ZM12.8581 25.5364L15.4297 22.9783L12.8581 20.4635L10.2866 22.9783L12.8581 25.5364ZM7.71544 30.6522L10.287 28.0941L7.71544 25.536L5.14392 28.0941L7.71544 30.6522Z" fill="#171721"/>
</svg>
`;

const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true });
const gnosis = gnosisModule();
const walletConnect = walletConnectModule();

export const onboard = Onboard({
  wallets: [injected, coinbaseWalletSdk, gnosis, walletConnect],
  chains: [
    {
      id: '0x1', // chain ID must be in hexadecimel
      token: 'ETH', // main chain token
      label: 'Ethereum Mainnet',
      rpcUrl: providersConfig[provider]['mainnet']['URL'], // rpcURL required for wallet balances
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Ethereum Rinkeby Testnet',
      rpcUrl: providersConfig[provider]['rinkeby']['URL'],
    },
  ],
  appMetadata: {
    name: 'Samsara',
    icon: logo,
    logo: logo,
    description: 'Provide volunteers with regular CRYPTO donation',
    /*
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
    */
  },
});

export async function connectWallet() {
  const wallets = await onboard.connectWallet();
  return wallets[0];
}

export async function saveWalletOnChange(setWallet) {
  const walletsSub = onboard.state.select('wallets');

  const { unsubscribe } = walletsSub.subscribe((wallets) => {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWallets)
    );
    setWallet(wallets[0]);
  });

  return unsubscribe;
}

export async function loadWallet() {
  const previouslyConnectedWallets = JSON.parse(
    window.localStorage.getItem('connectedWallets')
  );

  if (previouslyConnectedWallets && previouslyConnectedWallets[0]) {
    return await onboard.connectWallet({
      autoSelect: { label: previouslyConnectedWallets[0], disableModals: true },
    });
  }
}
