import { ethers } from 'ethers';
import React from 'react';
import { useEffect, useState } from 'react';
import { connectWallet, getCurrentWalletConnected, mintNFT } from "./utils/interact.js";
const contractABI = require('./contract-abi.json');

const Mint = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([])
  const [balanceInfo, setBalanceInfo] = useState({
    address: "",
    balance: ""
  });

  const [ownerBalance, setOwnerBalance] = useState("");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  //https://chainid.network/chains.json
  const networks = {
    ropsten: {
      chainId: `0x${Number(3).toString(16)}`,
      chainName: "Ropsten",
      nativeCurrency: {
        "name": "Ropsten Ether",
        "symbol": "ROP",
        "decimals": 18
      },
      rpcUrls: ["https://ropsten.infura.io/v3/${INFURA_API_KEY}"],
      blockExplorerUrls: ["https://ropsten.etherscan.io"]
    },
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"]
    },
    ethereum: {
      chainId: `0x${Number(1).toString(16)}`,
      chainName: "Ethereum Mainnet",
      nativeCurrency: {
        "name": "Ether",
        "symbol": "ETH",
        "decimals": 18
      },
      rpcUrls: ["https://mainnet.infura.io/v3/${INFURA_API_KEY}"],
      blockExplorerUrls: ["https://etherscan.io"]
    },
    rinkeby: {
      chainId: `0x${Number(4).toString(16)}`,
      chainName: "Rinkeby",
      nativeCurrency: {
        "name": "Rinkeby Ether",
        "symbol": "RIN",
        "decimals": 18
      },
      rpcUrls: ["https://rinkeby.infura.io/v3/${INFURA_API_KEY}"],
      blockExplorerUrls: ["https://rinkeby.etherscan.io"]
    },
    kovan: {
      chainId: `0x${Number(42).toString(16)}`,
      chainName: "Kovan",
      nativeCurrency: {
        "name": "Kovan Ether",
        "symbol": "KOV",
        "decimals": 18
      },
      rpcUrls: ["https://kovan.poa.network"],
      blockExplorerUrls: ["https://kovan.etherscan.io"]
    },
    goerli: {
      chainId: `0x${Number(5).toString(16)}`,
      chainName: "Görli",
      nativeCurrency: {
        "name": "Görli Ether",
        "symbol": "GOR",
        "decimals": 18
      },
      rpcUrls: ["https://goerli.infura.io/v3/${INFURA_API_KEY}"],
      blockExplorerUrls: ["https://goerli.etherscan.io"]
    },
  }

  const changeNetwork = async ({ networkName }) => {
    try {
      if (!window.ethereum) throw new Error("No wallet found!");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...networks[networkName]
          }
        ]
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  const handleNetworkSwitch = async (networkName) => {
    await changeNetwork({ networkName });
  }

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(async () => {
    const { address, status } = await getCurrentWalletConnected(); //1
    setWallet(address);
    setStatus(status);

    addWalletListener();
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await contract.balanceOf(signerAddress);
    // for loop
    setBalanceInfo({
      address: signerAddress,
      balance: String(balance)
    });

    // window.ethereum.on("chainChanged", networkChanged);
    // return () => {
    //   window.ethereum.removeListener("chainChanged", networkChanged);
    // };

  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    const { status } = await mintNFT();
    setStatus(status);
  };

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  const displayToken = async () => {
    const nfts = [];
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await contract.balanceOf(signerAddress);

    for (let i = 0; i < balance; i++) {
      nfts.push({
        tokenIndex: i,
        loading: true,
        token: ''
      });
    }
    setItems(nfts);

    for (let nft of nfts) {
      const token = await contract.tokenOfOwnerByIndex(
        signerAddress,
        nft.tokenIndex
      );
      console.log("token", token)
      nfts[nft.tokenIndex] = {
        tokenIndex: nft.tokenIndex,
        loading: false,
        token,

      };
      // console.log("nft",nfts)
      setItems([...nfts]);
    }
  };

  const getOwnerBalance = async () => {
    const ownerBalance = await provider.getBalance(contractAddress);
    const ownerBalance_Wei = parseInt(ownerBalance);
    const ownerBalanceEther = ethers.utils.formatEther(ownerBalance_Wei);

    setOwnerBalance(ownerBalanceEther)
  };

  const withdrawMoney = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const withdraw = await contract.withdraw();
  }



  return (
    <div className='Mint'>
      <button id='walletButton' className='btn' onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          'Connected: ' +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}

      </button> <br/>

      <span className='ntw'>Switch Network</span>
      <button
        onClick={() => handleNetworkSwitch("ropsten")}
        className="networks"
      >
        Switch to Ropsten
      </button>

      <button
        onClick={() => handleNetworkSwitch("polygon")}
        className="networks"
      >
        Switch to Polygon
      </button>

      <button
        onClick={() => handleNetworkSwitch("ethereum")}
        className="networks"
      >
        Switch to Ethereum
      </button>

      <button
        onClick={() => handleNetworkSwitch("rinkeby")}
        className="networks"
      >
        Switch to Rinkeby
      </button>
      <button
        onClick={() => handleNetworkSwitch("kovan")}
        className="networks"
      >
        Switch to Kovan
      </button>

      <button
        onClick={() => handleNetworkSwitch("goerli")}
        className="networks"
      >
        Switch to Görli
      </button>

      <h2 id='title'>Custom Minter</h2>

      <div className='spn'>
        My Balance:
        <span > {balanceInfo.balance}</span>
      </div>

      <div align='center' className='spn'>
        For Address: <span className='mpns'><b>{balanceInfo.address}</b></span>

      </div>

      <div className='spn'>
        <button id='getOwnerBalance' className='btn' onClick={getOwnerBalance} type="submit">
          Owner/Contract Balance
        </button>
        <span> {ownerBalance} ETH</span>
      </div>

      <div className='spn'>
        <button id='withdrawMoney' className='btn' onClick={withdrawMoney} type="submit">
          Withdraw Eth
        </button>
        <span>  ETH</span>
      </div>

      <div className='spn'>
        <button id='displayTokens' className='btn' onClick={displayToken} type="submit">
          See All Tokens
        </button>
        <span>
          {
            items.map((item, i) => (
              <div key={i}>
                <span>TokenId: {item.tokenIndex}</span> |
                <span> Token: {item.token._hex}</span>
              </div>
            ))
          }

        </span>
      </div>

      <br /><br />
      <button id='mintButton' className='btn' onClick={onMintPressed}>
        Mint NFT
      </button>

      <p id="status">
        {status}
      </p>

    </div>

  )
};

export default Mint;