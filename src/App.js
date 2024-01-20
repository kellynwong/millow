import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  // Create a hook to set the provider and pass in provider
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Connect to blockchain and smart contracts and load them up to the app - ensure above has ABIs and config filepaths
    setProvider(provider);
    // Get network "31337" as we want to find out where the contract's being deployed to + use config.js file (where the addresses are)
    const network = await provider.getNetwork();
    console.log(network);

    // config[network.chainId].realEstate.address;
    // config[network.chainId].escrow.address;
    // console.log(
    //   config[network.chainId].realEstate.address,
    //   config[network.chainId].escrow.address
    // );

    // This below is to get the javaScript version of the contract so we can call the various functions, requires smart contract address, smart contract ABI and ethers provider as arguments
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    // console.log(totalSupply.toString());

    // Store and list out all the homes on the page from the blockchain
    const homes = [];
    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      console.log(uri);
      const response = await fetch(uri);
      console.log(response);
      const metadata = await response.json(); // from IPFS
      console.log(metadata);
      homes.push(metadata);
    }
    setHomes(homes);
    console.log(homes);

    // This below is to get the javaScript version of the Escrow contract
    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    console.log(provider);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(accounts);
    setAccount(accounts[0]);
    console.log(account);
  };

  // Update page if you change metamask account
  window.ethereum.on("accountsChanged", async () => {
    // Refetch accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
  });

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (home) => {
    setHome(home);
    toggle ? setToggle(false) : setToggle(true);
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Homes For You</h3>
        <hr />
        <div className="cards">
          {homes.map((home, index) => (
            <div className="card" key={index} onClick={() => togglePop(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home"></img>
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong>bds |
                  <strong>{home.attributes[3].value}</strong>ba |
                  <strong>{home.attributes[4].value}</strong>
                  sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toggle && (
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
