import { pinJSONToIPFS } from './pinata.js'
// require('dotenv').config();
const alchemyKey = "https://eth-rinkeby.alchemyapi.io/v2/NzGGAKznXws9s9xfhx8qFOGEcJRuXVNv";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json')
// const contractAddress ="0xeb1Fe4411be21aE54f3dF2D4AD92ba3EF160Cb14";
// const contractAddress ="0xadF16756a70933252E09af406fa71faf9eDDe66b";
const contractAddress ="0xcc76803E00f6a989d589B1DEE7870f4Ea6E28235";


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

  // console.log(metadata);

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
      return {
          success: false,
          status: "😢 Something went wrong while uploading your tokenURI.",
      }
  }
  const tokenURI = pinataResponse.pinataUrl;
  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  console.log(window.contract);

  
// 0.04450629 0.0445774 0.04453266
  //set up your Ethereum transaction
  const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      // value:parseInt(web3.utils.toWei("0.001","ether")).toString(16),
      value: web3.utils.toHex(web3.utils.toWei('0.001', 'ether')),
      'data': window.contract.methods.safeMint(window.ethereum.selectedAddress).encodeABI()//make call to NFT smart contract 
  };

  //sign the transaction via Metamask
  try {
      const txHash = await window.ethereum
          .request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
          });
      return {
          success: true,
          status: "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" + txHash
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
