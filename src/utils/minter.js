import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";

/**
 * We import the ipfs-http-client library and the axios library. We will use the axios library to make requests to an IPFS node.
 * We will use IPFS to store the metadata of our NFTs and images for the NFTs. We initialize the IPFS client.
 */
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

/**
 * 
 * 1. Next, let's add a createNft function that will mint an NFT  minterContract
 * 2. We also need the metadata of the NFT. With defaultAccount, we will get the address of the account that is currently connected to the dapp via the wallet. 
 * 
 * 3. We call performActions to create the transaction that will interact with our contract and mint the NFT.
 * 
 * 4. First, we convert the metadata to the JSON format (data), then we upload the JSON to IPFS (added) and store the path of the JSON on IPFS in the url variable.
 * 
 * 5. Now that we have the IPFS url with the metadata, we can mint the NFT. To mint the NFT, we call the safeMint method our minterContract contract. We pass the ownerAddress and the url as parameters. The first parameter determines to which address the NFT will be minted, and the second parameter is the token URI with the metadata. We will make the transactions with the address of the connected account (defaultAccount).
 */

export const createNft = async (
    minterContract,
    performActions,
    { name, description, ipfsImage, ownerAddress, attributes }
) => {
    await performActions(async (kit) => {
        if (!name || !description || !ipfsImage) return;
        const { defaultAccount } = kit;

        // convert NFT metadata to JSON format
        const data = JSON.stringify({
            name,
            description,
            image: ipfsImage,
            owner: defaultAccount,
            attributes,
        });

        try {
            // save NFT metadata to IPFS
            const added = await client.add(data);

            // IPFS url for uploaded metadata
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;

            // mint the NFT and save the IPFS url to the blockchain
            let transaction = await minterContract.methods
                .safeMint(ownerAddress, url)
                .send({ from: defaultAccount });

            return transaction;
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    });
};

/**
 * With the following function, we will add the ability to upload a local image to IPFS:
 * If the user has selected an image, we get the file from the e event and upload it to IPFS. We get the added object from the IPFS client and return the path of the file.
 */
export const uploadToIpfs = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const added = await client.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        });
        return `https://ipfs.infura.io/ipfs/${added.path}`;
    } catch (error) {
        console.log("Error uploading file: ", error);
    }
};

/**
 * 1. We also need one function to fetch all NFTs that have been minted from our contract. We will call this function getNfts:
 * 
 * 2. We first need to know how many NFTs our minterContract has minted in total. We can get this number by calling the totalSupply method since our contract has implemented the ERC721Enumerable interface.
 * 
 * 3. Then, we loop through all the NFTs and fetch the data we want to display. We create a new promise for each NFT, and we call the tokenURI method of the minterContract contract. We pass the index of the NFT as a parameter for the tokenID and call the fetchNftMeta and fetchNftOwner functions that we will create next.
 * 
 * 4. Finally, when all the promises are resolved, we return the array of NFTs.
 */

export const getNfts = async (minterContract) => {
    try {
        const nfts = [];
        const nftsLength = await minterContract.methods.totalSupply().call();
        for (let i = 0; i < Number(nftsLength); i++) {
            const nft = new Promise(async (resolve) => {
                const res = await minterContract.methods.tokenURI(i).call();
                const meta = await fetchNftMeta(res);
                const owner = await fetchNftOwner(minterContract, i);
                resolve({
                    index: i,
                    owner,
                    name: meta.data.name,
                    image: meta.data.image,
                    description: meta.data.description,
                    attributes: meta.data.attributes,
                });
            });
            nfts.push(nft);
        }
        return Promise.all(nfts);
    } catch (e) {
        console.log({ e });
    }
};

/**
 * Now let's add the fetchNftMeta function:
 * We call the axios library to fetch the metadata from IPFS and return it.
 */
export const fetchNftMeta = async (ipfsUrl) => {
    try {
        if (!ipfsUrl) return null;
        const meta = await axios.get(ipfsUrl);
        return meta;
    } catch (e) {
        console.log({ e });
    }
};

/**
 * Finally, we create two functions to fetch the owner of an NFT and the owner of the NFT contract:
 * 
 * The difference between the fetchNftOwner and the fetchNftContractOwner functions is that the fetchNftOwner function will return the address of the owner of the NFT. In contrast, the fetchNftContractOwner function will return the address of the owner of the NFT contract. Only the contract owner will be able to mint a new NFT. But we also want to display the address of the current owner of the NFT.
 */


// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
    try {
        return await minterContract.methods.ownerOf(index).call();
    } catch (e) {
        console.log({ e });
    }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
    try {
        let owner = await minterContract.methods.owner().call();
        return owner;
    } catch (e) {
        console.log({ e });
    }
};
