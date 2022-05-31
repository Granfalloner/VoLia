import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import projectsData from '../projects-data';
import { useParams } from 'react-router-dom';
import * as Crypto from '../crypto.js';
import * as ethers from 'ethers';
import ContractAbi from '../abi/ContractAbi.json';
import ERC20Abi from '../abi/ERC20Abi.json';
import { config } from '../config';
const { parseUnits, formatUnits } = ethers.utils;

const MAX_PERIODS = 12;

const isSupportedChain = (wallet) => {
  if (!wallet) return undefined;
  return Crypto.chains.map((ch) => ch.id).includes(wallet.chains[0].id);
};

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
  tokenDecimals,
}) => {
  const [step, setStep] = useState(1);
  const [balance, setBalance] = useState(undefined);
  const { name, amount, currency, period, tierIndex } = tier;

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setStep(2);

        const { address } = wallet.accounts[0];
        if (token) {
          const { ContractAddress } = config[wallet.chains[0].id];
          const allowance = await token.allowance(address, ContractAddress);
          console.log('allowance=', formatUnits(allowance, tokenDecimals));
          const requiredAllowance = parseUnits(
            `${amount * (MAX_PERIODS / 2)}`,
            tokenDecimals
          );
          if (allowance.gte(requiredAllowance)) {
            setStep(3);
          }
          setBalance(
            formatUnits(await token.balanceOf(address), tokenDecimals) +
              ' ' +
              currency
          );
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
      parseUnits(`${amount * MAX_PERIODS}`, tokenDecimals)
    );
    return tx;
  };

  const subscribe = async (projectId, tierIndex) => {
    let tx;
    try {
      tx = await contract.subscribe(projectId, tierIndex);
    } catch (err) {
      alert('Could not subscribe. ' + JSON.stringify(err));
      return;
    }
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
              <div>
                <button
                  className="btn"
                  onClick={() => {
                    waitNextStep(subscribe(projectId, tierIndex));
                  }}
                >
                  Subscribe ({amount} {currency} / {period})
                </button>
                <div className="text-center text-sm text-gray">
                  Balance: {balance}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tier = ({
  correctChain,
  projectId,
  tier,
  wallet,
  contract,
  token,
  signer,
  onConnectWallet,
  customColor,
  tokenDecimals,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [numSubscribed, setNumSubscribed] = useState(undefined);
  const [pendingTx, setPendingTx] = useState(undefined);

  const { name, amount, currency, period } = tier;

  const initSubStatus = async () => {
    if (wallet && contract && tier) {
      const { address } = wallet.accounts[0];

      console.log(projectId, tier.tierIndex, address);

      const isSub = await contract.isSubscribedForTier(
        projectId,
        tier.tierIndex,
        address
      );
      console.log('isSub', isSub);

      const numSub = await contract.numberOfSubscribersInTier(
        projectId,
        tier.tierIndex
      );

      setIsSubscribed(isSub);
      setNumSubscribed(numSub.toNumber());
    }
  };

  useEffect(() => {
    if (correctChain) initSubStatus();
  }, [wallet, contract, tier, correctChain]);

  const unsubscribe = async () => {
    const { address } = wallet.accounts[0];
    let index;
    try {
      index = await contract.subscriptionIndexForTier(
        projectId,
        tier.tierIndex,
        address
      );
    } catch (err) {
      alert('Could get subscription index. ' + JSON.stringify(err));
    }

    let tx;
    try {
      tx = await contract.unsubscribe(projectId, address, index);
    } catch (err) {
      alert('Could not unsubscribe. ' + JSON.stringify(err));
    }

    setPendingTx(tx.hash);
    tx.wait(6).then(async () => {
      await initSubStatus();
      setPendingTx(undefined);
    });
    return tx;
  };

  const onSubscribe = async (tx) => {
    setPendingTx(tx.hash);
    tx.wait(6).then(async () => {
      await initSubStatus();
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
          tokenDecimals={tokenDecimals}
        />
      </div>
    </div>
  );
};

const Project = (props) => {
  const { projectId } = useParams();
  const { title, address, description, tiers, image, customColor } =
    projectsData.find((x) => x.projectId == projectId);

  const [wallet, setWallet] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [claimAddress, setClaimAddress] = useState(undefined);
  const [token, setToken] = useState(undefined);
  const [tokenDecimals, setTokenDecimals] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [claimData, setClaimData] = useState(undefined);
  const [correctChain, setCorrectChain] = useState(undefined);

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
    setCorrectChain(isSupportedChain(wallet));
  }, [wallet]);

  useEffect(() => {
    const init = async () => {
      if (wallet && correctChain) {
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

        let result;
        try {
          result = await contract.projects(projectId);
        } catch {
          alert(
            'Count not get Project data from chain. Are you on a correct network?'
          );
          console.error(err);
          return;
        }
        setClaimAddress(result.claimAddress);

        let token;
        try {
          token = new ethers.Contract(result.tokenAddress, ERC20Abi, signer);
        } catch (err) {
          alert(
            'Count not get Token data from chain. Are you on a correct network?'
          );
          console.error(err);
          return;
        }
        setToken(token);
        setTokenDecimals(await token.decimals());
      } else {
        setContract(undefined);
        setSigner(undefined);
        setToken(undefined);
        setClaimAddress(undefined);
      }
    };
    init();
  }, [wallet, correctChain]);

  const isProjectOwner =
    currentAddress?.toLowerCase() == claimAddress?.toLowerCase();

  useEffect(() => {
    if (wallet && contract && isProjectOwner && correctChain) {
      loadClaimAmount();
    }
  }, [wallet, contract, claimAddress]);

  const loadClaimAmount = async () => {
    try {
      const [amount, tokenAddress] = await contract.claimableAmount(projectId);
      const token = new ethers.Contract(tokenAddress, ERC20Abi, signer);
      const decimals = await token.decimals();
      const symbol = await token.symbol();
      const formattedAmount = formatUnits(amount, decimals) + ' ' + symbol;
      setClaimData(formattedAmount);
    } catch (err) {
      alert(
        'Could not load withdrawal data from chain. ' + JSON.stringify(err)
      );
    }
  };

  const withdraw = async () => {
    try {
      const tx = await contract.claim(projectId);
      tx.wait().then(() => {
        setClaimData(undefined);
      });
    } catch (err) {
      alert('Could not start withdrawal. ' + JSON.stringify(err));
    }
  };

  return (
    <div>
      <Header wallet={wallet} connectWallet={onConnectWallet} />

      {wallet && correctChain == false && (
        <div
          className="alert alert-warning shadow-lg mt-5 w-full m-auto"
          style={{ maxWidth: '1000px' }}
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Warning: Switch to a Supported Network:{' '}
              {Crypto.chains.map((ch) => (
                <button
                  key={ch.id}
                  className="btn-link mr-2"
                  onClick={async () => {
                    await Crypto.onboard.setChain({ chainId: ch.id });
                    setCorrectChain(isSupportedChain(wallet));
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </span>
          </div>
        </div>
      )}
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

              {wallet && isProjectOwner && (
                <div className="flex-end mt-4">
                  <span className="font-bold text-sm pr-4">
                    {claimData || 'Loading..'}
                  </span>
                  <button
                    className={
                      'btn bg-black hover:bg-pink-800 btn-sm' +
                      (claimData ? '' : ' loading ')
                    }
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
              correctChain={correctChain}
              contract={contract}
              token={token}
              tokenDecimals={tokenDecimals}
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
