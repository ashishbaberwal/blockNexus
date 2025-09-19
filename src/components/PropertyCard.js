import React, { useState } from 'react';
import { propertyTypes } from '../services/propertyStorage';
import './PropertyCard.css';

const PropertyCard = ({ property, viewMode, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPropertyTypeLabel = (type) => {
    const typeObj = propertyTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return '#38a169';
      case 'pending': return '#ed8936';
      case 'incomplete': return '#e53e3e';
      default: return '#a0aec0';
    }
  };

  const getDocumentStatus = () => {
    const requiredDocs = ['ownershipTitle', 'encumbranceCertificate', 'governmentApprovals', 'litigationStatus'];
    const completedDocs = requiredDocs.filter(doc => property[doc] && property[doc].trim());
    
    if (completedDocs.length === 0) return { status: 'incomplete', text: 'No Documents' };
    if (completedDocs.length === requiredDocs.length) return { status: 'complete', text: 'Complete' };
    return { status: 'pending', text: `${completedDocs.length}/${requiredDocs.length} Documents` };
  };

  const docStatus = getDocumentStatus();

  if (viewMode === 'list') {
    return (
      <div className="property-card list-view">
        <div className="card-header">
          <div className="property-info">
            <h3 className="property-title">{property.propertyNumber}</h3>
            <p className="property-location">{property.location}</p>
          </div>
          <div className="property-meta">
            <span className="property-type">{getPropertyTypeLabel(property.type)}</span>
            <span className="property-area">{property.landArea}</span>
          </div>
        </div>
        
        <div className="card-content">
          <div className="property-details">
            <div className="detail-item">
              <span className="label">City:</span>
              <span className="value">{property.city}</span>
            </div>
            <div className="detail-item">
              <span className="label">District:</span>
              <span className="value">{property.district}</span>
            </div>
            <div className="detail-item">
              <span className="label">Documents:</span>
              <span 
                className="value status"
                style={{ color: getStatusColor(docStatus.status) }}
              >
                {docStatus.text}
              </span>
            </div>
          </div>
          
          <div className="card-actions">
            <button 
              className="btn btn--outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
            <button 
              className="btn btn--secondary"
              onClick={() => onEdit(property)}
            >
              Edit
            </button>
            <button 
              className="btn btn--danger"
              onClick={() => onDelete(property.id)}
            >
              Delete
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="card-details">
            <div className="details-grid">
              <div className="detail-section">
                <h4>Legal Information</h4>
                <div className="detail-item">
                  <span className="label">Property Number:</span>
                  <span className="value">{property.propertyNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ownership Title:</span>
                  <span className="value">{property.ownershipTitle || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Encumbrance Certificate:</span>
                  <span className="value">{property.encumbranceCertificate || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Location Details</h4>
                <div className="detail-item">
                  <span className="label">Full Address:</span>
                  <span className="value">{property.location}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Coordinates:</span>
                  <span className="value">{property.geoCoordinates || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Land Area:</span>
                  <span className="value">{property.landArea}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Legal Status</h4>
                <div className="detail-item">
                  <span className="label">Government Approvals:</span>
                  <span className="value">{property.governmentApprovals || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Litigation Status:</span>
                  <span className="value">{property.litigationStatus || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            {property.additionalNotes && (
              <div className="notes-section">
                <h4>Additional Notes</h4>
                <p>{property.additionalNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="property-card grid-view">
      <div className="card-header">
        <div className="property-type-badge">
          {getPropertyTypeLabel(property.type)}
        </div>
        <div className="card-menu">
          <button 
            className="menu-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            ⋯
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="property-title">{property.propertyNumber}</h3>
        <p className="property-location">{property.location}</p>
        
        <div className="property-meta">
          <div className="meta-item">
            <span className="icon">📍</span>
            <span>{property.city}, {property.district}</span>
          </div>
          <div className="meta-item">
            <span className="icon">📏</span>
            <span>{property.landArea}</span>
          </div>
        </div>

        <div className="document-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(docStatus.status) }}
          ></div>
          <span className="status-text">{docStatus.text}</span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="btn btn--outline"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
        <button 
          className="btn btn--secondary"
          onClick={() => onEdit(property)}
        >
          Edit
        </button>
        <button 
          className="btn btn--danger"
          onClick={() => onDelete(property.id)}
        >
          Delete
        </button>
      </div>

      {showDetails && (
        <div className="card-details">
          <div className="details-grid">
            <div className="detail-section">
              <h4>Legal Information</h4>
              <div className="detail-item">
                <span className="label">Property Number:</span>
                <span className="value">{property.propertyNumber}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ownership Title:</span>
                <span className="value">{property.ownershipTitle || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Encumbrance Certificate:</span>
                <span className="value">{property.encumbranceCertificate || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Location Details</h4>
              <div className="detail-item">
                <span className="label">Full Address:</span>
                <span className="value">{property.location}</span>
              </div>
              <div className="detail-item">
                <span className="label">Coordinates:</span>
                <span className="value">{property.geoCoordinates || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Land Area:</span>
                <span className="value">{property.landArea}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Legal Status</h4>
              <div className="detail-item">
                <span className="label">Government Approvals:</span>
                <span className="value">{property.governmentApprovals || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Litigation Status:</span>
                <span className="value">{property.litigationStatus || 'Not provided'}</span>
              </div>
            </div>
          </div>
          
          {property.additionalNotes && (
            <div className="notes-section">
              <h4>Additional Notes</h4>
              <p>{property.additionalNotes}</p>
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <span className="created-date">
          Added {formatDate(property.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default PropertyCard;
