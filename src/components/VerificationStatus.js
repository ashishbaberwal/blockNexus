import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import localDocumentStorage from '../utils/localDocumentStorage';

const VerificationStatus = ({ walletAddress }) => {
  const { kycStatus, checkKYCStatus } = useUser();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        setLoading(true);
        
        // Check KYC status
        await checkKYCStatus(walletAddress);
        
        // Get detailed KYC data from localStorage
        const kycData = localDocumentStorage.getKYCData(walletAddress);
        
        if (kycData) {
          setKycData(kycData);
        }
      } catch (error) {
        console.error('Error fetching KYC data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchKYCData();
    }
  }, [walletAddress, checkKYCStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-not-submitted';
    }
  };

  if (loading) {
    return (
      <div className="verification-status loading">
        <div className="loading-spinner"></div>
        <p>Checking verification status...</p>
      </div>
    );
  }

  return (
    <div className="verification-status">
      <div className="status-header">
        <h4>🔐 Identity Verification</h4>
        <div className={`status-badge ${getStatusClass(kycStatus)}`}>
          <span className="status-icon">{getStatusIcon(kycStatus)}</span>
          <span className="status-text">{getStatusText(kycStatus)}</span>
        </div>
      </div>

      {kycData && (
        <div className="status-details">
          {kycStatus === 'pending' && (
            <div className="status-info pending">
              <p><strong>Submitted:</strong> {new Date(kycData.submittedAt).toLocaleDateString()}</p>
              <p>Your documents are being processed automatically...</p>
            </div>
          )}

          {kycStatus === 'approved' && (
            <div className="status-info approved">
              <p><strong>Verified on:</strong> {new Date(kycData.approvedAt).toLocaleDateString()}</p>
              <p>✅ Your identity has been successfully verified!</p>
            </div>
          )}

          {kycStatus === 'rejected' && (
            <div className="status-info rejected">
              <p><strong>Rejected on:</strong> {new Date(kycData.rejectedAt).toLocaleDateString()}</p>
              {kycData.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Reason:</strong> {kycData.rejectionReason}
                </div>
              )}
              <p>Please resubmit your documents with the required corrections.</p>
            </div>
          )}

          {kycData.aadharNumber && (
            <div className="document-info">
              <h5>Document Information:</h5>
              <div className="doc-details">
                <div className="doc-item">
                  <span className="doc-label">Aadhar:</span>
                  <span className="doc-value">
                    {kycData.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </span>
                </div>
                <div className="doc-item">
                  <span className="doc-label">PAN:</span>
                  <span className="doc-value">{kycData.panNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {kycStatus === 'not_submitted' && (
        <div className="status-info not-submitted">
          <p>⚠️ Identity verification is required to access all features.</p>
          <p>Please complete your KYC verification to:</p>
          <ul>
            <li>List properties for sale</li>
            <li>Make purchase offers</li>
            <li>Access premium features</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;