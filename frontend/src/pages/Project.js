import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';
import * as Crypto from '../crypto.js';
import * as ethers from 'ethers';
import ContractAbi from '../abi/ContractAbi.json';
import ERC20Abi from '../abi/ERC20Abi.json';

const ContractAddress = '0xD21b3Ff5798b876C0bD36C1294c2B937cA03C6C1';
// const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDCAddress = '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926';

const MAX_PERIODS = 3;

const Flow = ({open, setOpen, tier, wallet, token, contract, onConnectWallet}) => {

  const [step, setStep] = useState(1);
  const { name, amount, currency, period } = tier;

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setStep(2)

        if (token) {
          const decimals = await token.decimals();
          const allowance = await token.allowance(wallet.accounts[0].address, ContractAddress);
          if (allowance >= amount * MAX_PERIODS * 10 ** decimals) {
            setStep(3);
          }
        }
      } else {
        setStep(1);
      }
    }
    init();
  }, [wallet, token, amount, currency]);

  const approveAllowance = async (amount) => {
      const decimals = await token.decimals();
      const tx = await token.approve(ContractAddress, amount * 10 ** decimals);
      return tx;
  }

  const subscribe = async (projectId, tierIndex) => {
      const tx = await contract.subscribe(projectId, tierIndex);
      return tx;
  }

  const waitNextStep = async (promise) => {
    try {
      const tx = await promise;
      setStep(step + 1);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  const getStepClasses = (step, position) => {
    let cls = "step";
    if (step > position) {
      cls += " step-primary";
    }
    if (step == position) {
      cls += " step-secondary";
    }
    return cls;
  }

  return (
    <div className={`modal ${open? "modal-open" : ""}`} style={{zIndex: 5}}>
      <div className="modal-box relative">
        <label htmlFor="my-modal-3" onClick={()=>{setOpen(false)}} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h2 className="font-bold text-xl pb-6">{name} - {amount} {currency} / {period}</h2>
        <div>
          <ul className="steps">
            <li className={getStepClasses(step, 1)}>Connect Wallet</li>
            <li className={getStepClasses(step, 2)}>Approve Allowance</li>
            <li className={getStepClasses(step, 3)}>Subscribe</li>
          </ul>

          <div className="mt-16 mb-6 text-center">
          {step == 1 && (<button className="btn" onClick={() => {onConnectWallet()}}>Connect Wallet</button>)}
          {step == 2 && (<button className="btn" onClick={() => {waitNextStep(approveAllowance(amount))}}>Approve Allowance</button>)}
          {step == 3 && (<button className="btn" onClick={() => {waitNextStep(subscribe(1, 1))}}>Subscribe ({amount} {currency} / {period})</button>)}
          </div>
        </div>
      </div>
    </div>
  )
}

const Tier = ({ projectId, tier, wallet, onConnectWallet }) => {

  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [token, setToken] = useState(undefined);
  const [contract, setContract] = useState(undefined);

  const { name, amount, currency, period } = tier;

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const provider = new ethers.providers.Web3Provider(wallet.provider, 'any');
        const signer = provider.getUncheckedSigner();

        const token = new ethers.Contract(USDCAddress, ERC20Abi, signer);
        setToken(token);

        const contract = new ethers.Contract(ContractAddress, ContractAbi, signer);
        setContract(contract);
      } else {
        setToken(undefined);
        setContract(undefined);
      }
    }
    init();
  }, [wallet]);

  const unsubscribe = async () => {
    const tx = await contract.unsubscribe(projectId, wallet.accounts[0].address, tier.tokenId);
    alert(tx.hash);
    return tx;
  }

  return (
    <div className="card card-normal m-w-60 w-60 bg-base-100 shadow-xl flex-auto max-h-96 m-auto ">
      <div className="card-body">
        <h2 className="card-title text-sm font-bold text-center m-auto">
          {name}
        </h2>
        <p className=""></p>
        <div className="text-center text-neutral mb-2 mt-8">
          {amount} {currency} / {period}
        </div>
        <div className="card-actions justify-center">
          {!isSubscribed && <button onClick={()=>{setOpen(true)}} className="btn w-100">Subscribe</button>}
          {isSubscribed && <button onClick={unsubscribe} className="btn btn-secondary w-100">Unsubscribe</button>}
        </div>
        <Flow wallet={wallet} tier={tier} token={token} contract={contract} open={open} setOpen={setOpen} onConnectWallet={onConnectWallet} />
      </div>
    </div>
  );
}

const Project = (props) => {
  const { projectId } = useParams();
  const { title, description, tiers } = projectsData.find(x => x.projectId == projectId);

  const [wallet, setWallet] = useState(undefined);

  const onConnectWallet = async () => {
    const wallet = await Crypto.connectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    Crypto.loadWallet();
    return Crypto.saveWalletOnChange(setWallet);
  }, []);

  return (
    <div>
      <Header wallet={wallet} connectWallet={onConnectWallet} />
      <div style={{ maxWidth: '1000px' }} className="m-auto">
        <div
          className="rounded-lg bg-white mh-64 p-12 mt-8 m-auto"
          style={{
            backgroundImage: 'url("/projectBG.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
            paddingTop: '150px',
          }}
        >
          <div className="font-bold text-lg">{title}</div>
          <div className="mt-4">{description}</div>
        </div>
        <h3 className="mt-8 mb-2 text-xl text-center font-bold">
          Select a membership level
        </h3>
        <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Tier projectId={projectId} tier={tier} wallet={wallet} key={index} onConnectWallet={onConnectWallet} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Project;
