const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const IPFS_BASE_URL = "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB";

module.exports = buildModule("RealEstateDeployment", (m) => {
  // Get signers
  const buyer = m.getAccount(0);
  const seller = m.getAccount(1);
  const inspector = m.getAccount(2);
  const lender = m.getAccount(3);

  // Deploy RealEstate contract
  const realEstate = m.contract("RealEstate");

  // Mint 3 properties with unique IDs
  const mintedProperties = [];
  for (let i = 0; i < 3; i++) {
    const mint = m.call(realEstate, "mint", [`${IPFS_BASE_URL}/${i + 1}.json`], {
      from: seller,
      id: `mint_property_${i + 1}`
    });
    mintedProperties.push(mint);
  }

  // Deploy Escrow with RealEstate address
  const escrow = m.contract("Escrow", [
    realEstate,
    seller,
    inspector,
    lender
  ]);

  // Approve properties with unique IDs
  const approvedProperties = [];
  for (let i = 0; i < 3; i++) {
    const approve = m.call(
      realEstate,
      "approve",
      [escrow, i + 1],
      { from: seller, id: `approve_property_${i + 1}`, after: [mintedProperties[i]] }
    );
    approvedProperties.push(approve);
  }

  m.call(
    escrow,
    "list",
    [1, buyer, tokens(20), tokens(10)],
    {
      from: seller,
      id: 'list_property_1',
      after: [approvedProperties[0]],
    }
  );

  m.call(
    escrow,
    "list",
    [2, buyer, tokens(15), tokens(5)],
    {
      from: seller,
      id: 'list_property_2',
      after: [approvedProperties[1]],
    }
  );

  m.call(
    escrow,
    "list",
    [3, buyer, tokens(10), tokens(5)],
    {
      from: seller,
      id: 'list_property_3',
      after: [approvedProperties[2]],
    }
  );

  return { realEstate, escrow };
}); 