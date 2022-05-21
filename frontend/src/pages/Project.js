import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';
import * as Crypto from '../crypto.js';


const approveABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
]

const Flow = ({open, setOpen, tier, wallet, onConnectWallet}) => {

  const [step, setStep] = useState(1);
  const { name, amount, currency, period } = tier;

  useEffect(() => {
    setStep(wallet ? 2 : 1)
  }, [wallet]);


  const approveAllowance = async () => {
      const provider = new ethers.providers.Web3Provider(wallet.provider, 'any')

      const contract = new ethers.Contract(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        approveABI,
        provider.getUncheckedSigner()
      )

      await contract.approv
  }

  return (
    <div className={`modal ${open? "modal-open" : ""}`} style={{zIndex: 5}}>
      <div className="modal-box relative">
        <label htmlFor="my-modal-3" onClick={()=>{setOpen(false)}} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
        <h2 className="font-bold text-xl pb-6">{name} - {amount} {currency} / {period}</h2>
        <div>
          <ul className="steps">
            <li className={"step " + (step > 1 ? "step-primary" : "")}>Connect Wallet</li>
            <li className={"step " + (step > 2 ? "step-primary" : "")}>Approve Allowance</li>
            <li className={"step " + (step > 3 ? "step-primary" : "")}>Subscribe</li>
          </ul>

          <div className="mt-16 mb-6 text-center">
          {step == 1 && (<button className="btn" onClick={onConnectWallet}>Connect Wallet</button>)}
          {step == 2 && (<button className="btn">Approve Allowance</button>)}
          {step == 3 && (<button className="btn">Subscribe ({amount} {currency} / {period})</button>)}
          </div>
        </div>
      </div>
    </div>
  )
}

const Tier = ({ tier, wallet, onConnectWallet }) => {

  const [open, setOpen] = useState(false);

  const { name, amount, currency, period } = tier;

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
          <button onClick={()=>{setOpen(true)}} className="btn w-100">Subscribe</button>
        </div>
        <Flow wallet={wallet} tier={tier} open={open} setOpen={setOpen} onConnectWallet={onConnectWallet} />
      </div>
    </div>
  );
}

const Project = (props) => {
  const { projectID } = useParams();
  const { title, description, tiers } = projectsData[projectID];

  const [wallet, setWallet] = useState(undefined);

  const onConnectWallet = async () => {
    const wallet = await Crypto.connectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    Crypto.loadWallet();
    return Crypto.saveWalletOnChange(setWallet);
  }, []);

  console.log(wallet)

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
            <Tier tier={tier} wallet={wallet} key={index} onConnectWallet={onConnectWallet} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Project;
