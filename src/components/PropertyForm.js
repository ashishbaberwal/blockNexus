import React, { useState, useEffect } from 'react';
import { propertyTypes, getDefaultProperty, validateProperty } from '../services/propertyStorage';
import './PropertyForm.css';

const PropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState(getDefaultProperty());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (property) {
      setFormData({ ...getDefaultProperty(), ...property });
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateProperty(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Basic Property Information</h3>
      
      <div className="form-group">
        <label htmlFor="propertyNumber">Property/Survey Number *</label>
        <input
          type="text"
          id="propertyNumber"
          name="propertyNumber"
          value={formData.propertyNumber}
          onChange={handleInputChange}
          className={errors.propertyNumber ? 'error' : ''}
          placeholder="Enter unique property/survey number"
        />
        {errors.propertyNumber && <span className="error-message">{errors.propertyNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="type">Type of Property *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className={errors.type ? 'error' : ''}
        >
          <option value="">Select property type</option>
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && <span className="error-message">{errors.type}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="landArea">Land Area/Dimensions *</label>
        <input
          type="text"
          id="landArea"
          name="landArea"
          value={formData.landArea}
          onChange={handleInputChange}
          className={errors.landArea ? 'error' : ''}
          placeholder="e.g., 1000 sq ft, 2 acres, 50x30 meters"
        />
        {errors.landArea && <span className="error-message">{errors.landArea}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="location">Complete Address *</label>
        <textarea
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={errors.location ? 'error' : ''}
          placeholder="Enter complete address including street, area, etc."
          rows="3"
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Location Details</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? 'error' : ''}
            placeholder="Enter city name"
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="district">District *</label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className={errors.district ? 'error' : ''}
            placeholder="Enter district name"
          />
          {errors.district && <span className="error-message">{errors.district}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="geoCoordinates">Geo Coordinates (Optional)</label>
        <input
          type="text"
          id="geoCoordinates"
          name="geoCoordinates"
          value={formData.geoCoordinates}
          onChange={handleInputChange}
          placeholder="e.g., 12.9716° N, 77.5946° E"
        />
        <small className="help-text">Enter latitude and longitude if available</small>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Legal Documents & Information</h3>
      
      <div className="form-group">
        <label htmlFor="ownershipTitle">Ownership Title (Record of Rights)</label>
        <textarea
          id="ownershipTitle"
          name="ownershipTitle"
          value={formData.ownershipTitle}
          onChange={handleInputChange}
          placeholder="Enter details of ownership title or mutation extract"
          rows="3"
        />
        <small className="help-text">Latest Record of Rights (RoR) or mutation extract verifying ownership</small>
      </div>

      <div className="form-group">
        <label htmlFor="encumbranceCertificate">Encumbrance Certificate</label>
        <textarea
          id="encumbranceCertificate"
          name="encumbranceCertificate"
          value={formData.encumbranceCertificate}
          onChange={handleInputChange}
          placeholder="Enter encumbrance certificate details"
          rows="3"
        />
        <small className="help-text">Confirms the property is free from any legal dues, mortgages, loans, or claims</small>
      </div>

      <div className="form-group">
        <label htmlFor="governmentApprovals">Government Approvals</label>
        <textarea
          id="governmentApprovals"
          name="governmentApprovals"
          value={formData.governmentApprovals}
          onChange={handleInputChange}
          placeholder="Enter government approvals and permissions"
          rows="3"
        />
        <small className="help-text">Zoning, land-use certificate, planning permissions (if any)</small>
      </div>

      <div className="form-group">
        <label htmlFor="litigationStatus">Litigation Status</label>
        <textarea
          id="litigationStatus"
          name="litigationStatus"
          value={formData.litigationStatus}
          onChange={handleInputChange}
          placeholder="Enter litigation status details"
          rows="3"
        />
        <small className="help-text">Proof that property is not under dispute</small>
      </div>

      <div className="form-group">
        <label htmlFor="additionalNotes">Additional Notes</label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          placeholder="Any additional information about the property"
          rows="3"
        />
      </div>
    </div>
  );

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
        <p>Complete all required information to add your property to the system</p>
      </div>

      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div 
              key={i + 1} 
              className={`step ${i + 1 <= currentStep ? 'active' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="form-actions">
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className="btn btn--outline"
              >
                ← Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="btn btn--primary"
              >
                Next →
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn--primary"
              >
                {isSubmitting ? 'Saving...' : (property ? 'Update Property' : 'Save Property')}
              </button>
            )}
          </div>

          <div className="form-cancel">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn btn--outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
