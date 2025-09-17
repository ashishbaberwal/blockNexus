import { useEffect, useState, useCallback } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
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
    }, [escrow, home.id])

    const fetchOwner = useCallback(async () => {
      if (await escrow.isListed(home.id)) return 

      const ownerAddress = await escrow.buyer(home.id)
      setOwner(ownerAddress)
      
      // Fetch owner name from Firebase
      if (ownerAddress) {
        try {
          const ownerDoc = await getDoc(doc(db, 'users', ownerAddress));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            setOwnerName(ownerData.fullName || ownerData.name || 'Property Owner');
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
        if (result.success && result.transaction) {
          setTransaction(result.transaction);
          
          // Determine user role in this transaction
          if (result.transaction.buyerAddress === account) {
            setUserRole('buyer');
          } else if (result.transaction.sellerAddress === account) {
            setUserRole('seller');
          } else if (result.transaction.lenderAddress === account) {
            setUserRole('lender');
          } else if (result.transaction.inspectorAddress === account) {
            setUserRole('inspector');
          }
        }
      } catch (error) {
        console.error('Error loading transaction:', error);
      }
    }, [home.id, account])

    const buyHandler = async () => {
      if (!isAuthenticated || !user?.kycVerified) {
        alert('Please complete KYC verification before making a purchase.');
        return;
      }

      const escrowAmount = await escrow.escrowAmount(home.id)
      const signer = await provider.getSigner()

      try {
        // Create transaction in Firebase first
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

        const createResult = await createTransaction(transactionData);
        if (!createResult.success) {
          throw new Error('Failed to create transaction record');
        }

        // Buyer deposit earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Buyer approves...
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)

        // Send notifications to all parties
        await sendTransactionNotification(lender, 'lender_approval_required', {
          propertyName: home.name,
          transactionId: createResult.transactionId,
          propertyId: home.id.toString()
        });

        // Reload transaction data
        loadTransaction();
      } catch (error) {
        console.error('Error in buy handler:', error);
        alert('Transaction failed. Please try again.');
      }
    }

    const inspectHandler = async () => {
      const signer = await provider.getSigner()

      try {
        // Inspector updates status
        const blockchainTx = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await blockchainTx.wait()

        setHasInspected(true)

        // Update transaction status in Firebase
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
      } catch (error) {
        console.error('Error in inspect handler:', error);
      }
    }

    const lendHandler = async () => {
      const signer = await provider.getSigner()

      try {
        // Lender approves...
        const blockchainTx = await escrow.connect(signer).approveSale(home.id)
        await blockchainTx.wait()

        // Lender sends funds to contract...
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: await escrow.getAddress(), value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)

        // Update transaction status in Firebase
        if (transaction) {
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
        }
      } catch (error) {
        console.error('Error in lend handler:', error);
      }
    }

    const sellHandler = async () => {
      const signer = await provider.getSigner()

      try {
        // Seller approves...
        let blockchainTx = await escrow.connect(signer).approveSale(home.id)
        await blockchainTx.wait()

        // Seller finalize...
        blockchainTx = await escrow.connect(signer).finalizeSale(home.id)
        await blockchainTx.wait()
    
        setHasSold(true)

        // Update transaction status in Firebase
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
      } catch (error) {
        console.error('Error in sell handler:', error);
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
                  {(account === inspector) ? (
                    <button className="home__buy" onClick={inspectHandler} disabled={hasInspected}>
                      Approve Inspection
                    </button>
                  
                  ) : (account === lender) ? (
                    <button className="home__buy" onClick={lendHandler} disabled={hasLended}>
                      Approve & Lend
                    </button>
                    
                  ) : (account === seller) ? (
                    <button className="home__buy" onClick={sellHandler} disabled={hasSold}>
                      Approve & Sell
                    </button>
                  ): (
                    <button className="home__buy" onClick={buyHandler} disabled={hasBought}>
                      Buy
                    </button>
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

            <button onClick={togglePop} className="home__close">
              <img src={close} alt="Close" />
            </button>
          </div>
        </div>
    );
}

export default Home;
