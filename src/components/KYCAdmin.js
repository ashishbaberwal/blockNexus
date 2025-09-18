import React, { useState, useEffect } from 'react';
import localDocumentStorage from '../utils/localDocumentStorage';

const KYCAdmin = () => {
  const [kycData, setKycData] = useState({});
  const [stats, setStats] = useState({});
  const [selectedWallet, setSelectedWallet] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadKYCData();
  }, []);

  const loadKYCData = () => {
    const allKYC = localDocumentStorage.getAllKYCData();
    const kycStats = localDocumentStorage.getKYCStats();
    setKycData(allKYC);
    setStats(kycStats);
  };

  const handleViewDetails = (walletAddress) => {
    setSelectedWallet(walletAddress);
    setShowDetails(true);
  };

  const handleExportData = () => {
    localDocumentStorage.exportKYCData();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all KYC data? This action cannot be undone.')) {
      localDocumentStorage.clearAllKYCData();
      loadKYCData();
      alert('All KYC data has been cleared.');
    }
  };

  const selectedKYC = selectedWallet ? kycData[selectedWallet] : null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #333', 
      padding: '20px', 
      zIndex: 9999,
      borderRadius: '8px',
      width: '400px',
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h3>KYC Admin Panel (LocalStorage)</h3>
      
      {/* Statistics */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Statistics:</h4>
        <p>Total KYC Submissions: {stats.total || 0}</p>
        <p>Pending: {stats.pending || 0}</p>
        <p>Approved: {stats.approved || 0}</p>
        <p>Rejected: {stats.rejected || 0}</p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={loadKYCData}
          style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Refresh
        </button>
        <button 
          onClick={handleExportData}
          style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Export Data
        </button>
        <button 
          onClick={handleClearData}
          style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Clear All
        </button>
      </div>

      {/* KYC List */}
      {Object.keys(kycData).length > 0 ? (
        <div>
          <h4>KYC Submissions:</h4>
          {Object.keys(kycData).map(walletAddress => (
            <div 
              key={walletAddress} 
              style={{ 
                margin: '5px 0', 
                padding: '10px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => handleViewDetails(walletAddress)}
            >
              <strong>Wallet:</strong> {walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 8)}
              <br />
              <strong>Status:</strong> 
              <span style={{ 
                color: kycData[walletAddress].verificationStatus === 'pending' ? 'orange' : 
                      kycData[walletAddress].verificationStatus === 'approved' ? 'green' : 'red' 
              }}>
                {kycData[walletAddress].verificationStatus}
              </span>
              <br />
              <strong>Name:</strong> {kycData[walletAddress].fullName}
              <br />
              <small>Submitted: {new Date(kycData[walletAddress].submittedAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      ) : (
        <p>No KYC submissions found in localStorage.</p>
      )}

      {/* Details Modal */}
      {showDetails && selectedKYC && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>KYC Details</h3>
            <p><strong>Wallet:</strong> {selectedWallet}</p>
            <p><strong>Name:</strong> {selectedKYC.fullName}</p>
            <p><strong>Aadhar Number:</strong> {selectedKYC.aadharNumber}</p>
            <p><strong>PAN Number:</strong> {selectedKYC.panNumber}</p>
            <p><strong>Date of Birth:</strong> {selectedKYC.dateOfBirth}</p>
            <p><strong>Address:</strong> {selectedKYC.address}</p>
            <p><strong>Status:</strong> {selectedKYC.verificationStatus}</p>
            <p><strong>Submitted:</strong> {new Date(selectedKYC.submittedAt).toLocaleString()}</p>
            
            {selectedKYC.aadharDocument && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Aadhar Document:</strong></p>
                <img 
                  src={selectedKYC.aadharDocument.data} 
                  alt="Aadhar Document" 
                  style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }}
                />
                <p><small>File: {selectedKYC.aadharDocument.fileName} ({Math.round(selectedKYC.aadharDocument.fileSize / 1024)}KB)</small></p>
              </div>
            )}
            
            {selectedKYC.panDocument && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>PAN Document:</strong></p>
                <img 
                  src={selectedKYC.panDocument.data} 
                  alt="PAN Document" 
                  style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }}
                />
                <p><small>File: {selectedKYC.panDocument.fileName} ({Math.round(selectedKYC.panDocument.fileSize / 1024)}KB)</small></p>
              </div>
            )}
            
            <button 
              onClick={() => setShowDetails(false)}
              style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCAdmin;