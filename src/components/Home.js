import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getTransactionByProperty, createTransaction, updateTransactionStatus, subscribeToTransaction } from '../services/transactionService';
import { useUser } from '../contexts/UserContext';
import TransactionProgress from './TransactionProgress';
import KYCDocumentViewer from './KYCDocumentViewer';
import EStampPaper from './EStampPaper';
import { sendTransactionNotification } from './NotificationSystem';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const { user, isAuthenticated } = useUser();
  const [hasBought, setHasBought] = useState(false) // eslint-disable-line no-unused-vars
  const [hasLended, setHasLended] = useState(false)
  const [hasInspected, setHasInspected] = useState(false)
  const [hasSold, setHasSold] = useState(false)
  const [lender, setLender] = useState(null)
  const [inspector, setInspector] = useState(null)
  const [seller, setSeller] = useState(null)
  const [buyRequestSent, setBuyRequestSent] = useState(false)

  const [owner, setOwner] = useState(null)
  const [ownerName, setOwnerName] = useState(null)
  const [transaction, setTransaction] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDetails = useCallback(async () => {
    try {
      if (!escrow) {
        console.log('No escrow contract available, using default buyer role');
        if (account) {
          setUserRole('buyer');
        }
        return;
      }

      // -- Buyer
      const buyer = await escrow.buyer(home.id);
      const hasBought = await escrow.approval(home.id, buyer);
      setHasBought(hasBought);

      // -- Seller
      const seller = await escrow.seller();
      setSeller(seller);
      const hasSold = await escrow.approval(home.id, seller);
      setHasSold(hasSold);

      // -- Lender
      const lender = await escrow.lender();
      setLender(lender);
      const hasLended = await escrow.approval(home.id, lender);
      setHasLended(hasLended);

      // -- Inspector
      const inspector = await escrow.inspector();
      setInspector(inspector);
      const hasInspected = await escrow.inspectionPassed(home.id);
      setHasInspected(hasInspected);

      // Determine user role
      if (account) {
        console.log('Role detection debug:');
        console.log('account:', account);
        console.log('buyer:', buyer);
        console.log('seller:', seller);
        console.log('lender:', lender);
        console.log('inspector:', inspector);

        // First check smart contract roles
        if (seller && account.toLowerCase() === seller.toLowerCase()) {
          setUserRole('seller');
          console.log('Set role to seller (from contract)');
        } else if (lender && account.toLowerCase() === lender.toLowerCase()) {
          setUserRole('lender');
          console.log('Set role to lender (from contract)');
        } else if (inspector && account.toLowerCase() === inspector.toLowerCase()) {
          setUserRole('inspector');
          console.log('Set role to inspector (from contract)');
        } else {
          // Fallback: Demo role assignment based on wallet address pattern
          const accountLower = account.toLowerCase();
          
          // Demo role assignment for testing (you can modify these patterns)
          if (accountLower.includes('seller') || accountLower.endsWith('1')) {
            setUserRole('seller');
            console.log('Set role to seller (demo pattern)');
          } else if (accountLower.includes('lender') || accountLower.endsWith('2')) {
            setUserRole('lender');
            console.log('Set role to lender (demo pattern)');
          } else if (accountLower.includes('inspector') || accountLower.endsWith('3')) {
            setUserRole('inspector');
            console.log('Set role to inspector (demo pattern)');
          } else {
            setUserRole('buyer');
            console.log('Set role to buyer (default)');
          }
        }
      } else {
        setUserRole(null);
        console.log('No account, role set to null');
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
      // Fallback: if contracts fail, default to buyer role for any connected account
      if (account) {
        setUserRole('buyer');
        console.log('Contract error, defaulting to buyer role');
      } else {
        setUserRole(null);
      }
    }
  }, [escrow, home.id, account])

  const fetchOwner = useCallback(async () => {
    if (await escrow.isListed(home.id)) return

    const ownerAddress = await escrow.buyer(home.id)
    setOwner(ownerAddress)

    // Fetch owner name from localStorage
    if (ownerAddress) {
      try {
        // Try to get user data from localStorage
        const userData = localStorage.getItem('blockNexusUser');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.walletAddress === ownerAddress) {
            setOwnerName(parsedData.fullName || parsedData.name || 'Property Owner');
          } else {
            setOwnerName(`${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
          }
        } else {
          setOwnerName(`${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
        }
      } catch (error) {
        console.error('Error fetching owner data:', error);
        setOwnerName(`${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`);
      }
    }
  }, [escrow, home.id])

  const loadTransaction = useCallback(async () => {
    try {
      const result = await getTransactionByProperty(home.id.toString());
      if (result) {
        setTransaction(result);

        // Determine user role in this transaction
        if (result.buyerAddress === account) {
          setUserRole('buyer');
        } else if (result.sellerAddress === account) {
          setUserRole('seller');
        } else if (result.lenderAddress === account) {
          setUserRole('lender');
        } else if (result.inspectorAddress === account) {
          setUserRole('inspector');
        }
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
  }, [home.id, account])


  const buyHandler = async () => {
    console.log('Buy button clicked!');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user?.kycVerified:', user?.kycVerified);

    if (!isAuthenticated) {
      window.alert('Please connect your wallet first.');
      return;
    }

    // Test MetaMask connection
    if (!window.ethereum) {
      window.alert('MetaMask not detected. Please install MetaMask to make purchases.');
      return;
    }

    try {
      // Test if we can get accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        window.alert('No MetaMask accounts found. Please connect your wallet.');
        return;
      }
      console.log('MetaMask accounts:', accounts);
    } catch (metaMaskError) {
      console.error('MetaMask connection error:', metaMaskError);
      window.alert('Failed to connect to MetaMask. Please check your wallet connection.');
      return;
    }

    // Check KYC status - must be properly verified
    let isKYCVerified = false;

    console.log('KYC Verification Check:');
    console.log('- user?.kycVerified:', user?.kycVerified);
    console.log('- user?.kycStatus:', user?.kycStatus);
    console.log('- account:', account);

    // Check user context KYC status first
    if (user?.kycVerified) {
      isKYCVerified = true;
      console.log('✅ KYC verified through user context');
    } else {
      // Check localStorage for KYC data
      const kycData = localStorage.getItem('blockNexusKYC_' + account);
      console.log('- KYC data from localStorage:', kycData ? 'Found' : 'Not found');

      if (kycData) {
        try {
          const parsedKYC = JSON.parse(kycData);
          console.log('- Parsed KYC data:', parsedKYC);
          console.log('- verificationStatus:', parsedKYC.verificationStatus);
          console.log('- status:', parsedKYC.status);

          isKYCVerified = parsedKYC.verificationStatus === 'approved' || parsedKYC.status === 'approved';
          console.log('- isKYCVerified from localStorage:', isKYCVerified);
        } catch (error) {
          console.error('Error parsing KYC data:', error);
          isKYCVerified = false;
        }
      }
    }

    console.log('Final KYC verification result:', isKYCVerified);

    if (!isKYCVerified) {
      window.alert('Please complete KYC verification before making a purchase. You can complete KYC from your profile or settings.');
      return;
    }

    try {
      // Check if we have the necessary blockchain components
      if (!provider) {
        window.alert('Blockchain provider not available. Please ensure MetaMask is connected and refresh the page.');
        return;
      }

      if (!escrow) {
        window.alert('Smart contracts not available. Please ensure you are connected to the correct network and contracts are deployed.');
        return;
      }

      console.log('Starting blockchain transaction...');
      console.log('Property ID:', home.id);
      console.log('Escrow contract:', escrow);

      // Get escrow amount from contract
      const escrowAmount = await escrow.escrowAmount(home.id);
      console.log('Escrow amount:', escrowAmount.toString());

      const signer = await provider.getSigner();
      console.log('Signer obtained:', await signer.getAddress());

      // Check user's balance
      const balance = await provider.getBalance(account);
      console.log('User balance:', balance.toString());

      if (balance < escrowAmount) {
        window.alert('Insufficient balance. You need at least ' + ethers.formatEther(escrowAmount) + ' ETH for this transaction.');
        return;
      }

      // Create transaction in localStorage first
      const transactionData = {
        propertyId: home.id.toString(),
        propertyName: home.name,
        propertyAddress: home.address,
        buyerAddress: account,
        sellerAddress: seller,
        lenderAddress: lender,
        inspectorAddress: inspector,
        salePrice: parseFloat(home.attributes[0].value),
        currency: 'ETH',
        participants: [account, seller, lender, inspector],
        propertyDetails: {
          name: home.name,
          address: home.address,
          bedrooms: home.attributes[2].value,
          bathrooms: home.attributes[3].value,
          sqft: home.attributes[4].value,
          description: home.description
        }
      };

      let createResult;
      try {
        createResult = await createTransaction(transactionData);
        console.log('Transaction created in localStorage:', createResult);
      } catch (transactionError) {
        console.warn('Failed to create transaction in localStorage:', transactionError);
        // Continue with blockchain transaction even if localStorage fails
        createResult = { id: 'temp_' + Date.now() };
      }

      // Buyer deposit earnest - This will call MetaMask
      console.log('Depositing earnest money...');
      console.log('Amount to deposit:', ethers.formatEther(escrowAmount), 'ETH');
      
      let transaction = await escrow.connect(signer).depositEarnest(home.id, { 
        value: escrowAmount,
        gasLimit: 300000 // Set gas limit to avoid estimation issues
      });
      console.log('Earnest deposit transaction sent:', transaction.hash);
      
      // Wait for confirmation
      const receipt1 = await transaction.wait();
      console.log('Earnest deposit confirmed in block:', receipt1.blockNumber);

      // Buyer approves - This will call MetaMask again
      console.log('Approving sale...');
      transaction = await escrow.connect(signer).approveSale(home.id, {
        gasLimit: 200000 // Set gas limit
      });
      console.log('Approval transaction sent:', transaction.hash);
      
      const receipt2 = await transaction.wait();
      console.log('Sale approval confirmed in block:', receipt2.blockNumber);

      setHasBought(true);
      setBuyRequestSent(true);

      // Send notifications to all parties
      await sendTransactionNotification(lender, 'lender_approval_required', {
        propertyName: home.name,
        transactionId: createResult.id,
        propertyId: home.id.toString()
      });

      // Reload transaction data
      loadTransaction();

      window.alert('Purchase successful! Your transaction has been recorded on the blockchain.');
    } catch (error) {
      console.error('Error in buy handler:', error);
      
      let errorMessage = 'Transaction failed. ';
      
      if (error.code === 4001) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.code === -32603) {
        errorMessage += 'Internal error. Please check your network connection and try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas fees.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage += 'Transaction was cancelled by user.';
      } else if (error.message?.includes('network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('contract')) {
        errorMessage += 'Smart contract error. The contracts may not be deployed on this network.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      window.alert(errorMessage);
    }
  }

  const inspectHandler = async () => {
    console.log('Inspect button clicked!');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('account:', account);
    console.log('inspector:', inspector);

    if (!isAuthenticated) {
      window.alert('Please connect your wallet first.');
      return;
    }

    // Check if current account is the inspector
    if (account.toLowerCase() !== inspector.toLowerCase()) {
      window.alert('Only the inspector can approve inspections.');
      return;
    }

    try {
      const signer = await provider.getSigner()

      console.log('Starting inspection approval...');
      console.log('Home ID:', home.id);
      console.log('Account:', account);
      console.log('Inspector address from contract:', inspector);

      // Inspector updates status
      console.log('Calling updateInspectionStatus...');
      const blockchainTx = await escrow.connect(signer).updateInspectionStatus(home.id, true)
      await blockchainTx.wait()
      console.log('updateInspectionStatus completed');

      setHasInspected(true)

      // Update transaction status in localStorage
      if (transaction) {
        try {
          await updateTransactionStatus(transaction.id, 'inspector_approved', 'inspector');

          // Send notifications
          await sendTransactionNotification(transaction.buyerAddress, 'inspector_approved', {
            propertyName: home.name,
            transactionId: transaction.id
          });

          await sendTransactionNotification(transaction.sellerAddress, 'seller_approval_required', {
            propertyName: home.name,
            transactionId: transaction.id
          });
        } catch (notificationError) {
          console.warn('Error updating transaction status or sending notifications:', notificationError);
          // Don't fail the whole process for notification errors
        }
      }

      window.alert('Inspection approved successfully!');
    } catch (error) {
      console.error('Error in inspect handler:', error);
      window.alert('Inspection approval failed: ' + (error.message || 'Unknown error'));
    }
  }

  const lendHandler = async () => {
    console.log('Lend button clicked!');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('account:', account);
    console.log('lender:', lender);

    if (!isAuthenticated) {
      window.alert('Please connect your wallet first.');
      return;
    }

    // Check if current account is the lender
    if (account.toLowerCase() !== lender.toLowerCase()) {
      window.alert('Only the lender can approve and provide funding.');
      return;
    }

    try {
      const signer = await provider.getSigner()

      console.log('Starting lending process...');
      console.log('Home ID:', home.id);
      console.log('Account:', account);
      console.log('Lender address from contract:', lender);

      // Get amounts
      const purchasePrice = await escrow.purchasePrice(home.id);
      const escrowAmount = await escrow.escrowAmount(home.id);
      const lendAmount = purchasePrice - escrowAmount;

      console.log('Purchase price:', purchasePrice.toString());
      console.log('Escrow amount:', escrowAmount.toString());
      console.log('Lend amount:', lendAmount.toString());

      if (lendAmount <= 0) {
        window.alert('No additional funds needed from lender.');
        return;
      }

      // Lender approves...
      console.log('Calling approveSale...');
      const blockchainTx = await escrow.connect(signer).approveSale(home.id)
      await blockchainTx.wait()
      console.log('approveSale completed');

      // Lender sends funds to contract...
      console.log('Sending funds to contract...');
      const fundTx = await signer.sendTransaction({
        to: await escrow.getAddress(),
        value: lendAmount.toString(),
        gasLimit: 100000
      });
      await fundTx.wait();
      console.log('Funds sent successfully');

      setHasLended(true)

      // Update transaction status in localStorage
      if (transaction) {
        try {
          await updateTransactionStatus(transaction.id, 'lender_approved', 'lender');
          await updateTransactionStatus(transaction.id, 'under_inspection', 'system');

          // Send notifications
          await sendTransactionNotification(transaction.buyerAddress, 'lender_approved', {
            propertyName: home.name,
            transactionId: transaction.id
          });

          await sendTransactionNotification(transaction.inspectorAddress, 'inspection_required', {
            propertyName: home.name,
            transactionId: transaction.id
          });
        } catch (notificationError) {
          console.warn('Error updating transaction status or sending notifications:', notificationError);
          // Don't fail the whole process for notification errors
        }
      }

      window.alert('Lending approved and funds sent successfully!');
    } catch (error) {
      console.error('Error in lend handler:', error);
      window.alert('Lending failed: ' + (error.message || 'Unknown error'));
    }
  }

  const sellHandler = async () => {
    console.log('Sell button clicked!');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user?.kycVerified:', user?.kycVerified);

    if (!isAuthenticated) {
      window.alert('Please connect your wallet first.');
      return;
    }

    // Check KYC status - must be properly verified
    let isKYCVerified = false;

    console.log('KYC Verification Check for Seller:');
    console.log('- user?.kycVerified:', user?.kycVerified);
    console.log('- user?.kycStatus:', user?.kycStatus);
    console.log('- account:', account);

    // Check user context KYC status first
    if (user?.kycVerified) {
      isKYCVerified = true;
      console.log('✅ KYC verified through user context');
    } else {
      // Check localStorage for KYC data
      const kycData = localStorage.getItem('blockNexusKYC_' + account);
      console.log('- KYC data from localStorage:', kycData ? 'Found' : 'Not found');

      if (kycData) {
        try {
          const parsedKYC = JSON.parse(kycData);
          console.log('- Parsed KYC data:', parsedKYC);
          console.log('- verificationStatus:', parsedKYC.verificationStatus);
          console.log('- status:', parsedKYC.status);

          isKYCVerified = parsedKYC.verificationStatus === 'approved' || parsedKYC.status === 'approved';
          console.log('- isKYCVerified from localStorage:', isKYCVerified);
        } catch (error) {
          console.error('Error parsing KYC data:', error);
          isKYCVerified = false;
        }
      }
    }

    console.log('Final KYC verification result for seller:', isKYCVerified);

    if (!isKYCVerified) {
      window.alert('Please complete KYC verification before finalizing a sale. You can complete KYC from your profile or settings.');
      return;
    }

    const signer = await provider.getSigner()

    try {
      // Check if we have the necessary blockchain components
      if (!provider) {
        window.alert('Blockchain provider not available. Please ensure MetaMask is connected and refresh the page.');
        return;
      }

      if (!escrow) {
        // For demo properties or when contracts aren't available, simulate the sale
        console.log('Smart contracts not available, simulating sale...');
        setHasSold(true);
        window.alert('Sale completed successfully! (Demo Mode - In a real deployment, this would interact with blockchain smart contracts)');
        return;
      }

      console.log('Starting blockchain sell process...');
      console.log('Home ID:', home.id);
      console.log('Account:', account);
      console.log('Seller address from contract:', seller);

      // Check if current account is the seller
      if (seller && account.toLowerCase() !== seller.toLowerCase()) {
        window.alert('Only the seller can approve and finalize the sale.');
        return;
      }

      // Seller approves...
      console.log('Calling approveSale...');
      let blockchainTx = await escrow.connect(signer).approveSale(home.id, {
        gasLimit: 200000 // Set gas limit
      });
      await blockchainTx.wait();
      console.log('approveSale completed');

      // Check if all approvals are in place before finalizing
      const buyerApproval = await escrow.approval(home.id, await escrow.buyer(home.id));
      const sellerApproval = await escrow.approval(home.id, seller);
      const lenderApproval = await escrow.approval(home.id, lender);
      const inspectionPassed = await escrow.inspectionPassed(home.id);

      console.log('Approval status:');
      console.log('- Buyer approval:', buyerApproval);
      console.log('- Seller approval:', sellerApproval);
      console.log('- Lender approval:', lenderApproval);
      console.log('- Inspection passed:', inspectionPassed);

      if (!buyerApproval || !lenderApproval || !inspectionPassed) {
        window.alert('Cannot finalize sale yet. All parties must approve and inspection must be passed.');
        return;
      }

      // Seller finalize...
      console.log('Calling finalizeSale...');
      blockchainTx = await escrow.connect(signer).finalizeSale(home.id, {
        gasLimit: 300000 // Set gas limit
      });
      await blockchainTx.wait();
      console.log('finalizeSale completed');

      setHasSold(true);

      // Update transaction status if transaction exists
      try {
        if (transaction && transaction.id) {
          await updateTransactionStatus(transaction.id, 'seller_approved', 'seller');
          await updateTransactionStatus(transaction.id, 'completed', 'system');

          // Send completion notifications to all parties
          const parties = [transaction.buyerAddress, transaction.sellerAddress, transaction.lenderAddress, transaction.inspectorAddress];
          for (const party of parties) {
            await sendTransactionNotification(party, 'transaction_complete', {
              propertyName: home.name,
              transactionId: transaction.id
            });
          }
        } else {
          console.log('No transaction record found, skipping transaction status update');
        }
      } catch (transactionError) {
        console.warn('Error updating transaction status:', transactionError);
        // Don't fail the whole process for transaction update errors
      }

      window.alert('Sale completed successfully!');
    } catch (error) {
      console.error('Error in sell handler:', error);
      
      let errorMessage = 'Sale failed. ';
      
      if (error.code === 4001) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas fees.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage += 'Transaction was cancelled by user.';
      } else if (error.message?.includes('network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('contract')) {
        errorMessage += 'Smart contract error. The contracts may not be deployed on this network.';
      } else if (error.message?.includes('not found')) {
        // Handle the specific "Transaction not found" error
        errorMessage += 'Transaction record not found. This may be a demo property.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      window.alert(errorMessage);
    }
  }

  useEffect(() => {
    fetchDetails()
    fetchOwner()
    loadTransaction()
  }, [fetchDetails, fetchOwner, loadTransaction, hasSold])



  // Real-time transaction updates
  useEffect(() => {
    let unsubscribe;
    if (transaction?.id) {
      unsubscribe = subscribeToTransaction(transaction.id, (updatedTransaction) => {
        if (updatedTransaction) {
          setTransaction(updatedTransaction);
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [transaction?.id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h1>{home.name}</h1>
            <p>
              <strong>{home.attributes[2].value}</strong> bds |
              <strong>{home.attributes[3].value}</strong> ba |
              <strong>{home.attributes[4].value}</strong> sqft
            </p>
            <p>{home.address}</p>
            <h2>{home.attributes[0].value} ETH</h2>

            {owner ? (
              <div className="home__owned">
                Owned by {ownerName || `${owner.slice(0, 6)}...${owner.slice(-4)}`}
              </div>
            ) : (
              <div>
                {!account ? (
                  <button className="home__buy" disabled>
                    Connect Wallet to Buy
                  </button>
                ) : userRole === 'inspector' ? (
                  <button className="home__buy" onClick={inspectHandler} disabled={hasInspected}>
                    Approve Inspection
                  </button>
                ) : userRole === 'lender' ? (
                  <button className="home__buy" onClick={lendHandler} disabled={hasLended}>
                    {hasLended ? 'Funds Transferred' : 'Approve & Lend'}
                  </button>
                ) : userRole === 'seller' ? (
                  <button className="home__buy" onClick={sellHandler} disabled={hasSold}>
                    Approve & Sell
                  </button>
                ) : (
                  <div>
                    <button
                      className="home__buy"
                      onClick={buyRequestSent ? null : buyHandler}
                      disabled={buyRequestSent}
                      style={{
                        backgroundColor: buyRequestSent ? '#28a745' : '#ff6b35',
                        color: 'white',
                        padding: '15px',
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: buyRequestSent ? 'not-allowed' : 'pointer',
                        marginBottom: '10px',
                        display: 'block',
                        width: '100%'
                      }}
                    >
                      {buyRequestSent ? 'Request Sent' : 'Buy Property'}
                    </button>
                  </div>
                )}

                <button className="home__contact">
                  Contact agent
                </button>
              </div>
            )}

            <hr />

            <h2>Overview</h2>
            <p>{home.description}</p>

            <hr />

            <h2>Fact and features</h2>
            <ul>
              {home.attributes.map((attribute, index) => (
                <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
              ))}
            </ul>
          </div>
        );

      case 'progress':
        return transaction ? (
          <TransactionProgress transaction={transaction} userRole={userRole} />
        ) : (
          <div className="no-transaction">
            <p>No active transaction for this property.</p>
          </div>
        );

      case 'documents':
        return transaction ? (
          <KYCDocumentViewer
            transaction={transaction}
            currentUserRole={userRole}
            currentUserAddress={account}
          />
        ) : (
          <div className="no-transaction">
            <p>No transaction documents available.</p>
          </div>
        );

      case 'stamp':
        return transaction && userRole === 'inspector' ? (
          <EStampPaper transaction={transaction} currentUserRole={userRole} />
        ) : (
          <div className="no-access">
            <p>E-Stamp paper access restricted to government inspector.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>

        <div className="home__content">
          <div className="home__tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              🏠 Overview
            </button>

            {/* Role Selector for Testing */}
            {account && process.env.NODE_ENV === 'development' && (
              <div className="role-selector" style={{ 
                marginLeft: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                <span>Role:</span>
                <select 
                  value={userRole || 'buyer'} 
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    console.log('Manual role change to:', e.target.value);
                  }}
                  style={{ fontSize: '12px', padding: '2px' }}
                >
                  <option value="buyer">👤 Buyer</option>
                  <option value="seller">🏠 Seller</option>
                  <option value="lender">🏦 Lender</option>
                  <option value="inspector">🔍 Inspector</option>
                </select>
              </div>
            )}

            {transaction && (
              <button
                className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('progress')}
              >
                📊 Progress
              </button>
            )}

            {transaction && userRole && ['lender', 'inspector', 'seller'].includes(userRole) && (
              <button
                className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                📄 Documents
              </button>
            )}

            {transaction && userRole === 'inspector' && (
              <button
                className={`tab-button ${activeTab === 'stamp' ? 'active' : ''}`}
                onClick={() => setActiveTab('stamp')}
              >
                📜 E-Stamp
              </button>
            )}
          </div>

          <div className="home__overview">
            {renderTabContent()}
          </div>
        </div>

        <button onClick={togglePop} className="home__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default Home;
