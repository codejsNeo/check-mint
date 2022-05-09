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

      </button>

      <h1 id='title'>Custom Minter</h1>

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