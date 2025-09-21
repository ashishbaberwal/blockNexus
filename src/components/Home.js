import { useEffect, useState, useCallback } from 'react';
import { getTransactionByProperty, createTransaction, updateTransactionStatus, subscribeToTransaction } from '../services/transactionService';
import { useUser } from '../contexts/UserContext';
import TransactionProgress from './TransactionProgress';
import KYCDocumentViewer from './KYCDocumentViewer';
import EStampPaper from './EStampPaper';
import { sendTransactionNotification } from './NotificationSystem';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const { user, isAuthenticated } = useUser();
    const [hasBought, setHasBought] = useState(false)
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
      // -- Buyer

      const buyer = await escrow.buyer(home.id)

      const hasBought = await escrow.approval(home.id, buyer)
      setHasBought(hasBought)
      
      // -- Seller

      const seller = await escrow.seller()
      setSeller(seller)

      const hasSold = await escrow.approval(home.id, seller)
      setHasSold(hasSold)

      // -- Lender

      const lender = await escrow.lender()
      setLender(lender)

      const hasLended = await escrow.approval(home.id, lender)
      setHasLended(hasLended)

      // -- Inspector

      const inspector = await escrow.inspector()
      setInspector(inspector)

      const hasInspected = await escrow.inspectionPassed(home.id)
      setHasInspected(hasInspected)

      // Determine user role
      if (account) {
        console.log('Role detection debug:');
        console.log('account:', account);
        console.log('buyer:', buyer);
        console.log('seller:', seller);
        console.log('lender:', lender);
        console.log('inspector:', inspector);
        console.log('account === seller:', account === seller);
        console.log('account === lender:', account === lender);
        console.log('account === inspector:', account === inspector);
        console.log('account.toLowerCase() === seller.toLowerCase():', account.toLowerCase() === seller.toLowerCase());
        
        if (account.toLowerCase() === seller.toLowerCase()) {
          setUserRole('seller');
          console.log('Set role to seller');
        } else if (account.toLowerCase() === lender.toLowerCase()) {
          setUserRole('lender');
          console.log('Set role to lender');
        } else if (account.toLowerCase() === inspector.toLowerCase()) {
          setUserRole('inspector');
          console.log('Set role to inspector');
        } else {
          setUserRole('buyer');
          console.log('Set role to buyer (default for any connected account)');
        }
      } else {
        setUserRole(null);
        console.log('No account, role set to null');
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
      
      // Debug contract availability
      console.log('Contract debug info:');
      console.log('- escrow contract:', escrow ? 'Available' : 'Not available');
      console.log('- provider:', provider ? 'Available' : 'Not available');
      console.log('- account:', account);
      console.log('- home.id:', home.id);
      
      if (!isAuthenticated) {
        window.alert('Please connect your wallet first.');
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
        // Check if contracts are available
        if (!escrow || !provider) {
          throw new Error('Blockchain connection not available. Please refresh the page and try again.');
        }

        // Check if this is a blockchain property (ID 1-3) or UI-only property (ID 4+)
        const isBlockchainProperty = parseInt(home.id) <= 3;
        let createResult = null;
        
        if (isBlockchainProperty) {
          // Handle blockchain properties with escrow contract
          console.log('Processing blockchain property transaction...');
          
          try {
            const escrowAmount = await escrow.escrowAmount(home.id)
            console.log('Escrow amount:', escrowAmount.toString());
            
            const signer = await provider.getSigner()
            console.log('Signer obtained:', signer.address);

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

            createResult = await createTransaction(transactionData);
            console.log('Transaction created in localStorage:', createResult.id);

            // Check if property is already listed
            const isListed = await escrow.isListed(home.id);
            console.log('Property is listed:', isListed);
            
            if (!isListed) {
              throw new Error('Property is not listed for sale');
            }

            // Step 1: Buyer deposit earnest - This will call MetaMask
            console.log('Step 1: Buyer depositing earnest money...');
            let transaction = await escrow.connect(signer).depositEarnest(home.id, { 
              value: escrowAmount,
              gasLimit: 300000
            });
            console.log('Deposit transaction sent:', transaction.hash);
            await transaction.wait();
            console.log('✅ Buyer deposit confirmed');

            // Step 2: Buyer approves - This will call MetaMask again
            console.log('Step 2: Buyer approving sale...');
            transaction = await escrow.connect(signer).approveSale(home.id, {
              gasLimit: 200000
            });
            console.log('Approve transaction sent:', transaction.hash);
            await transaction.wait();
            console.log('✅ Buyer approval confirmed');

            setHasBought(true)
            setBuyRequestSent(true)
            console.log('✅ Buyer transaction completed successfully');
            window.alert('✅ Purchase initiated! Please wait for lender, inspector, and seller approvals.');
          } catch (blockchainError) {
            console.error('Blockchain transaction error:', blockchainError);
            
            // Provide more specific error messages
            if (blockchainError.code === 'ACTION_REJECTED') {
              throw new Error('Transaction was rejected by user. Please try again and approve the transaction in MetaMask.');
            } else if (blockchainError.code === 'INSUFFICIENT_FUNDS') {
              throw new Error('Insufficient ETH balance. Please add more ETH to your wallet.');
            } else if (blockchainError.message?.includes('execution reverted')) {
              throw new Error('Transaction failed: ' + blockchainError.message);
            } else if (blockchainError.message?.includes('not listed')) {
              throw new Error('This property is not available for purchase.');
            } else {
              throw new Error('Blockchain transaction failed: ' + (blockchainError.message || 'Unknown error'));
            }
          }
        } else {
          // Handle UI-only properties (no blockchain interaction)
          const transactionData = {
            propertyId: home.id.toString(),
            propertyName: home.name,
            propertyAddress: home.address,
            buyerAddress: account,
            sellerAddress: 'UI-Property-Seller', // Placeholder for UI properties
            lenderAddress: 'UI-Property-Lender', // Placeholder for UI properties
            inspectorAddress: 'UI-Property-Inspector', // Placeholder for UI properties
            salePrice: parseFloat(home.attributes[0].value),
            currency: 'ETH',
            participants: [account, 'UI-Property-Seller', 'UI-Property-Lender', 'UI-Property-Inspector'],
            propertyDetails: {
              name: home.name,
              address: home.address,
              bedrooms: home.attributes[2]?.value || 0,
              bathrooms: home.attributes[3]?.value || 0,
              sqft: home.attributes[4]?.value || 0,
              description: home.description
            },
            status: 'ui_property_request',
            isUIProperty: true
          };

          createResult = await createTransaction(transactionData);
          
          setHasBought(true)
          setBuyRequestSent(true)
          
          // Show success message for UI properties
          window.alert(`Purchase request submitted for ${home.name}! This is a UI-only property, so the transaction will be processed through our internal system.`);
        }

        // Send notifications to all parties (only for blockchain properties)
        if (isBlockchainProperty && createResult) {
          await sendTransactionNotification(lender, 'lender_approval_required', {
            propertyName: home.name,
            transactionId: createResult.id,
            propertyId: home.id.toString()
          });
        }

        // Reload transaction data
        loadTransaction();
      } catch (error) {
        console.error('Error in buy handler:', error);
        
        // Show specific error message based on error type
        let errorMessage = 'Transaction failed. Please try again.';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.code === 'ACTION_REJECTED') {
          errorMessage = 'Transaction was rejected. Please try again and approve the transaction in MetaMask.';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
          errorMessage = 'Insufficient ETH balance. Please add more ETH to your wallet.';
        } else if (error.message?.includes('User denied')) {
          errorMessage = 'Transaction was cancelled. Please try again.';
        } else if (error.message?.includes('not connected')) {
          errorMessage = 'Wallet not connected. Please connect your wallet and try again.';
        }
        
        window.alert(errorMessage);
      }
    }

    const inspectHandler = async () => {
      console.log('Inspect button clicked!');
      
      if (!isAuthenticated) {
        window.alert('Please connect your wallet first.');
        return;
      }
      
      // Check if contracts are available
      if (!escrow || !provider) {
        window.alert('Blockchain connection not available. Please refresh the page and try again.');
        return;
      }
      
      // Check if current account is the inspector
      if (!inspector || account.toLowerCase() !== inspector.toLowerCase()) {
        window.alert('Only the inspector can approve inspections.');
        return;
      }

      try {
        const signer = await provider.getSigner()
        
        // Check if property is listed
        const isListed = await escrow.isListed(home.id);
        if (!isListed) {
          throw new Error('Property is not listed for sale');
        }
        
        // Step 3: Inspector updates status - This will call MetaMask
        console.log('Step 3: Inspector approving inspection...');
        const blockchainTx = await escrow.connect(signer).updateInspectionStatus(home.id, true, {
          gasLimit: 100000
        });
        console.log('Inspection transaction sent:', blockchainTx.hash);
        await blockchainTx.wait();
        console.log('✅ Inspector approval confirmed');

        setHasInspected(true)

        // Update transaction status in localStorage
        if (transaction) {
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
        }
        
        window.alert('✅ Inspection approved successfully! Lender can now proceed.');
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
        
        // Step 4: Lender approves - This will call MetaMask
        console.log('Step 4: Lender approving sale...');
        const blockchainTx = await escrow.connect(signer).approveSale(home.id, {
          gasLimit: 200000
        });
        console.log('Lender approval transaction sent:', blockchainTx.hash);
        await blockchainTx.wait();
        console.log('✅ Lender approval confirmed');

        // Step 5: Lender sends funds to contract - This will call MetaMask again
        console.log('Step 5: Lender sending funds...');
        const fundTx = await signer.sendTransaction({ 
          to: escrow.target, 
          value: lendAmount.toString(), 
          gasLimit: 100000 
        });
        console.log('Fund transaction sent:', fundTx.hash);
        await fundTx.wait();
        console.log('✅ Lender funds sent successfully');

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
        
        window.alert('✅ Lending approved and funds sent successfully! Seller can now finalize the sale.');
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
        console.log('Starting sell process...');
        console.log('Home ID:', home.id);
        console.log('Account:', account);
        console.log('Seller address from contract:', seller);
        
        // Check if current account is the seller
        if (account.toLowerCase() !== seller.toLowerCase()) {
          window.alert('Only the seller can approve and finalize the sale.');
          return;
        }

        // Step 6: Seller approves - This will call MetaMask
        console.log('Step 6: Seller approving sale...');
        let blockchainTx = await escrow.connect(signer).approveSale(home.id, {
          gasLimit: 200000
        });
        console.log('Seller approval transaction sent:', blockchainTx.hash);
        await blockchainTx.wait();
        console.log('✅ Seller approval confirmed');

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

        // Step 7: Seller finalizes sale - This will call MetaMask
        console.log('Step 7: Seller finalizing sale...');
        blockchainTx = await escrow.connect(signer).finalizeSale(home.id, {
          gasLimit: 300000
        });
        console.log('Finalize transaction sent:', blockchainTx.hash);
        await blockchainTx.wait();
        console.log('✅ Sale finalized successfully');
    
        setHasSold(true)

        // Update transaction status in localStorage
        if (transaction) {
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
        }
        
        window.alert('🎉 Sale completed successfully! Property has been transferred to the buyer.');
      } catch (error) {
        console.error('Error in sell handler:', error);
        window.alert('Transaction failed: ' + error.message);
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
                  ) : (account && inspector && account.toLowerCase() === inspector.toLowerCase()) || userRole === 'inspector' ? (
                    <button className="home__buy" onClick={inspectHandler} disabled={hasInspected}>
                      {hasInspected ? 'Inspection Approved' : 'Approve Inspection'}
                    </button>
                  ) : account && lender && account.toLowerCase() === lender.toLowerCase() ? (
                    <button className="home__buy" onClick={lendHandler} disabled={hasLended}>
                      Approve & Lend
                    </button>
                  ) : account && seller && account.toLowerCase() === seller.toLowerCase() ? (
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

            <button onClick={() => togglePop(null)} className="home__close">
              <img src={close} alt="Close" />
            </button>
          </div>
        </div>
    );
}

export default Home;
