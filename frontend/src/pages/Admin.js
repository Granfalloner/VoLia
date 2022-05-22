import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import * as ethers from 'ethers';
import * as Crypto from '../crypto.js';
import ContractAbi from '../abi/ContractAbi.json';
import { config } from '../config'

const Admin = (props) => {
  const [wallet, setWallet] = useState(undefined);
  const [address, setAddress] = useState(undefined);

  const onConnectWallet = async () => {
    const wallet = await Crypto.connectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    Crypto.loadWallet();
    return Crypto.saveWalletOnChange(setWallet);
  }, []);

  useEffect(() => {
    if (wallet) {
      setAddress(wallet.accounts[0].address);
    }
  }, [wallet]);

  const registerProject = async () => {
    const provider = new ethers.providers.Web3Provider(wallet.provider, 'any');
    const signer = provider.getUncheckedSigner();
    const { USDCAddress, ContractAddress } = config[wallet.chains[0].id];
    const contract = new ethers.Contract(ContractAddress, ContractAbi, signer);
    const tx = await contract.registerProject(address, []);
    alert(JSON.stringify(tx));
  }
  
  return (
    <div>
      <Header wallet={wallet} connectWallet={onConnectWallet} />
      <div className="text-center">
        <label htmlFor="address">Receiver of funds:</label>
        <input id="address" type="text" value={address} onChange={e => setAddress(e.value)} placeholder="Type here" className="mt-16 input w-full max-w-xs" />
        <br />
        <button className="btn mt-6" onClick={registerProject}>Create Project</button>
      </div>
    </div>
  );
};

export default Admin;