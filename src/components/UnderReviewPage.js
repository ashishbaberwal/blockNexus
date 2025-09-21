import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  propertyVerificationService, 
  verificationStatuses, 
  verificationReasons,
  getVerificationStatusDisplay,
  getRejectionReasonDisplay
} from '../services/propertyVerificationService';
import { createSampleVerifications, clearAllVerifications } from '../utils/sampleData';
import './UnderReviewPage.css';

const UnderReviewPage = () => {
  const { user, userRole, account } = useUser();
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Verify inspector authentication
  const isInspectorAuthenticated = () => {
    return account && userRole === 'inspector' && user && user.walletAddress === account;
  };

  useEffect(() => {
    if (isInspectorAuthenticated()) {
      loadUnderReviewProperties();
    }
  }, [account, userRole, user]);

  const loadUnderReviewProperties = () => {
    setLoading(true);
    try {
      const data = propertyVerificationService.getUnderReviewVerifications();
      setVerifications(data);
      console.log('📋 Loaded under review properties:', data.length);
    } catch (error) {
      console.error('Error loading under review properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadUnderReviewProperties();
    } else {
      const filtered = verifications.filter(verification => 
        verification.property.title.toLowerCase().includes(query.toLowerCase()) ||
        verification.property.location.toLowerCase().includes(query.toLowerCase()) ||
        verification.property.description.toLowerCase().includes(query.toLowerCase())
      );
      setVerifications(filtered);
    }
  };

  const handleStartReview = (verification) => {
    setSelectedVerification(verification);
    setReviewNotes(verification.reviewNotes || '');
    setRejectionReason('');
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedVerification || !isInspectorAuthenticated()) return;

    setActionLoading(true);
    try {
      const updatedVerification = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.APPROVED,
        account,
        user.firstName + ' ' + user.lastName,
        reviewNotes || 'Property approved after review'
      );

      if (updatedVerification) {
        loadUnderReviewProperties();
        setShowReviewModal(false);
        alert('Property approved successfully!');
      }
    } catch (error) {
      console.error('Error approving property:', error);
      alert('Error approving property. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !isInspectorAuthenticated() || !rejectionReason) {
      alert('Please select a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const updatedVerification = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.REJECTED,
        account,
        user.firstName + ' ' + user.lastName,
        reviewNotes || 'Property rejected after review',
        rejectionReason
      );

      if (updatedVerification) {
        loadUnderReviewProperties();
        setShowReviewModal(false);
        alert('Property rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert('Error rejecting property. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedVerification || !isInspectorAuthenticated()) return;

    setActionLoading(true);
    try {
      const updatedVerification = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.REQUIRES_REVISION,
        account,
        user.firstName + ' ' + user.lastName,
        reviewNotes || 'Property requires revision'
      );

      if (updatedVerification) {
        loadUnderReviewProperties();
        setShowReviewModal(false);
        alert('Revision requested successfully!');
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Error requesting revision. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSampleData = () => {
    try {
      const success = createSampleVerifications();
      if (success) {
        loadUnderReviewProperties();
        alert('Sample verification data created successfully!');
      } else {
        alert('Please add some properties first, then try creating sample data.');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data. Please try again.');
    }
  };

  // Authentication check
  if (!isInspectorAuthenticated()) {
    return (
      <div className="under-review-page">
        <div className="auth-error">
          <h2>🔒 Inspector Authentication Required</h2>
          <p>You must be logged in with an inspector account to access this page.</p>
          <div className="auth-info">
            <p><strong>Current Status:</strong></p>
            <ul>
              <li>Wallet Connected: {account ? '✅ Yes' : '❌ No'}</li>
              <li>User Role: {userRole || 'Not set'}</li>
              <li>Inspector Account: {user && user.role === 'inspector' ? '✅ Yes' : '❌ No'}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="under-review-page">
      <div className="page-header">
        <h1>Properties Under Review</h1>
        <p>Review and manage properties currently under inspection</p>
      </div>

      {/* Inspector Info */}
      <div className="inspector-info">
        <div className="inspector-card">
          <h3>👨‍💼 Inspector Information</h3>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Wallet:</strong> {account.slice(0, 6)}...{account.slice(38, 42)}</p>
          <p><strong>Role:</strong> {userRole}</p>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="page-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search properties under review..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="control-buttons">
          <button 
            className="btn btn--primary"
            onClick={handleCreateSampleData}
          >
            Create Sample Data
          </button>
          <button 
            className="btn btn--outline"
            onClick={loadUnderReviewProperties}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="properties-section">
        {loading ? (
          <div className="loading">Loading properties under review...</div>
        ) : verifications.length === 0 ? (
          <div className="empty-state">
            <h3>No Properties Under Review</h3>
            <p>There are currently no properties under review.</p>
            <button 
              className="btn btn--primary"
              onClick={handleCreateSampleData}
            >
              Create Sample Data
            </button>
          </div>
        ) : (
          <div className="properties-grid">
            {verifications.map((verification) => (
              <div key={verification.id} className="property-card">
                <div className="property-image">
                  <img 
                    src={verification.property.image || '/api/placeholder/300/200'} 
                    alt={verification.property.title}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/300/200';
                    }}
                  />
                </div>
                
                <div className="property-content">
                  <h3>{verification.property.title}</h3>
                  <p className="property-location">📍 {verification.property.location}</p>
                  <p className="property-price">💰 ${verification.property.price?.toLocaleString()}</p>
                  
                  <div className="verification-info">
                    <div className="status-badge under-review">
                      {getVerificationStatusDisplay(verification.status)}
                    </div>
                    <p className="assigned-to">
                      <strong>Assigned to:</strong> {verification.assignedTo || 'Unassigned'}
                    </p>
                    <p className="assigned-date">
                      <strong>Assigned:</strong> {new Date(verification.assignedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="property-actions">
                    <button 
                      className="btn btn--primary"
                      onClick={() => handleStartReview(verification)}
                    >
                      Start Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Review Property</h2>
              <button 
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="property-details">
                <h3>{selectedVerification.property.title}</h3>
                <p><strong>Location:</strong> {selectedVerification.property.location}</p>
                <p><strong>Price:</strong> ${selectedVerification.property.price?.toLocaleString()}</p>
                <p><strong>Description:</strong> {selectedVerification.property.description}</p>
              </div>

              <div className="review-form">
                <label>
                  <strong>Review Notes:</strong>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    rows="4"
                  />
                </label>

                <label>
                  <strong>Rejection Reason (if rejecting):</strong>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    <option value="">Select reason (if rejecting)</option>
                    {Object.entries(verificationReasons).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getRejectionReasonDisplay(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn--outline"
                onClick={() => setShowReviewModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn--warning"
                onClick={handleRequestRevision}
                disabled={actionLoading}
              >
                Request Revision
              </button>
              <button 
                className="btn btn--danger"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason}
              >
                Reject
              </button>
              <button 
                className="btn btn--success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderReviewPage;
