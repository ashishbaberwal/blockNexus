import React, { useState, useEffect } from 'react';
import { generateEStampPaper } from '../services/transactionService';
import './EStampPaper.css';

const EStampPaper = ({ transaction, currentUserRole }) => {
  const [eStampData, setEStampData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signatures, setSignatures] = useState({
    inspector: false,
    seller: false,
    buyer: false
  });

  useEffect(() => {
    if (transaction?.eStampPaper) {
      setEStampData(transaction.eStampPaper);
    }
  }, [transaction]);

  const generateDocument = async () => {
    setLoading(true);
    try {
      const result = await generateEStampPaper(transaction.id);
      if (result.success) {
        setEStampData(result.eStampData);
      }
    } catch (error) {
      console.error('Error generating e-stamp paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignature = (role) => {
    setSignatures(prev => ({
      ...prev,
      [role]: true
    }));
  };

  const formatCurrency = (amount) => {
    return `${amount} ETH`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleDateString();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="estamp-loading">
        <div className="loading-spinner"></div>
        <p>Generating E-Stamp Paper...</p>
      </div>
    );
  }

  if (!eStampData) {
    return (
      <div className="estamp-generator">
        <div className="generator-header">
          <h3>E-Stamp Paper Generation</h3>
          <p>Generate legal property transfer documents with auto-filled details</p>
        </div>
        <button className="btn btn--primary" onClick={generateDocument}>
          Generate E-Stamp Paper
        </button>
      </div>
    );
  }

  return (
    <div className="estamp-container">
      <div className="estamp-header">
        <h3>Property Transfer E-Stamp Paper</h3>
        <div className="document-info">
          <span>Document ID: {transaction.id?.slice(0, 8)}</span>
          <span>Generated: {formatDate(eStampData.generatedAt)}</span>
        </div>
      </div>

      <div className="estamp-document">
        <div className="document-header">
          <div className="stamp-duty-box">
            <h4>E-STAMP PAPER</h4>
            <p>Stamp Duty: ₹{(eStampData.stampDuty * 83000).toFixed(2)}</p>
            <p>Registration Fee: ₹{(eStampData.registrationFee * 83000).toFixed(2)}</p>
          </div>
          <div className="government-seal">
            <div className="seal-circle">
              <span>GOVT</span>
              <span>OF</span>
              <span>INDIA</span>
            </div>
          </div>
        </div>

        <div className="document-title">
          <h2>AGREEMENT FOR SALE OF IMMOVABLE PROPERTY</h2>
          <p className="subtitle">BLOCKCHAIN-ENABLED PROPERTY TRANSFER</p>
        </div>

        <div className="document-content">
          <div className="agreement-section">
            <h4>PARTIES TO THE AGREEMENT</h4>
            
            <div className="party-details">
              <h5>SELLER (First Party)</h5>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>{eStampData.seller.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Address:</strong></td>
                    <td>{eStampData.seller.address}</td>
                  </tr>
                  <tr>
                    <td><strong>Aadhar Number:</strong></td>
                    <td>{eStampData.seller.aadharNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>PAN Number:</strong></td>
                    <td>{eStampData.seller.panNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>Wallet Address:</strong></td>
                    <td className="wallet-address">{eStampData.seller.walletAddress}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="party-details">
              <h5>BUYER (Second Party)</h5>
              <table className="details-table">
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>{eStampData.buyer.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Address:</strong></td>
                    <td>{eStampData.buyer.address}</td>
                  </tr>
                  <tr>
                    <td><strong>Aadhar Number:</strong></td>
                    <td>{eStampData.buyer.aadharNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>PAN Number:</strong></td>
                    <td>{eStampData.buyer.panNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>Wallet Address:</strong></td>
                    <td className="wallet-address">{eStampData.buyer.walletAddress}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="agreement-section">
            <h4>PROPERTY DETAILS</h4>
            <table className="details-table">
              <tbody>
                <tr>
                  <td><strong>Property ID:</strong></td>
                  <td>{eStampData.propertyId}</td>
                </tr>
                <tr>
                  <td><strong>Sale Consideration:</strong></td>
                  <td>{formatCurrency(eStampData.salePrice)}</td>
                </tr>
                <tr>
                  <td><strong>Currency:</strong></td>
                  <td>Ethereum (ETH)</td>
                </tr>
                <tr>
                  <td><strong>Transaction Hash:</strong></td>
                  <td className="wallet-address">{transaction.blockchainTxHash || 'Pending blockchain confirmation'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="agreement-section">
            <h4>TERMS AND CONDITIONS</h4>
            <ol className="terms-list">
              <li>The Seller is the absolute owner of the property and has clear title to the same.</li>
              <li>The property is free from all encumbrances, liens, and charges.</li>
              <li>The Buyer has verified all documents and is satisfied with the title of the property.</li>
              <li>The transaction is executed through blockchain technology ensuring transparency and immutability.</li>
              <li>All KYC documents have been verified by authorized government inspector.</li>
              <li>The sale consideration has been paid through smart contract in Ethereum cryptocurrency.</li>
              <li>The Seller undertakes to execute the sale deed upon completion of all formalities.</li>
              <li>Time is the essence of this agreement.</li>
            </ol>
          </div>

          <div className="agreement-section">
            <h4>VERIFICATION AND APPROVAL</h4>
            <div className="verification-grid">
              <div className="verification-card">
                <h5>Government Inspector</h5>
                <p>All documents and KYC details have been verified</p>
                <div className={`signature-box ${signatures.inspector ? 'signed' : ''}`}>
                  {signatures.inspector ? (
                    <div className="signature-content">
                      <span className="signature-mark">✓ VERIFIED</span>
                      <span className="signature-date">{formatDate()}</span>
                    </div>
                  ) : (
                    <div className="signature-placeholder">
                      Inspector Signature Required
                    </div>
                  )}
                </div>
                {currentUserRole === 'inspector' && !signatures.inspector && (
                  <button 
                    className="btn btn--success btn--small"
                    onClick={() => handleSignature('inspector')}
                  >
                    Sign & Approve
                  </button>
                )}
              </div>

              <div className="verification-card">
                <h5>Seller</h5>
                <p>Agrees to transfer property ownership</p>
                <div className={`signature-box ${signatures.seller ? 'signed' : ''}`}>
                  {signatures.seller ? (
                    <div className="signature-content">
                      <span className="signature-mark">✓ SIGNED</span>
                      <span className="signature-date">{formatDate()}</span>
                    </div>
                  ) : (
                    <div className="signature-placeholder">
                      Seller Signature Required
                    </div>
                  )}
                </div>
                {currentUserRole === 'seller' && signatures.inspector && !signatures.seller && (
                  <button 
                    className="btn btn--success btn--small"
                    onClick={() => handleSignature('seller')}
                  >
                    Sign Agreement
                  </button>
                )}
              </div>

              <div className="verification-card">
                <h5>Buyer</h5>
                <p>Agrees to purchase the property</p>
                <div className={`signature-box ${signatures.buyer ? 'signed' : ''}`}>
                  {signatures.buyer ? (
                    <div className="signature-content">
                      <span className="signature-mark">✓ SIGNED</span>
                      <span className="signature-date">{formatDate()}</span>
                    </div>
                  ) : (
                    <div className="signature-placeholder">
                      Buyer Signature Required
                    </div>
                  )}
                </div>
                {currentUserRole === 'buyer' && signatures.seller && !signatures.buyer && (
                  <button 
                    className="btn btn--success btn--small"
                    onClick={() => handleSignature('buyer')}
                  >
                    Sign Agreement
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="document-footer">
            <p><strong>This document is digitally generated and cryptographically secured through blockchain technology.</strong></p>
            <p>Document Hash: {transaction.id}</p>
            <p>Generated on: {formatDate(eStampData.generatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="estamp-actions">
        {currentUserRole === 'inspector' && (
          <div className="action-group">
            <button className="btn btn--primary">Download PDF</button>
            <button className="btn btn--secondary">Print Document</button>
          </div>
        )}
        
        {signatures.inspector && signatures.seller && signatures.buyer && (
          <div className="completion-notice">
            <div className="completion-icon">🎉</div>
            <h4>Document Complete!</h4>
            <p>All parties have signed. Property transfer is now legally binding.</p>
            <button className="btn btn--success">Finalize Transaction</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EStampPaper;