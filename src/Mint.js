import React from 'react';
import { useEffect, useState } from 'react';
// import { connectWallet, getCurrentWalletConnected } from "./utils/interact.js";
import { connectWallet, getCurrentWalletConnected, mintNFT } from "./utils/interact.js";


const Mint = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");

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
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    const { status } = await mintNFT(url, name, description);
    setStatus(status);
  };

  return (
    <div className='Mint'>
      <button id='walletButton' onClick={connectWalletPressed}>
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
      <form id='form1'>
        <h2>Asset link: </h2>
        <input
          type='text'
          placeholder='e.g. https://gateway.pinata.cloud/ipfs/<hash>'
          onChange={(e) => setURL(e.target.value)}
        />

        <h2>Token Name: </h2>
        <input
          type="text"
          placeholder="name of your token"
          onChange={(e) => setName(e.target.value)}
        /> <br />

        <h2>Token description: </h2>
        <input
          type='text'
          placeholder='description of token'
          onChange={(e => setDescription(e.target.value))}
        />

      </form>

      <button id='mintButton' onClick={onMintPressed}>
        Mint NFT
      </button>
      <p id="status">
        {status}
      </p>

    </div>

  )
};

export default Mint;