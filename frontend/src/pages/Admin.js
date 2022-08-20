import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import * as ethers from 'ethers';
import * as Crypto from '../crypto.js';
import ContractAbi from '../abi/ContractAbi.json';
import { config } from '../config'
const { parseUnits, formatUnits } = ethers.utils;

const Admin = (props) => {
  const [wallet, setWallet] = useState(undefined);
  const [address, setAddress] = useState('');

  const [price1, setPrice1] = useState(50);
  const [price2, setPrice2] = useState(200);
  const [price3, setPrice3] = useState(500);

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
    const decimals = 6 // all except mumbai (18)
    const tiers = [
      {
        isActive: true,
        amount: parseUnits(`${price1}`, decimals),
        period: 60 * 60 * 24 * 30,
      },
      {
        isActive: true,
        amount: parseUnits(`${price2}`, decimals),
        period: 60 * 60 * 24 * 30,
      },
      {
        isActive: true,
        amount: parseUnits(`${price3}`, decimals),
        period: 60 * 60 * 24 * 30,
      },

    ]
    console.log(address, USDCAddress, tiers)
    try {
      const tx = await contract.registerProject(address, USDCAddress, tiers);
      alert(JSON.stringify(tx));
    } catch (err) {
      alert(JSON.stringify(err));
    }
 }
  
  return (
    <div>
      <Header wallet={wallet} connectWallet={onConnectWallet} />
      <div className="text-center">
        <label htmlFor="address">Receiver of funds:</label>
        <input id="address" type="text" value={address} onChange={e => setAddress(e.value)} placeholder="Type here" className="mt-16 mb-5 input w-full max-w-xs" />
        <br />
        monthly tiers:
        <br />
        <input type="number" value={price1} onChange={e => {setPrice1(e.value)}} placeholder="Price 1" className="input " />
        <input type="number" value={price2} onChange={e => {setPrice2(e.value)}} placeholder="Price 2" className="input " />
        <input type="number" value={price3} onChange={e => {setPrice3(e.value)}} placeholder="Price 3" className="input " />
        <br />
        <button className="btn mt-6" onClick={registerProject}>Create Project</button>
      </div>
    </div>
  );
};

export default Admin;