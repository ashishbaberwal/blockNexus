# BlockNexus - Step-by-Step 

 This version introduces several improvements to ensure compatibility with modern Ethereum development tools.


## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- Javascript (React & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/) using [Node Version Manager (nvm)](https://nvm.sh):
  `$ nvm use || nvm install`

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:

> 💡 **Pro Tip:** To ensure you're using the correct Node.js version for this project, run "`nvm use || nvm install`" before installing dependencies.

`$ npm install`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal execute:
`$ npx hardhat ignition deploy ignition/modules/RealEstate.js --network localhost`

### 7. Start frontend
`$ npm run start`

## Running a Full Demo

This demo uses a Hardhat deployment script that initializes 4 predefined accounts:

- **`buyer`**: Account with index 0 in Hardhat  
- **`seller`**: Account with index 1 in Hardhat  
- **`inspector`**: Account with index 2 in Hardhat  
- **`lender`**: Account with index 3 in Hardhat  

### Prerequisites

1. Map the above accounts to your **Metamask wallet**:
   - Import the private keys for these accounts into Metamask if you haven't already.

---

### Steps to Complete a Property Purchase

1. **Open the Demo App**: Navigate to [http://localhost:3000](http://localhost:3000) in your browser.  
1. **Connect Metamask**: Connect your wallet to the app.  
   - The currently active account in Metamask doesn't matter during this step.  
1. **Select a Property**: Click on a property to view its details.  
1. **Perform Actions with the Specified Accounts**:
   - **Inspector**:  
     - Switch to the `inspector` account in Metamask.  
     - Click `Approve Inspection` and confirm the transaction in Metamask.  
   - **Lender**:  
     - Switch to the `lender` account in Metamask.  
     - Click `Approve and Lend` and confirm the transaction in Metamask.  
   - **Buyer**:  
     - Switch to the `buyer` account in Metamask.  
     - Click `Buy` and confirm the transaction in Metamask.  
   - **Seller**:  
     - Switch to the `seller` account in Metamask.  
     - Click `Approve & Sell` and confirm the transaction in Metamask.  

---

### Expected Result

After completing the last step, the property details should display:  
**"Owned by 0xf39F...2266"**  

This indicates that the property is now owned by the `buyer` account (`0xf39F...2266`), which corresponds to index 0 in Hardhat.  

**Note**: Hardhat initializes account addresses in a predictable way when starting up, ensuring consistent behavior during each run. 
 