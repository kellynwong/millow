import { ethers } from "ethers";
import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const Home = ({ home, provider, escrow, togglePop }) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);
  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [ownder, setOwner] = useState(null);

  const fetchDetails = async () => {
    // -- Buyer (buyer is listed in the mapping in the escrow contract, so this will return the buyer's address when we pass in the home id a.k.a. nft id)
    const buyer = await escrow.buyer(home.id);
    setBuyer(buyer);

    const hasBought = await escrow.approval(home.id, buyer);
    setHasBought(hasBought);

    // -- Seller
    const seller = await escrow.seller();
    setSeller(seller);
    const hasSold = await escrow.approval(home.id, seller);
    setHasSold(hasSold);

    // -- Lender
    const lender = await escrow.lender;
    setLender(lender);
    const hasLended = await escrow.approval(home.id, lender);
    setHasBought(hasLended);

    // -- Inspector
    const inspector = await escrow.inspector();
    setInspector(inspector);
    const hasInspected = await escrow.approval(home.id, inspector);
    setHasBought(hasInspected);
  };

  const fetchOwner = async () => {
    if (await escrow.isListed(home.id)) return;
    const owner = await escrow.buyer(home.id);
    setOwner(owner);
  };

  // If property is sold, we will want to fetch all these stuff again
  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>
        <div className="home__overview">
          <h1>{home.name}</h1>
          <p>
            <strong>{home.attributes[2].value}</strong>bds |
            <strong>{home.attributes[3].value}</strong>ba |
            <strong>{home.attributes[4].value}</strong>
            sqft
          </p>
          <p>{home.address}</p>
          <h2>{home.attributes[0].value} ETH</h2>
          <div>
            <button className="home__buy">Buy</button>
            <button className="home__contact">Contact agent</button>
            <hr />
            <h2>Overview</h2>
            <p>{home.description}</p>
            <hr />
            <h2> Facts and features</h2>
            <ul>
              {home.attributes.map((attribute, index) => (
                <li key={index}>
                  <strong>{attribute.trait_type}</strong> : {attribute.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button onClick={togglePop} className="home__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Home;
