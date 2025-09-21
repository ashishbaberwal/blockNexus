import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { propertyStorage, approvalStatuses } from '../services/propertyStorage';
import PropertyCard from './PropertyCard';
import './PropertyApprovalAdmin.css';

// Import contract ABIs and config
import Escrow from '../abis/Escrow.json';
import config from '../config.json';

const PropertyApprovalAdmin = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [account, setAccount] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [isInspector, setIsInspector] = useState(false);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);

  const loadBlockchainData = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const network = await provider.getNetwork();
        const escrowContract = new ethers.Contract(
          config[network.chainId].escrow.address, 
          Escrow, 
          provider
        );
        setEscrow(escrowContract);

        // Get inspector address from contract
        const inspectorAddress = await escrowContract.inspector();
        setInspector(inspectorAddress);

        // Get current account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const currentAccount = ethers.getAddress(accounts[0]);
          setAccount(currentAccount);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            const newAccount = ethers.getAddress(accounts[0]);
            setAccount(newAccount);
          } else {
            setAccount(null);
          }
        });
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  const checkInspectorStatus = useCallback(() => {
    if (account && inspector) {
      const isInspectorWallet = account.toLowerCase() === inspector.toLowerCase();
      setIsInspector(isInspectorWallet);
      console.log('Inspector check:', {
        account,
        inspector,
        isInspectorWallet
      });
    } else {
      setIsInspector(false);
    }
  }, [account, inspector]);

  const loadProperties = () => {
    setLoading(true);
    try {
      const allProperties = propertyStorage.getAllProperties();
      setProperties(allProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    const statistics = propertyStorage.getStorageStats();
    setStats(statistics);
  };

  const filterProperties = useCallback(() => {
    if (selectedStatus === 'all') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property => 
        (property.approvalStatus || approvalStatuses.PENDING) === selectedStatus
      );
      setFilteredProperties(filtered);
    }
  }, [selectedStatus, properties]);

  // useEffect hooks after function definitions
  useEffect(() => {
    loadBlockchainData();
    loadProperties();
    loadStats();
  }, []);

  useEffect(() => {
    checkInspectorStatus();
  }, [checkInspectorStatus]);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  const handleApproval = (propertyId, status, rejectionReason = null) => {
    if (!isInspector) {
      alert('Only the inspector can approve or reject property listings.');
      return;
    }

    const success = propertyStorage.updateApprovalStatus(
      propertyId, 
      status, 
      account, // Use the inspector's wallet address
      rejectionReason
    );

    if (success) {
      loadProperties();
      loadStats();
      alert(`Property ${status === approvalStatuses.APPROVED ? 'approved' : 'rejected'} successfully!`);
    } else {
      alert('Failed to update property status. Please try again.');
    }
  };



  const getStatusCount = (status) => {
    return stats.byApprovalStatus?.[status] || 0;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">Loading properties...</div>
      </div>
    );
  }

  // Show access denied if not inspector
  if (!account) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Property Approval Management</h1>
          <div className="access-denied">
            <p>Please connect your wallet to access property approval management.</p>
            <button 
              className="btn btn--primary"
              onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInspector) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Property Approval Management</h1>
          <div className="access-denied">
            <p>Access Denied: Only the inspector wallet can approve or reject property listings.</p>
            <div className="wallet-info">
              <p><strong>Your Wallet:</strong> {account}</p>
              <p><strong>Inspector Wallet:</strong> {inspector || 'Loading...'}</p>
              <p>Please switch to the inspector wallet to access this feature.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Property Approval Management</h1>
        <p>Review and manage property submissions</p>
        <div className="inspector-info">
          <p>✅ Inspector wallet connected: {account}</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{getStatusCount(approvalStatuses.PENDING)}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getStatusCount(approvalStatuses.UNDER_REVIEW)}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getStatusCount(approvalStatuses.APPROVED)}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getStatusCount(approvalStatuses.REJECTED)}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="admin-filters">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Properties</option>
          <option value={approvalStatuses.PENDING}>Pending Approval</option>
          <option value={approvalStatuses.UNDER_REVIEW}>Under Review</option>
          <option value={approvalStatuses.APPROVED}>Approved</option>
          <option value={approvalStatuses.REJECTED}>Rejected</option>
        </select>
      </div>

      <div className="properties-list">
        {filteredProperties.length === 0 ? (
          <div className="no-properties">
            <p>No properties found for the selected filter.</p>
          </div>
        ) : (
          filteredProperties.map(property => (
            <div key={property.id} className="admin-property-card">
              <PropertyCard
                property={property}
                viewMode="list"
                onEdit={() => {}} // Disable editing in admin view
                onDelete={() => {}} // Disable deletion in admin view
              />
              
              <div className="admin-actions">
                <h4>Admin Actions</h4>
                <div className="action-buttons">
                  {property.approvalStatus !== approvalStatuses.UNDER_REVIEW && (
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleApproval(property.id, approvalStatuses.UNDER_REVIEW)}
                    >
                      Mark Under Review
                    </button>
                  )}
                  
                  {property.approvalStatus !== approvalStatuses.APPROVED && (
                    <button
                      className="btn btn--success"
                      onClick={() => handleApproval(property.id, approvalStatuses.APPROVED)}
                    >
                      Approve Property
                    </button>
                  )}
                  
                  {property.approvalStatus !== approvalStatuses.REJECTED && (
                    <button
                      className="btn btn--danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleApproval(property.id, approvalStatuses.REJECTED, reason);
                        }
                      }}
                    >
                      Reject Property
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyApprovalAdmin;