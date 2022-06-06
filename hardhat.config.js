const { util } = require("chai");
//const { ethers } = require("hardhat");

const { ethers, providers } = require("ethers")

require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: '.env' });

const signer = new ethers.Wallet("0526b71f6d13a8d0e39905ba7370213436e65530705ba5ecf2641d24a76280a8")

const Balance = async () => {
  const provider = new providers.WebSocketProvider("wss://alfajores-forno.celo-testnet.org/ws")
  const bal = parseInt(await (await provider.getBalance(await signer.address))._hex, 16)
  console.log("Balance", bal)
  return Balance

}
Balance()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const getEnv = (variable, optional = false) => {
  if (!process.env[variable]) {
    if (optional) {
      console.warn(`[@env]: Environmental variable for ${variable} is not supplied.`)
    } else {
      throw new Error(`You must create an environment variable for ${variable}`)
    }
  }

  return process.env[variable]?.replace(/\\n/gm, '\n')
}

// Your mnemomic key
const MNEMONIC = getEnv("MNEMONIC")



// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      //   path: "m/44'/60'/0'/0",
      // },
      accounts: [
        process.env.MNEMONIC
      ],
      chainId: 44787,
    },
  },
};
