const eth = require("ethers");
const contractABI = require('../contract-abi.json');
const contractAddress = "0x68C8d542D0Fd539F1Cc02f64b6F769e0310C3B10";
const provider = new eth.providers.Web3Provider(window.ethereum);
// const web3 = new eth.providers.AlchemyProvider('rinkeby',"https://eth-rinkeby.alchemyapi.io/v2/NzGGAKznXws9s9xfhx8qFOGEcJRuXVNv");
const signer =  provider.getSigner(); 
const contract = new eth.Contract(contractAddress, contractABI, signer);
// let userAddress = signer.getAddress(); // metamask Account

export const mintNFT = async (url, name, description) => {
  //error handling
  if ((name.trim() == "" || description.trim() == "")) {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    }
  }

  //make metadata
  const metadata = new Object();
  metadata.name = name;
  metadata.image = url;
  metadata.description = description;
 
  // const transactionParameters = {
  //   to: contractAddress, // Required except during contract publications.
  //   from: window.ethereum.selectedAddress, // must match user's active address.
  //   value:0.001,
  
  //   'data': contract.safeMint(window.ethereum.selectedAddress).encodeABI()//make call to NFT smart contract 
  // };
 
  
  //sign the transaction via Metamask
  try {
    const response = await contract.safeMint(window.ethereum.selectedAddress);  
    console.log(response);
    return {
      success: true,
      status: "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" 
    }
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    }

  }
}

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Message here",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};
