import React, { useState, useEffect } from 'react';
import { propertyVerificationService, verificationStatuses } from '../services/propertyVerificationService';
import { propertyStorage } from '../services/propertyStorage';
import './InspectorDemo.css';

const InspectorDemo = () => {
  const [demoProperties, setDemoProperties] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    try {
      // Load properties from property storage
      const properties = propertyStorage.getAllProperties();
      setDemoProperties(properties);

      // Load verifications
      const allVerifications = propertyVerificationService.getAllVerifications();
      setVerifications(allVerifications);
    } catch (error) {
      console.error('Error loading demo data:', error);
    }
  };

  const createVerification = (property) => {
    try {
      const verification = propertyVerificationService.createVerification(property.id, property);
      if (verification) {
        setVerifications(prev => [...prev, verification]);
        alert(`Verification created for property: ${property.propertyTitle}`);
      }
    } catch (error) {
      console.error('Error creating verification:', error);
      alert('Failed to create verification. Please try again.');
    }
  };

  const simulateInspectorAction = (verificationId, action) => {
    try {
      const inspectorId = 'demo-inspector-123';
      const inspectorName = 'Demo Inspector';
      
      let status, notes = '';
      
      switch (action) {
        case 'approve':
          status = verificationStatuses.APPROVED;
          notes = 'Property meets all verification requirements. Approved for listing.';
          break;
        case 'reject':
          status = verificationStatuses.REJECTED;
          notes = 'Property does not meet verification standards.';
          break;
        case 'review':
          status = verificationStatuses.UNDER_REVIEW;
          notes = 'Property assigned for detailed review.';
          break;
        default:
          return;
      }

      const result = propertyVerificationService.updateVerificationStatus(
        verificationId,
        status,
        inspectorId,
        inspectorName,
        notes
      );

      if (result) {
        loadDemoData();
        alert(`Property ${action}ed successfully!`);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      alert('Failed to update verification. Please try again.');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all demo data? This action cannot be undone.')) {
      try {
        propertyVerificationService.clearAllVerifications();
        setVerifications([]);
        alert('All demo data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [verificationStatuses.PENDING]: '#f59e0b',
      [verificationStatuses.UNDER_REVIEW]: '#3b82f6',
      [verificationStatuses.APPROVED]: '#10b981',
      [verificationStatuses.REJECTED]: '#ef4444',
      [verificationStatuses.REQUIRES_REVISION]: '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      [verificationStatuses.PENDING]: '⏳',
      [verificationStatuses.UNDER_REVIEW]: '🔍',
      [verificationStatuses.APPROVED]: '✅',
      [verificationStatuses.REJECTED]: '❌',
      [verificationStatuses.REQUIRES_REVISION]: '📝'
    };
    return icons[status] || '❓';
  };

  return (
    <div className="inspector-demo">
      <div className="demo-header">
        <h1>Inspector Dashboard Demo</h1>
        <p>Demonstrate property verification workflow for inspectors</p>
      </div>

      {/* Demo Controls */}
      <div className="demo-controls">
        <button 
          className="btn btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Sample Verification
        </button>
        <button 
          className="btn btn--outline"
          onClick={loadDemoData}
        >
          Refresh Data
        </button>
        <button 
          className="btn btn--danger"
          onClick={clearAllData}
        >
          Clear All Data
        </button>
      </div>

      {/* Statistics */}
      <div className="demo-stats">
        <h3>Verification Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{verifications.length}</span>
            <span className="stat-label">Total Verifications</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-value">
              {verifications.filter(v => v.status === verificationStatuses.PENDING).length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item under-review">
            <span className="stat-value">
              {verifications.filter(v => v.status === verificationStatuses.UNDER_REVIEW).length}
            </span>
            <span className="stat-label">Under Review</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-value">
              {verifications.filter(v => v.status === verificationStatuses.APPROVED).length}
            </span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-value">
              {verifications.filter(v => v.status === verificationStatuses.REJECTED).length}
            </span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="demo-section">
        <h3>Available Properties</h3>
        <div className="properties-grid">
          {demoProperties.length === 0 ? (
            <div className="empty-state">
              <p>No properties available. Add some properties first to create verifications.</p>
            </div>
          ) : (
            demoProperties.map(property => (
              <div key={property.id} className="property-card">
                <h4>{property.propertyTitle || 'Untitled Property'}</h4>
                <p>Type: {property.type || 'N/A'}</p>
                <p>Location: {property.location || 'N/A'}</p>
                <p>Owner: {property.ownerName || 'N/A'}</p>
                <button
                  className="btn btn--primary"
                  onClick={() => createVerification(property)}
                >
                  Create Verification
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verifications List */}
      <div className="demo-section">
        <h3>Property Verifications</h3>
        <div className="verifications-list">
          {verifications.length === 0 ? (
            <div className="empty-state">
              <p>No verifications created yet. Create some verifications from the properties above.</p>
            </div>
          ) : (
            verifications.map(verification => (
              <div key={verification.id} className="verification-card">
                <div className="verification-header">
                  <h4>{verification.propertyData?.propertyTitle || 'Untitled Property'}</h4>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(verification.status) }}
                  >
                    <span className="status-icon">{getStatusIcon(verification.status)}</span>
                    <span className="status-text">{verification.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="verification-details">
                  <p><strong>Property #:</strong> {verification.propertyData?.propertyNumber || 'N/A'}</p>
                  <p><strong>Location:</strong> {verification.propertyData?.location || 'N/A'}</p>
                  <p><strong>Submitted by:</strong> {verification.submittedBy}</p>
                  <p><strong>Submitted on:</strong> {new Date(verification.submittedAt).toLocaleDateString()}</p>
                  {verification.inspectorName && (
                    <p><strong>Inspector:</strong> {verification.inspectorName}</p>
                  )}
                  {verification.reviewNotes && (
                    <p><strong>Review Notes:</strong> {verification.reviewNotes}</p>
                  )}
                </div>

                <div className="verification-actions">
                  {verification.status === verificationStatuses.PENDING && (
                    <>
                      <button
                        className="btn btn--secondary"
                        onClick={() => simulateInspectorAction(verification.id, 'review')}
                      >
                        Assign to Review
                      </button>
                      <button
                        className="btn btn--success"
                        onClick={() => simulateInspectorAction(verification.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() => simulateInspectorAction(verification.id, 'reject')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {verification.status === verificationStatuses.UNDER_REVIEW && (
                    <>
                      <button
                        className="btn btn--success"
                        onClick={() => simulateInspectorAction(verification.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() => simulateInspectorAction(verification.id, 'reject')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    className="btn btn--outline"
                    onClick={() => setSelectedProperty(verification)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Verification Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Sample Verification</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p>Select a property to create a verification:</p>
              <div className="property-selection">
                {demoProperties.map(property => (
                  <div key={property.id} className="property-option">
                    <h4>{property.propertyTitle || 'Untitled Property'}</h4>
                    <p>Type: {property.type} | Location: {property.location}</p>
                    <button
                      className="btn btn--primary"
                      onClick={() => {
                        createVerification(property);
                        setShowCreateModal(false);
                      }}
                    >
                      Create Verification
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="demo-instructions">
        <h3>How to Use the Inspector Demo:</h3>
        <ol>
          <li><strong>Create Properties:</strong> First, add some properties using the "Add Property" form</li>
          <li><strong>Create Verifications:</strong> Click "Create Sample Verification" to create verification records</li>
          <li><strong>Simulate Inspector Actions:</strong> Use the action buttons to simulate inspector workflow:
            <ul>
              <li><strong>Assign to Review:</strong> Move property to under review status</li>
              <li><strong>Approve:</strong> Approve the property for listing</li>
              <li><strong>Reject:</strong> Reject the property with reason</li>
            </ul>
          </li>
          <li><strong>View Statistics:</strong> Monitor verification statistics in real-time</li>
          <li><strong>Role-Based Access:</strong> Only users with "inspector" role can access the Inspector tab</li>
        </ol>
        
        <div className="features">
          <h4>Inspector Features:</h4>
          <ul>
            <li>✅ Property verification workflow (Pending → Under Review → Approved/Rejected)</li>
            <li>✅ Inspector assignment and tracking</li>
            <li>✅ Review notes and rejection reasons</li>
            <li>✅ Real-time statistics and monitoring</li>
            <li>✅ Role-based access control</li>
            <li>✅ Search and filter capabilities</li>
            <li>✅ Document review and approval</li>
            <li>✅ Status history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InspectorDemo;
