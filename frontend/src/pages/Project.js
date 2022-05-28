import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';
import * as Crypto from '../crypto.js';
import * as ethers from 'ethers';
import ContractAbi from '../abi/ContractAbi.json';
import ERC20Abi from '../abi/ERC20Abi.json';
import { config } from '../config';
const { formatUnits } = ethers.utils;

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
  const { name, amount, currency, period, tierIndex, tokenDecimals } = tier;

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setStep(2);

        if (token) {
          const { ContractAddress } = config[wallet.chains[0].id];
          const allowance = await token.allowance(
            wallet.accounts[0].address,
            ContractAddress
          );
          console.log('allowance=', allowance.toNumber());
          if (
            allowance.toNumber() >=
            amount * (MAX_PERIODS / 2) * 10 ** tokenDecimals
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
    const { ContractAddress } = config[wallet.chains[0].id];
    const tx = await token.approve(
      ContractAddress,
      amount * MAX_PERIODS * 10 ** tokenDecimals
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

const Tier = ({
  projectId,
  tier,
  wallet,
  contract,
  signer,
  onConnectWallet,
  customColor,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [numSubscribed, setNumSubscribed] = useState(undefined);
  const [pendingTx, setPendingTx] = useState(undefined);
  const [token, setToken] = useState(undefined);

  const { name, amount, currency, period } = tier;

  const initSubStatus = async () => {
    if (wallet && contract && tier) {
      const { address } = wallet.accounts[0];
      const isSub = await contract.isSubscribedForTier(
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
      if (contract && wallet) {
        const { USDCAddress, ContractAddress } = config[wallet.chains[0].id];

        const token = new ethers.Contract(USDCAddress, ERC20Abi, signer);
        setToken(token);
      } else {
        setToken(undefined);
      }
    };
    init();
  }, [wallet, contract, signer]);

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
        <div
          className="text-center text-neutral mb-2 mt-0"
          style={customColor && { color: 'black' }}
        >
          {amount} {currency} / {period}
        </div>
        {numSubscribed != undefined && (
          <p className="text-sm text-center mb-2">
            🧍{numSubscribed} subscribers
          </p>
        )}
        {numSubscribed == undefined && wallet && (
          <p className="text-sm text-center mb-2">Loading..</p>
        )}
        <div className="card-actions justify-center">
          {!isSubscribed && (
            <button
              onClick={() => {
                setOpen(true);
              }}
              disabled={!!pendingTx}
              className="btn w-full hover-btn"
              style={
                customColor && {
                  backgroundColor: customColor,
                  color: 'black',
                  border: 'none',
                }
              }
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
  const { title, address, description, tiers, image, ethAddress, customColor } =
    projectsData.find((x) => x.projectId == projectId);

  const [wallet, setWallet] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [claimData, setClaimData] = useState(undefined);

  const currentAddress = wallet?.accounts[0].address;

  const onConnectWallet = async () => {
    const wallet = await Crypto.connectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    Crypto.loadWallet();
    return Crypto.saveWalletOnChange(setWallet);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        const provider = new ethers.providers.Web3Provider(
          wallet.provider,
          'any'
        );
        const signer = provider.getUncheckedSigner();

        const { ContractAddress } = config[wallet.chains[0].id];
        const contract = new ethers.Contract(
          ContractAddress,
          ContractAbi,
          signer
        );
        setContract(contract);
        setSigner(signer);
      } else {
        setContract(undefined);
        setSigner(undefined);
      }
    };
    init();
  }, [wallet]);

  const isProjectOwner = currentAddress == ethAddress.toLowerCase();

  useEffect(() => {
    if (wallet && contract && isProjectOwner) {
      loadClaimAmount();
    }
  }, [wallet, contract]);

  const loadClaimAmount = async () => {
    const [amount, tokenAddress] = await contract.claimableAmount(projectId);
    const token = new ethers.Contract(tokenAddress, ERC20Abi, signer);
    const decimals = await token.decimals();
    const symbol = await token.symbol();
    const formattedAmount = formatUnits(amount, decimals) + ' ' + symbol;
    setClaimData(formattedAmount);
  };

  const withdraw = async () => {
    const tx = await contract.claim(projectId);
    tx.wait().then(() => {
      setClaimData(undefined);
    });
  };

  return (
    <div>
      <Header wallet={wallet} connectWallet={onConnectWallet} />
      <div style={{ maxWidth: '1000px' }} className="m-auto">
        <div
          className="rounded-lg bg-white mh-64 mt-8 m-auto"
          style={{
            background: customColor
              ? `linear-gradient(to bottom, ${customColor}, ${customColor} 128px, transparent 128px, transparent 100%)`
              : 'url("/projectBG.png") no-repeat top',
            paddingTop: '70px',
          }}
        >
          <div className="px-12 pb-6">
            <div className="avatar">
              <div className="w-28 rounded">
                <img src={image} />
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="font-bold text-lg mt-2">{title}</div>
                <div className="text-gray-500">{address}</div>
              </div>

              {isProjectOwner && (
                <div className="flex-end mt-4">
                  <span className="font-bold text-sm pr-4">{claimData}</span>
                  <button
                    className="btn bg-black hover:bg-pink-800 btn-sm"
                    onClick={withdraw}
                  >
                    Withdraw
                  </button>
                </div>
              )}
            </div>
          </div>

          <hr />
          <div className="mt-6 px-12 pb-12">
            <b>Description</b>
            <br />
            <div className="pt-2">{description}</div>
          </div>
        </div>
        <h3 className="mt-8 mb-2 text-xl text-center font-bold">
          Select a membership level
        </h3>
        <div className="container-lg mx-12 my-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <Tier
              contract={contract}
              signer={signer}
              projectId={projectId}
              tier={tier}
              wallet={wallet}
              key={index}
              onConnectWallet={onConnectWallet}
              customColor={customColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Project;
