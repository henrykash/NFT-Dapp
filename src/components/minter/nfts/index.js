import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
    getNfts,
    createNft,
    fetchNftContractOwner,
} from "../../../utils/minter";
import { Row } from "react-bootstrap";


/**
    * The NftList component expects a minterContract prop, which is the instance of the MyNFT contract, and a name prop, which is the name of the NFT collection we want to display.
    */
const NftList = ({ minterContract, name }) => {

    //hook to get the address of the user and the performActions function to perform actions on the minterContract contract
    const { performActions, address } = useContractKit();

    //fetch the nfts, which is the list of NFTs that have been minted
    const [nfts, setNfts] = useState([]);

    //state to manage a loading indicator while the nfts are being fetched.
    const [loading, setLoading] = useState(false);

    //state is used to store the address of the owner of the NFT contract.
    const [nftOwner, setNftOwner] = useState(null);


    /**
     * Next, we create a callback function that fetches the NFTs from the minterContract contract:
     * The callback function returns a memoized function that only changes if the minterContract contract changes.
     */
    const getAssets = useCallback(async () => {
        try {
            setLoading(true);
            const allNfts = await getNfts(minterContract);
            if (!allNfts) return;
            setNfts(allNfts);
        } catch (error) {
            console.log({ error });
        } finally {
            setLoading(false);
        }
    }, [minterContract]);

    /**
     *  Now we add a function that creates a new NFT: 
     * mints a new NFT by calling the createNft function
     * and passing the minterContract contract, the performActions function, and the data object. The data object contains the NFT's metadata.
     */

    const addNft = async (data) => {
        try {
            setLoading(true);
            await createNft(minterContract, performActions, data);
            toast(<NotificationSuccess text="Updating NFT list...." />);
            getAssets();
        } catch (error) {
            console.log({ error });
            toast(<NotificationError text="Failed to create an NFT." />);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Next, we create a function that fetches the owner of the NFT contract
     * and a useEffect hook that calls the getAssets and fetchContractOwner functions when minterContract, address, getAssets, or fetchContractOwner change:
     */

    const fetchContractOwner = useCallback(async (minterContract) => {
        // get the address that deployed the NFT contract
        const _address = await fetchNftContractOwner(minterContract);
        setNftOwner(_address);
    }, []);

    useEffect(() => {
        try {
            if (address && minterContract) {
                getAssets();
                fetchContractOwner(minterContract);
            }
        } catch (error) {
            console.log({ error });
        }
    }, [minterContract, address, getAssets, fetchContractOwner]);


    /**
     * Now we can display the NFTs:
     * If the user is the owner of the NFT contract, we display the AddNfts component, which is a component that allows the user to mint a new NFT. We pass the addNft function and the address of the user as props to the component.
     * Then we map the list of nfts to the Nft component, which is a component that displays the NFT's metadata. We pass the _nft object's metadata as props to the component.
     */

    if (address) {
        return (
            <>
                {!loading ? (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="fs-4 fw-bold mb-0">{name}</h1>
                            {nftOwner === address ? (
                                <AddNfts save={addNft} address={address} />
                            ) : null}
                        </div>
                        <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
                            {nfts.map((_nft) => (
                                <Nft
                                    key={_nft.index}
                                    nft={{
                                        ..._nft,
                                    }}
                                />
                            ))}
                        </Row>
                    </>
                ) : (
                    <Loader />
                )}
            </>
        );
    }
    return null;

    /**
     * Finally, we make sure that the props are from the right type, that the default props are set to null, and export the component:
     */
};

NftList.propTypes = {
    minterContract: PropTypes.instanceOf(Object),
    updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
    minterContract: null,
};

export default NftList;

