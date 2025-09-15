const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether')
}

async function deployRealEstateFixture() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()

  return { realEstate, buyer, seller, inspector, lender }
}

async function mintPropertyFixture() {
  const { realEstate, buyer, seller, inspector, lender } = await loadFixture(deployRealEstateFixture)

  // Mint
  let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
  await transaction.wait()
 
  return { buyer, seller, inspector, lender, realEstate };
}

async function deployEscrowFixture() {
  const { buyer, seller, inspector, lender, realEstate } = await loadFixture(mintPropertyFixture);

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow')

  const escrow = await Escrow.deploy(
    await realEstate.getAddress(),
    seller.address,
    inspector.address,
    lender.address
  )
  
  return { buyer, seller, inspector, lender, realEstate, escrow }
}

async function listPropertyFixture() {
  const { buyer, seller, inspector, lender, realEstate, escrow } = await loadFixture(deployEscrowFixture);

  // Approve Property
  let transaction = await realEstate.connect(seller).approve(await escrow.getAddress(), 1)
  await transaction.wait()

  // List property
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5));
  await transaction.wait()

  return { buyer, seller, inspector, lender, realEstate, escrow }
}

async function finalizeSaleFixture() { 
  const { buyer, seller, inspector, lender, realEstate, escrow } = await loadFixture(listPropertyFixture);

  let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) });
  await transaction.wait();

  transaction = await escrow.connect(inspector).updateInspectionStatus(1, true);
  await transaction.wait();

  transaction = await escrow.connect(buyer).approveSale(1);
  await transaction.wait();

  transaction = await escrow.connect(seller).approveSale(1);
  await transaction.wait();

  transaction = await escrow.connect(lender).approveSale(1);
  await transaction.wait();

  await lender.sendTransaction({ to: await escrow.getAddress(), value: tokens(5) });    
  
  transaction = await escrow.connect(lender).finalizeSale(1);
  await transaction.wait();

  return { buyer, seller, inspector, lender, realEstate, escrow }
}

describe('Escrow', () => {
  describe('Deployment', () => {
    it('Returns NFT address', async () => {
      const { realEstate, escrow } = await loadFixture(deployEscrowFixture)

      const result = await escrow.nftAddress()
      expect(result).to.be.equal(await realEstate.getAddress())
    })

    it('Returns seller', async () => {
      const { escrow, seller } = await loadFixture(deployEscrowFixture)

      const result = await escrow.seller()
      expect(result).to.be.equal(seller.address)
    })

    it('Returns inspector', async () => {
      const { escrow, inspector } = await loadFixture(deployEscrowFixture)

      const result = await escrow.inspector()
      expect(result).to.be.equal(inspector.address)
    })

    it('Returns lender', async () => {
      const { escrow, lender } = await loadFixture(deployEscrowFixture)

      const result = await escrow.lender()
      expect(result).to.be.equal(lender.address)
    })
  })

  describe('Listing', () => {
    it('Updates as listed', async () => {
      const { escrow } = await loadFixture(listPropertyFixture)

      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true)
    })

    it('Updates ownership', async () => {
      const { realEstate, escrow } = await loadFixture(listPropertyFixture)
      expect(await realEstate.ownerOf(1)).to.be.equal(await escrow.getAddress())
    })

    it('Returns buyer', async () => {
      const { escrow, buyer } = await loadFixture(listPropertyFixture)

      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address)
    })

    it('Returns puchase price', async () => {
      const { escrow } = await loadFixture(listPropertyFixture)

      const result = await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10))
    })

    it('Returns escrow amount', async () => {
      const { escrow } = await loadFixture(listPropertyFixture)

      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5))
    })

    it('should throw an error is listing is attempted by non-seller', async () => {
      const { escrow, buyer } = await loadFixture(listPropertyFixture)

      await expect(escrow.connect(buyer).list(1, buyer.address, tokens(10), tokens(5))).to.be.revertedWith('Only seller can call this method');
    })
  })

  describe('Deposits', () => {
    it('Updates contract balance', async () => {
      const { escrow, buyer } = await loadFixture(listPropertyFixture)

      const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) });
      await transaction.wait();
      const result = await escrow.getBalance()
      expect(result).to.be.equal(tokens(5))
    })
  })

  describe('Inspection ', () => {
    it('Updates inspection status', async () => {
      const { escrow, inspector } = await loadFixture(listPropertyFixture)

      // Pre-condition checks
      expect(await escrow.inspectionPassed(1)).to.be.equal(false)
      // None-existing property
      expect(await escrow.inspectionPassed(2)).to.be.equal(false)

      const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true);
      await transaction.wait();
      const result = await escrow.inspectionPassed(1);
      expect(result).to.be.equal(true);
    })

    it('should throw an error if updating inspection status is attempted by non-inspector', async () => {
      const { escrow, seller } = await loadFixture(listPropertyFixture)

      await expect(escrow.connect(seller).updateInspectionStatus(1, true)).to.be.revertedWith('Only inspector can call this method');
    })
  })

  describe('Approval ', () => {
    it('Updates approval status', async () => {
      const { escrow, buyer, seller, lender } = await loadFixture(listPropertyFixture)

      // Block for the buyer to approve
      let transaction = await escrow.connect(buyer).approveSale(1);
      await transaction.wait();
      // We're explicitly testing the 3 addresses after every step to ensure the approval status is updated correctly
      expect(await escrow.approval(1, buyer.address)).to.be.equal(true);
      expect(await escrow.approval(1, seller.address)).to.be.equal(false);
      expect(await escrow.approval(1, lender.address)).to.be.equal(false);
      
      // Block for the seller to approve
      transaction = await escrow.connect(seller).approveSale(1);
      await transaction.wait();
      expect(await escrow.approval(1, buyer.address)).to.be.equal(true); // Should remain unchanged from previous step
      expect(await escrow.approval(1, seller.address)).to.be.equal(true);
      expect(await escrow.approval(1, lender.address)).to.be.equal(false);
      
      // Block for the lender to approve
      transaction = await escrow.connect(lender).approveSale(1);
      await transaction.wait();
      expect(await escrow.approval(1, buyer.address)).to.be.equal(true); // Should remain unchanged from previous step
      expect(await escrow.approval(1, seller.address)).to.be.equal(true); // Should remain unchanged from previous step
      expect(await escrow.approval(1, lender.address)).to.be.equal(true);
    })
  })
    
  describe('Sale ', async () => {
    it('Updates ownership', async () => {
      const { realEstate, buyer } = await loadFixture(finalizeSaleFixture)

      expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
    })

    it('Updates balance', async () => {
      const { escrow } = await loadFixture(finalizeSaleFixture)

      expect(await escrow.getBalance()).to.be.equal(0);
    })
  })
})
