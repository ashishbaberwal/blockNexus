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
import './InspectorDashboard.css';

const InspectorDashboard = ({ defaultTab = 'pending', title = 'Property Verification Dashboard' }) => {
  const { user, userRole } = useUser();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadVerifications();
    loadStats();
  }, [activeTab]);

  const loadVerifications = () => {
    setLoading(true);
    try {
      let data = [];
      switch (activeTab) {
        case 'pending':
          data = propertyVerificationService.getPendingVerifications();
          break;
        case 'under-review':
          data = propertyVerificationService.getUnderReviewVerifications();
          break;
        case 'verified':
          data = propertyVerificationService.getVerifiedProperties();
          break;
        default:
          data = propertyVerificationService.getAllVerifications();
      }
      setVerifications(data);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const verificationStats = propertyVerificationService.getVerificationStats();
      setStats(verificationStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateSampleData = () => {
    try {
      const success = createSampleVerifications();
      if (success) {
        loadVerifications();
        loadStats();
        alert('Sample verification data created successfully!');
      } else {
        alert('Please add some properties first, then try creating sample data.');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data. Please try again.');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all verification data? This action cannot be undone.')) {
      try {
        clearAllVerifications();
        loadVerifications();
        loadStats();
        alert('All verification data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadVerifications();
      return;
    }

    try {
      const results = propertyVerificationService.searchVerifications(query, 
        activeTab === 'pending' ? verificationStatuses.PENDING :
        activeTab === 'under-review' ? verificationStatuses.UNDER_REVIEW :
        null
      );
      setVerifications(results);
    } catch (error) {
      console.error('Error searching verifications:', error);
    }
  };

  const handleAssignToMe = (verificationId) => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      const result = propertyVerificationService.assignToInspector(
        verificationId,
        user.walletAddress,
        `${user.firstName} ${user.lastName}`
      );
      
      if (result) {
        loadVerifications();
        loadStats();
        alert('Property assigned to you successfully!');
      } else {
        alert('Failed to assign property. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning property:', error);
      alert('Error assigning property. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartReview = (verification) => {
    setSelectedVerification(verification);
    setReviewNotes('');
    setRejectionReason('');
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedVerification || !user) return;
    
    setActionLoading(true);
    try {
      const result = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.APPROVED,
        user.walletAddress,
        `${user.firstName} ${user.lastName}`,
        reviewNotes
      );
      
      if (result) {
        setShowReviewModal(false);
        loadVerifications();
        loadStats();
        alert('Property approved successfully!');
      } else {
        alert('Failed to approve property. Please try again.');
      }
    } catch (error) {
      console.error('Error approving property:', error);
      alert('Error approving property. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !user || !rejectionReason) {
      alert('Please select a rejection reason.');
      return;
    }
    
    setActionLoading(true);
    try {
      const result = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.REJECTED,
        user.walletAddress,
        `${user.firstName} ${user.lastName}`,
        reviewNotes,
        rejectionReason
      );
      
      if (result) {
        setShowReviewModal(false);
        loadVerifications();
        loadStats();
        alert('Property rejected successfully!');
      } else {
        alert('Failed to reject property. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert('Error rejecting property. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequireRevision = async () => {
    if (!selectedVerification || !user) return;
    
    setActionLoading(true);
    try {
      const result = propertyVerificationService.updateVerificationStatus(
        selectedVerification.id,
        verificationStatuses.REQUIRES_REVISION,
        user.walletAddress,
        `${user.firstName} ${user.lastName}`,
        reviewNotes
      );
      
      if (result) {
        setShowReviewModal(false);
        loadVerifications();
        loadStats();
        alert('Property marked for revision successfully!');
      } else {
        alert('Failed to mark property for revision. Please try again.');
      }
    } catch (error) {
      console.error('Error marking property for revision:', error);
      alert('Error marking property for revision. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderVerificationCard = (verification) => {
    const statusDisplay = getVerificationStatusDisplay(verification.status);
    const isAssignedToMe = verification.inspectorId === user?.walletAddress;
    const canTakeAction = isAssignedToMe || verification.status === verificationStatuses.PENDING;

    return (
      <div key={verification.id} className="verification-card">
        <div className="verification-header">
          <div className="property-info">
            <h3>{verification.propertyData?.propertyTitle || 'Untitled Property'}</h3>
            <p className="property-number">
              Property #: {verification.propertyData?.propertyNumber || 'N/A'}
            </p>
            <p className="property-location">
              📍 {verification.propertyData?.location || 'Location not specified'}
            </p>
          </div>
          <div className="status-badge" style={{ backgroundColor: statusDisplay.color }}>
            <span className="status-icon">{statusDisplay.icon}</span>
            <span className="status-text">{statusDisplay.text}</span>
          </div>
        </div>

        <div className="verification-details">
          <div className="detail-row">
            <span className="detail-label">Submitted by:</span>
            <span className="detail-value">{verification.submittedBy}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Submitted on:</span>
            <span className="detail-value">{formatDate(verification.submittedAt)}</span>
          </div>
          {verification.inspectorName && (
            <div className="detail-row">
              <span className="detail-label">Inspector:</span>
              <span className="detail-value">{verification.inspectorName}</span>
            </div>
          )}
          {verification.reviewedAt && (
            <div className="detail-row">
              <span className="detail-label">Reviewed on:</span>
              <span className="detail-value">{formatDate(verification.reviewedAt)}</span>
            </div>
          )}
          {verification.rejectionReason && (
            <div className="detail-row">
              <span className="detail-label">Rejection Reason:</span>
              <span className="detail-value rejection-reason">
                {getRejectionReasonDisplay(verification.rejectionReason)}
              </span>
            </div>
          )}
        </div>

        <div className="verification-actions">
          {verification.status === verificationStatuses.PENDING && !isAssignedToMe && (
            <button
              className="btn btn--primary"
              onClick={() => handleAssignToMe(verification.id)}
              disabled={actionLoading}
            >
              Assign to Me
            </button>
          )}
          
          {canTakeAction && (
            <button
              className="btn btn--secondary"
              onClick={() => handleStartReview(verification)}
            >
              {verification.status === verificationStatuses.PENDING ? 'Start Review' : 'Review'}
            </button>
          )}
          
          <button
            className="btn btn--outline"
            onClick={() => setSelectedVerification(verification)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Properties</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card under-review">
          <div className="stat-value">{stats.underReview}</div>
          <div className="stat-label">Under Review</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
    );
  };

  return (
    <div className="inspector-dashboard">
      <div className="dashboard-header">
        <h1>{title}</h1>
        <p>Review and verify property submissions</p>
      </div>

      {/* Statistics */}
      {renderStats()}

      {/* Search and Filters */}
      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search properties..."
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
            onClick={handleClearAllData}
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending Review ({stats?.pending || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'under-review' ? 'active' : ''}`}
          onClick={() => setActiveTab('under-review')}
        >
          🔍 Under Review ({stats?.underReview || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          ✅ Verified ({stats?.approved + stats?.rejected || 0})
        </button>
      </div>

      {/* Verification List */}
      <div className="verification-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading verifications...</p>
          </div>
        ) : verifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No properties found</h3>
            <p>
              {activeTab === 'pending' && 'No properties are pending review.'}
              {activeTab === 'under-review' && 'No properties are currently under review.'}
              {activeTab === 'verified' && 'No properties have been verified yet.'}
            </p>
          </div>
        ) : (
          verifications.map(renderVerificationCard)
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="review-modal">
            <div className="modal-header">
              <h2>Review Property</h2>
              <button
                className="modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="property-summary">
                <h3>{selectedVerification.propertyData?.propertyTitle}</h3>
                <p>Property #: {selectedVerification.propertyData?.propertyNumber}</p>
                <p>Location: {selectedVerification.propertyData?.location}</p>
              </div>

              <div className="review-form">
                <label htmlFor="reviewNotes">Review Notes</label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  rows="4"
                />

                <label htmlFor="rejectionReason">Rejection Reason (if rejecting)</label>
                <select
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                >
                  <option value="">Select a reason (only if rejecting)</option>
                  {Object.entries(verificationReasons).map(([key, value]) => (
                    <option key={key} value={key}>{getRejectionReasonDisplay(key)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn--success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                ✅ Approve
              </button>
              <button
                className="btn btn--warning"
                onClick={handleRequireRevision}
                disabled={actionLoading}
              >
                📝 Require Revision
              </button>
              <button
                className="btn btn--danger"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason}
              >
                ❌ Reject
              </button>
              <button
                className="btn btn--outline"
                onClick={() => setShowReviewModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorDashboard;
