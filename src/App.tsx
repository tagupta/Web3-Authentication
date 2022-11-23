import { Fragment, useEffect, useState } from 'react';
import { Web3AuthCore } from '@web3auth/core';
import { WALLET_ADAPTERS, SafeEventEmitterProvider } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';

import './App.css';
// import RPC from './ethersRPC' // for using ethers.js
import RPC from './web3RPC'; // for using web3.js
import { CHAIN_CONFIG } from './config/chainConfig';

const clientId =
  'BNGG5-2UVegvQb_H0fCCiza5YTsvpvZJVk3m7lbbkFlXgWrLdBVO7uO0ubVOxNvGOn0x-n80mLtjbAKjFkb8LJA'; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );

  const currentChainConfig = CHAIN_CONFIG['testnet'];

  const init = async (adaptername: string): Promise<any> => {
    try {
      const web3auth = new Web3AuthCore({
        clientId,
        chainConfig: currentChainConfig,
      });

      console.log('web3auth init: ', web3auth);

      if (adaptername === 'openlogin') {
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: 'testnet',
            uxMode: 'popup',
            // redirectUrl: 'https://en.wikipedia.org/wiki/Cat',
            loginConfig: {
              google: {
                name: 'Evolv Google Auth Login - testing',
                verifier: 'evolv-google-web2auth',
                typeOfLogin: 'google',
                // showOnDesktop: true,
                // mainOption: true,
                // showOnModal: true,
                // logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
                // logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
                clientId:
                  '653702620808-nh125go6s2mmqgg02mem0m2hlgu1j9mj.apps.googleusercontent.com', //use your app client id you got from google
              },
            },
            whiteLabel: {
              name: 'Evolv',
              logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
              logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
              // defaultLanguage: 'ja',
              // dark: true,
              theme: { primary: '#ffb303' },
            },
          },
          loginSettings: {
            mfaLevel: 'default',
            // redirectUrl: 'https://en.wikipedia.org/wiki/Cat',
          },
        });

        web3auth.configureAdapter(openloginAdapter);
      } else if (adaptername === 'metamask') {
        console.log('MetaMask adapter');
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
        });

        web3auth.configureAdapter(metamaskAdapter);
      }
      setWeb3auth(web3auth);
      return web3auth;
    } catch (error) {
      console.error(error);
    }
  };

  const initialize = async (
    adapter: string,
    walletParams: any[]
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      init(adapter).then(async (web3auth) => {
        await web3auth.init();
        console.log('web3auth:', web3auth);
        const localProvider = await web3auth.connectTo(...walletParams);
        // setProvider(localProvider);
        console.log('localProvider: ', localProvider);
        resolve(localProvider);
      });
    });
  };

  const loginToMetamask = async () => {
    initialize('metamask', [WALLET_ADAPTERS.METAMASK]).then(
      (localProvider: SafeEventEmitterProvider) => {
        setProvider(localProvider);
      }
    );
  };

  const loginToGoogle = () => {
    initialize('openlogin', [
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: 'google',
      },
    ]).then((localProvider: SafeEventEmitterProvider) => {
      setProvider(localProvider);
    });
  };

  const loginToFaceBook = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: 'facebook',
      }
    );
    setProvider(web3authProvider);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    console.log(chainId);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.log('provider not initialized yet');
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    console.log(privateKey);
  };
  const loggedInView = (
    <div>
      <button onClick={getUserInfo} className="card">
        Get User Info
      </button>
      <button onClick={getChainId} className="card">
        Get Chain ID
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={sendTransaction} className="card">
        Send Transaction
      </button>
      <button onClick={signMessage} className="card">
        Sign Message
      </button>
      <button onClick={getPrivateKey} className="card">
        Get Private Key
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>
      <div id="console" style={{ whiteSpace: 'pre-line' }}>
        <p style={{ whiteSpace: 'pre-line' }}></p>
      </div>
    </div>
  );

  const unloggedInView = (
    <Fragment>
      <button onClick={loginToGoogle} className="card">
        Login to Google
      </button>
      <button onClick={loginToFaceBook} className="card">
        Login to Facebook
      </button>
      <button onClick={loginToMetamask} className="card">
        Login to Metamask
      </button>
    </Fragment>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{' '}
        Web3 core SDK
      </h1>
      <div className="grid">{provider ? loggedInView : unloggedInView}</div>
    </div>
  );
}

export default App;
