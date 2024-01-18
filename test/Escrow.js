const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  beforeEach(async () => {
    // Setup accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();
    // console.log(seller.address);

    // Deploy Real Estate contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // console.log(realEstate.address);

    // Mint
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS"
      );
    await transaction.wait();

    // Deploy Escrow contract
    const Escrow = await ethers.getContractFactory("Escrow");

    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );
  });

  describe("Deployment", () => {
    it("Returns NFT Address", async () => {
      const result = await escrow.nftAddress();
      console.log(result);
      expect(result).to.be.equal(realEstate.address);
    });

    it("Returns Seller Address", async () => {
      const result = await escrow.seller();
      console.log(result);
      expect(result).to.be.equal(seller.address);
    });

    it("Returns Inspector Address", async () => {
      const result = await escrow.inspector();
      console.log(result);
      expect(result).to.be.equal(inspector.address);
    });

    it("Returns Lender Address", async () => {
      const result = await escrow.lender();
      console.log(result);
      expect(result).to.be.equal(lender.address);
    });
  });
});
