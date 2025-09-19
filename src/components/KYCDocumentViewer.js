import React, { useState, useEffect } from 'react';
import localDocumentStorage from '../utils/localDocumentStorage';
import './KYCDocumentViewer.css';

const KYCDocumentViewer = ({ transaction, currentUserRole, currentUserAddress }) => {
  const [kycData, setKycData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (transaction) {
      loadKYCData();
    }
  }, [transaction]);

  const loadKYCData = async () => {
    setLoading(true);
    try {
      const participants = {
        buyer: transaction.buyerAddress,
        seller: transaction.sellerAddress,
        lender: transaction.lenderAddress,
        inspector: transaction.inspectorAddress
      };

      const kycPromises = Object.entries(participants).map(async ([role, address]) => {
        if (address) {
          const userData = localDocumentStorage.getKYCData(address);
          return {
            role,
            address,
            data: userData
          };
        }
        return { role, address: null, data: null };
      });

      const kycResults = await Promise.all(kycPromises);
      const kycMap = {};
      kycResults.forEach(({ role, address, data }) => {
        kycMap[role] = { address, data };
      });

      setKycData(kycMap);
    } catch (error) {
      console.error('Error loading KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibleTabs = () => {
    const tabs = [];
    
    switch (currentUserRole) {
      case 'lender':
        // Lender can see buyer's documents
        if (kycData.buyer?.data) tabs.push({ key: 'buyer', label: 'Buyer Documents' });
        break;
        
      case 'inspector':
        // Inspector can see both buyer and seller documents
        if (kycData.buyer?.data) tabs.push({ key: 'buyer', label: 'Buyer Documents' });
        if (kycData.seller?.data) tabs.push({ key: 'seller', label: 'Seller Documents' });
        break;
        
      case 'seller':
        // Seller can see buyer's documents when inspector has approved
        if (transaction.status === 'inspector_approved' && kycData.buyer?.data) {
          tabs.push({ key: 'buyer', label: 'Buyer Documents' });
        }
        break;
        
      case 'buyer':
        // Buyer can see their own documents
        if (kycData.buyer?.data) tabs.push({ key: 'buyer', label: 'My Documents' });
        break;
        
      default:
        break;
    }
    
    return tabs;
  };

  const renderDocumentImage = (imageUrl, documentType) => {
    if (!imageUrl) {
      return (
        <div className="document-placeholder">
          <div className="placeholder-icon">📄</div>
          <p>{documentType} not uploaded</p>
        </div>
      );
    }

    return (
      <div className="document-image-container">
        <img 
          src={imageUrl} 
          alt={documentType}
          className="document-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="image-error" style={{ display: 'none' }}>
          <p>Failed to load {documentType}</p>
        </div>
      </div>
    );
  };

  const renderUserDocuments = (userRole) => {
    const userData = kycData[userRole]?.data;
    
    if (!userData) {
      return (
        <div className="no-documents">
          <p>No KYC documents available for {userRole}</p>
        </div>
      );
    }

    return (
      <div className="kyc-documents">
        <div className="user-info">
          <h4>{userData.fullName || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Name`}</h4>
          <p className="wallet-address">
            Wallet: {kycData[userRole]?.address?.slice(0, 6)}...{kycData[userRole]?.address?.slice(-4)}
          </p>
          <div className="verification-status">
            <span className={`status-badge ${userData.kycVerified ? 'verified' : 'pending'}`}>
              {userData.kycVerified ? '✓ Verified' : '⏳ Pending Verification'}
            </span>
          </div>
        </div>

        <div className="document-grid">
          <div className="document-card">
            <div className="document-header">
              <h5>Aadhar Card</h5>
              <span className="document-number">
                {userData.aadharNumber ? `****-****-${userData.aadharNumber.slice(-4)}` : 'Not provided'}
              </span>
            </div>
            {renderDocumentImage(userData.aadharDocument?.base64Data, 'Aadhar Card')}
          </div>

          <div className="document-card">
            <div className="document-header">
              <h5>PAN Card</h5>
              <span className="document-number">
                {userData.panNumber ? `******${userData.panNumber.slice(-4)}` : 'Not provided'}
              </span>
            </div>
            {renderDocumentImage(userData.panDocument?.base64Data, 'PAN Card')}
          </div>

          {userRole === 'seller' && (
            <>
              <div className="document-card">
                <div className="document-header">
                  <h5>Property Papers</h5>
                  <span className="document-number">Legal Documents</span>
                </div>
                {renderDocumentImage(userData.propertyPapersDocument?.base64Data, 'Property Papers')}
              </div>

              <div className="document-card">
                <div className="document-header">
                  <h5>Agreement</h5>
                  <span className="document-number">Sale Agreement</span>
                </div>
                {renderDocumentImage(userData.agreementDocument?.base64Data, 'Sale Agreement')}
              </div>
            </>
          )}
        </div>

        <div className="additional-info">
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{userData.phoneNumber || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{userData.email || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Address:</span>
            <span className="info-value">{userData.address || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">KYC Completed:</span>
            <span className="info-value">
              {userData.kycCompletedAt ? new Date(userData.kycCompletedAt).toLocaleDateString() : 'Not completed'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const visibleTabs = getVisibleTabs();

  if (loading) {
    return (
      <div className="kyc-viewer loading">
        <div className="loading-spinner"></div>
        <p>Loading KYC documents...</p>
      </div>
    );
  }

  if (visibleTabs.length === 0) {
    return (
      <div className="kyc-viewer no-access">
        <div className="no-access-icon">🔒</div>
        <h4>Access Restricted</h4>
        <p>You don't have permission to view KYC documents at this stage of the transaction.</p>
      </div>
    );
  }

  return (
    <div className="kyc-viewer">
      <div className="kyc-header">
        <h3>KYC Document Verification</h3>
        <p className="viewer-role">Viewing as: <strong>{currentUserRole?.toUpperCase()}</strong></p>
      </div>

      {visibleTabs.length > 1 && (
        <div className="kyc-tabs">
          {visibleTabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="kyc-content">
        {renderUserDocuments(activeTab)}
      </div>

      <div className="kyc-actions">
        {currentUserRole === 'lender' && transaction.status === 'purchase_requested' && (
          <div className="action-buttons">
            <button className="btn btn--success">
              ✓ Approve Loan Application
            </button>
            <button className="btn btn--danger">
              ✗ Reject Application
            </button>
          </div>
        )}

        {currentUserRole === 'inspector' && transaction.status === 'under_inspection' && (
          <div className="action-buttons">
            <button className="btn btn--success">
              ✓ Approve All Documents
            </button>
            <button className="btn btn--warning">
              ⚠ Request Additional Documents
            </button>
            <button className="btn btn--danger">
              ✗ Reject Application
            </button>
          </div>
        )}

        {currentUserRole === 'seller' && transaction.status === 'inspector_approved' && (
          <div className="action-buttons">
            <button className="btn btn--success">
              ✓ Approve Transfer
            </button>
            <button className="btn btn--danger">
              ✗ Cancel Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCDocumentViewer;