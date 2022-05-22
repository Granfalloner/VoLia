import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';
import * as Crypto from '../crypto.js';
import * as ethers from 'ethers';
import ContractAbi from '../abi/ContractAbi.json';
import ERC20Abi from '../abi/ERC20Abi.json';
import { config } from '../config';

const MAX_PERIODS = 3;

const Flow = ({
  projectId,
  open,
  setOpen,
  tier,
  wallet,
  token,
  contract,
  onConnectWallet,
  onSubscribe,
}) => {
  const [step, setStep] = useState(1);
  const { name, amount, currency, period, tierIndex } = tier;

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setStep(2);

        if (token) {
          const decimals = await token.decimals();
          const { ContractAddress } = config[wallet.chains[0].id];
          const allowance = await token.allowance(
            wallet.accounts[0].address,
            ContractAddress
          );
          console.log('allowance=', allowance.toNumber());
          if (
            allowance.toNumber() >=
            amount * (MAX_PERIODS / 2) * 10 ** decimals
          ) {
            setStep(3);
          }
        }
      } else {
        setStep(1);
      }
    };
    init();
  }, [wallet, token, amount, currency, open]);

  const approveAllowance = async (amount) => {
    const decimals = await token.decimals();
    const { ContractAddress } = config[wallet.chains[0].id];
    const tx = await token.approve(
      ContractAddress,
      amount * MAX_PERIODS * 10 ** decimals
    );
    return tx;
  };

  const subscribe = async (projectId, tierIndex) => {
    const tx = await contract.subscribe(projectId, tierIndex);
    onSubscribe(tx);
    setOpen(false);
    return tx;
  };

  const waitNextStep = async (promise) => {
    try {
      const tx = await promise;
      setStep(step + 1);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  };

  const getStepClasses = (step, position) => {
    let cls = 'step';
    if (step > position) {
      cls += ' step-primary';
    }
    if (step == position) {
      cls += ' step-secondary';
    }
    return cls;
  };

  return (
    <div className={`modal ${open ? 'modal-open' : ''}`} style={{ zIndex: 5 }}>
      <div className="modal-box relative">
        <label
          htmlFor="my-modal-3"
          onClick={() => {
            setOpen(false);
          }}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </label>
        <h2 className="font-bold text-xl pb-6">
          {name} - {amount} {currency} / {period}
        </h2>
        <div>
          <ul className="steps">
            <li className={getStepClasses(step, 1)}>Connect Wallet</li>
            <li className={getStepClasses(step, 2)}>Approve Allowance</li>
            <li className={getStepClasses(step, 3)}>Subscribe</li>
          </ul>

          <div className="mt-16 mb-6 text-center">
            {step == 1 && (
              <button
                className="btn"
                onClick={() => {
                  onConnectWallet();
                }}
              >
                Connect Wallet
              </button>
            )}
            {step == 2 && (
              <button
                className="btn"
                onClick={() => {
                  waitNextStep(approveAllowance(amount));
                }}
              >
                Approve Allowance
              </button>
            )}
            {step == 3 && (
              <button
                className="btn"
                onClick={() => {
                  waitNextStep(subscribe(projectId, tierIndex));
                }}
              >
                Subscribe ({amount} {currency} / {period})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tier = ({ projectId, tier, wallet, onConnectWallet }) => {
  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [numSubscribed, setNumSubscribed] = useState(undefined);
  const [pendingTx, setPendingTx] = useState(undefined);
  const [token, setToken] = useState(undefined);
  const [contract, setContract] = useState(undefined);

  const { name, amount, currency, period } = tier;

  const initSubStatus = async () => {
    if (wallet && contract && tier) {
      const { address } = wallet.accounts[0];
      const isSub = await contract.isSubscribed(
        projectId,
        tier.tierIndex,
        address
      );

      const numSub = await contract.numberOfSubscribersInTier(
        projectId,
        tier.tierIndex
      );

      setIsSubscribed(isSub);
      setNumSubscribed(numSub.toNumber());
    }
  };

  useEffect(() => {
    initSubStatus();
  }, [wallet, contract, tier]);

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const provider = new ethers.providers.Web3Provider(
          wallet.provider,
          'any'
        );
        const signer = provider.getUncheckedSigner();

        const { USDCAddress, ContractAddress } = config[wallet.chains[0].id];

        const token = new ethers.Contract(USDCAddress, ERC20Abi, signer);
        setToken(token);

        const contract = new ethers.Contract(
          ContractAddress,
          ContractAbi,
          signer
        );
        setContract(contract);
      } else {
        setToken(undefined);
        setContract(undefined);
      }
    };
    init();
  }, [wallet]);

  const unsubscribe = async () => {
    const tx = await contract.unsubscribe(
      projectId,
      wallet.accounts[0].address
    );
    setPendingTx(tx.hash);
    tx.wait().then(() => {
      initSubStatus();
      setPendingTx(undefined);
    });
    return tx;
  };

  const onSubscribe = async (tx) => {
    setPendingTx(tx.hash);
    tx.wait().then(() => {
      initSubStatus();
      setPendingTx(undefined);
    });
  };

  return (
    <div className="card card-normal m-w-60 w-60 bg-base-100 shadow-xl flex-auto max-h-96 m-auto ">
      <div className="card-body">
        <h2 className="card-title text-sm font-bold text-center m-auto">
          {name}
        </h2>
        <div className="text-center text-neutral mb-2 mt-0">
          {amount} {currency} / {period}
        </div>
        {numSubscribed != undefined && (
          <p className="text-sm text-center mb-2">
            🧍{numSubscribed} subscribers
          </p>
        )}
        <div className="card-actions justify-center">
          {!isSubscribed && (
            <button
              onClick={() => {
                setOpen(true);
              }}
              disabled={!!pendingTx}
              className="btn w-100"
            >
              Subscribe
            </button>
          )}
          {isSubscribed && (
            <button
              onClick={unsubscribe}
              disabled={!!pendingTx}
              className="btn btn-secondary w-100"
            >
              Unsubscribe
            </button>
          )}
        </div>
        {pendingTx && (
          <div className="text-sm text-secondary truncate">
            Pending tx: {pendingTx}
          </div>
        )}
        <Flow
          projectId={projectId}
          wallet={wallet}
          tier={tier}
          token={token}
          contract={contract}
          open={open}
          setOpen={setOpen}
          onConnectWallet={onConnectWallet}
          onSubscribe={onSubscribe}
        />
      </div>
    </div>
  );
};

const Project = (props) => {
  const { projectId } = useParams();
  const { title, description, tiers, image } = projectsData.find(
    (x) => x.projectId == projectId
  );

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
            paddingTop: '50px',
          }}
        >
          <div className="avatar">
            <div className="w-28 rounded">
              <img src={image} />
            </div>
          </div>
          <div className="font-bold text-lg">{title}</div>
          <div className="mt-4">{description}</div>
        </div>
        <h3 className="mt-8 mb-2 text-xl text-center font-bold">
          Select a membership level
        </h3>
        <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Tier
              projectId={projectId}
              tier={tier}
              wallet={wallet}
              key={index}
              onConnectWallet={onConnectWallet}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Project;
