import React from "react";
import { Container, Nav } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/Wallet";
import Cover from "./components/minter/Cover";
import Nfts from "./components/minter/nfts";
import { useBalance, useMinterContract } from "./hooks";
import coverImg from "./assets/img/nft_geo_cover.png";
import "./App.css";

/**
 * We change the path to the Cover component to the minter folder. We add the NFTs component instead of the Counter component. We replace the useCounterContract hook with the useMinterContract hook. And we also add the coverImg with the image we created saved earlier.
 */

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();

  //gets current balance of the wallet
  const { balance, getBalance } = useBalance();
  const minterContract = useMinterContract();

  return (
    <>
      <Notification />
      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>
            <Nfts
              name="GEO Collection"
              updateBalance={getBalance}
              minterContract={minterContract}
            />
          </main>
        </Container>
      ) : (
        <Cover name="GEO Collection" coverImg={coverImg} connect={connect} />
      )}
    </>
  );
};

export default App;
