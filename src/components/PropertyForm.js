import React, { useState, useEffect } from 'react';
import { propertyTypes, useStatusOptions, getDefaultProperty, validateProperty } from '../services/propertyStorage';
import './PropertyForm.css';

const PropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState(getDefaultProperty());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Further simplified without media uploads

  useEffect(() => {
    if (property) {
      const propertyData = { ...getDefaultProperty(), ...property };
      // If property has image data, set it as preview
      if (property.propertyImageData) {
        propertyData.propertyImagePreview = property.propertyImageData;
      }
      setFormData(propertyData);
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
    
    // Only allow submission on the final step
    if (currentStep !== totalSteps) {
      return;
    }
    
    // Add current step to form data for validation
    const formDataWithStep = { ...formData, currentStep };
    
    const validation = validateProperty(formDataWithStep);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare form data for saving - simplified approach
      const propertyData = { ...formData };
      
      // Ensure backward compatibility with old field names
      if (!propertyData.propertyNumber && propertyData.propertyTitle) {
        propertyData.propertyNumber = propertyData.propertyTitle;
      }
      if (!propertyData.location && propertyData.fullAddress) {
        propertyData.location = propertyData.fullAddress;
      }
      if (!propertyData.landArea && propertyData.propertySize) {
        propertyData.landArea = propertyData.propertySize;
      }
      if (!propertyData.district && propertyData.state) {
        propertyData.district = propertyData.state;
      }
      
      // Handle single property image upload
      if (formData.propertyImage && formData.propertyImage instanceof File) {
        // Compress the image before storing
        propertyData.propertyImageData = await compressImage(formData.propertyImagePreview, 0.7); // 70% quality
        propertyData.propertyImageName = formData.propertyImage.name;
        propertyData.propertyImageSize = formData.propertyImage.size;
        propertyData.propertyImageType = formData.propertyImage.type;
        delete propertyData.propertyImage;
      }
      
      // Clean up any File objects that can't be serialized
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] instanceof File) {
          delete propertyData[key];
        }
        if (propertyData[key] && typeof propertyData[key] === 'object') {
          // Check for nested File objects
          Object.keys(propertyData[key]).forEach(nestedKey => {
            if (propertyData[key][nestedKey] instanceof File) {
              delete propertyData[key][nestedKey];
            }
          });
        }
      });
      
      // Set submission metadata
      propertyData.submissionStep = totalSteps;
      propertyData.submittedAt = new Date().toISOString();
      
      await onSave(propertyData);
    } catch (error) {
      console.error('Error saving property:', error);
      let errorMessage = 'Failed to save property. Please try again.';
      
      if (error.message) {
        if (error.message.includes('quota') || error.message.includes('storage')) {
          errorMessage = 'Storage limit reached. Try removing the image or clearing old properties from your browser.';
        } else {
          errorMessage = `Failed to save property: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = () => {
    const errors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.propertyTitle?.trim()) {
          errors.propertyTitle = 'Property title is required';
        }
        if (!formData.fullAddress?.trim()) {
          errors.fullAddress = 'Full address is required';
        }
        if (!formData.city?.trim()) {
          errors.city = 'City is required';
        }
        if (!formData.state?.trim()) {
          errors.state = 'State is required';
        }
        if (!formData.pinCode?.trim()) {
          errors.pinCode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
          errors.pinCode = 'PIN code must be 6 digits';
        }
        if (!formData.type?.trim()) {
          errors.type = 'Property type is required';
        }
        if (!formData.propertySize?.trim()) {
          errors.propertySize = 'Property size is required';
        }
        if (!formData.currentUseStatus?.trim()) {
          errors.currentUseStatus = 'Current use status is required';
        }
        break;
        
      case 2:
        // Advanced verification - no mandatory fields, but can add warnings
        break;
        
      case 3:
        // Community & trust - no mandatory fields
        break;
        
      case 4:
        // Final validation
        if (!formData.agreeToTerms) {
          errors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        if (!formData.consentToVerification) {
          errors.consentToVerification = 'You must consent to verification processes';
        }
        break;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const nextStep = () => {
    // Validate current step before proceeding
    const stepValidation = validateCurrentStep();
    if (!stepValidation.isValid) {
      setErrors(stepValidation.errors);
      return;
    }
    
    // Clear errors if validation passes
    setErrors({});
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (stepNumber) => {
    const titles = {
      1: 'Core Property Details',
      2: 'Advanced Verification',
      3: 'Community & Trust',
      4: 'Review & Submit'
    };
    return titles[stepNumber] || `Step ${stepNumber}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          propertyImage: 'Please select a valid image file (JPEG, PNG, or WebP)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          propertyImage: 'Image size should be less than 5MB'
        }));
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          propertyImage: file,
          propertyImagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Clear any existing errors
      if (errors.propertyImage) {
        setErrors(prev => ({
          ...prev,
          propertyImage: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      propertyImage: null,
      propertyImagePreview: null
    }));
  };

  const handleNestedInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gpsCoordinates: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
        },
        (error) => {
          alert('Unable to get location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Image compression function to reduce storage size
  const compressImage = (base64String, quality = 0.3) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = base64String;
    });
  };





  // Step 1: Core Property Details
  const renderStep1 = () => (
    <div className="form-step">
      <h3>🏠 Core Property Details</h3>
      <p className="step-description">Provide structured information about your property</p>
      
      <div className="form-group">
        <label htmlFor="propertyTitle">Property Title/Name *</label>
        <input
          type="text"
          id="propertyTitle"
          name="propertyTitle"
          value={formData.propertyTitle}
          onChange={handleInputChange}
          className={errors.propertyTitle ? 'error' : ''}
          placeholder="e.g., Sunrise Apartments, Green Villa, Commercial Complex"
        />
        {errors.propertyTitle && <span className="error-message">{errors.propertyTitle}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="fullAddress">Full Address *</label>
        <textarea
          id="fullAddress"
          name="fullAddress"
          value={formData.fullAddress}
          onChange={handleInputChange}
          className={errors.fullAddress ? 'error' : ''}
          placeholder="Complete address including building name, street, area"
          rows="3"
        />
        {errors.fullAddress && <span className="error-message">{errors.fullAddress}</span>}
      </div>

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
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={errors.state ? 'error' : ''}
            placeholder="Enter state name"
          />
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="pinCode">PIN Code *</label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleInputChange}
            className={errors.pinCode ? 'error' : ''}
            placeholder="6-digit PIN code"
            maxLength="6"
          />
          {errors.pinCode && <span className="error-message">{errors.pinCode}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="locality">Area/Locality Name</label>
        <input
          type="text"
          id="locality"
          name="locality"
          value={formData.locality}
          onChange={handleInputChange}
          placeholder="e.g., Koramangala, Bandra West, Sector 18"
        />
      </div>

      <div className="form-group">
        <label>GPS Coordinates</label>
        <div className="gps-container">
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="gpsCoordinates.latitude"
                value={formData.gpsCoordinates?.latitude || ''}
                onChange={handleNestedInputChange}
                placeholder="Latitude (e.g., 12.9716)"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="gpsCoordinates.longitude"
                value={formData.gpsCoordinates?.longitude || ''}
                onChange={handleNestedInputChange}
                placeholder="Longitude (e.g., 77.5946)"
              />
            </div>
          </div>
          <button type="button" className="btn btn--outline" onClick={getCurrentLocation}>
            📍 Get Current Location
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Property Type *</label>
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
          <label htmlFor="currentUseStatus">Current Use Status *</label>
          <select
            id="currentUseStatus"
            name="currentUseStatus"
            value={formData.currentUseStatus}
            onChange={handleInputChange}
            className={errors.currentUseStatus ? 'error' : ''}
          >
            <option value="">Select status</option>
            {useStatusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.currentUseStatus && <span className="error-message">{errors.currentUseStatus}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="propertySize">Property Size/Area *</label>
          <input
            type="text"
            id="propertySize"
            name="propertySize"
            value={formData.propertySize}
            onChange={handleInputChange}
            className={errors.propertySize ? 'error' : ''}
            placeholder="e.g., 1200 sqft, 2.5 acres"
          />
          {errors.propertySize && <span className="error-message">{errors.propertySize}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="surveyNumber">Survey/Plot Number</label>
          <input
            type="text"
            id="surveyNumber"
            name="surveyNumber"
            value={formData.surveyNumber}
            onChange={handleInputChange}
            placeholder="Survey or plot number if available"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="propertyImage">Property Image</label>
        <input
          type="file"
          id="propertyImage"
          name="propertyImage"
          accept="image/*"
          onChange={handleImageChange}
          className={errors.propertyImage ? 'error' : ''}
        />
        {errors.propertyImage && <span className="error-message">{errors.propertyImage}</span>}
        
        {formData.propertyImagePreview && (
          <div className="image-preview">
            <img 
              src={formData.propertyImagePreview} 
              alt="Property preview" 
              style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', marginTop: '10px' }}
            />
            <button 
              type="button" 
              onClick={removeImage}
              className="btn btn--outline btn--small"
              style={{ marginTop: '5px' }}
            >
              Remove Image
            </button>
          </div>
        )}
        <small className="help-text">Upload a photo of your property (JPEG, PNG, or WebP, max 5MB)</small>
      </div>
    </div>
  );





  // Step 4: Advanced Verification
  const renderStep4 = () => (
    <div className="form-step">
      <h3>🔍 Advanced Verification</h3>
      <p className="step-description">Enhanced verification for maximum authenticity</p>
      
      <div className="verification-options">
        <div className="verification-card">
          <h4>🏠 Inspector Verification</h4>
          <p>Arrange for a certified inspector to visit and verify your property</p>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="requestInspection"
                checked={formData.requestInspection || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  requestInspection: e.target.checked
                }))}
              />
              Request Inspector Visit
            </label>
            <small className="help-text">Inspector will verify property details and upload their report</small>
          </div>
        </div>

        <div className="verification-card">
          <h4>🌍 Geo-Verification</h4>
          <p>Cross-check location with device GPS and map services</p>
          <div className="geo-status">
            {formData.gpsCoordinates?.latitude && formData.gpsCoordinates?.longitude ? (
              <span className="status-success">✅ GPS coordinates provided</span>
            ) : (
              <span className="status-warning">⚠️ GPS coordinates recommended</span>
            )}
          </div>
        </div>

        <div className="verification-card">
          <h4>⛓️ Blockchain Security</h4>
          <p>All documents and media will be hashed and stored on blockchain</p>
          <div className="blockchain-info">
            <span className="status-info">🔗 Automatic blockchain hash generation</span>
            <small>SHA-256 hashes will be generated for all uploaded content</small>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="additionalNotes">Additional Verification Notes</label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          placeholder="Any additional information for verification team"
          rows="4"
        />
      </div>
    </div>
  );

  // Step 5: Community & Trust Layers
  const renderStep5 = () => (
    <div className="form-step">
      <h3>🤝 Community & Trust Layers</h3>
      <p className="step-description">Build trust through community verification</p>
      
      <div className="trust-section">
        <div className="trust-card">
          <h4>👥 Peer Review System</h4>
          <p>Allow community members to verify your property listing</p>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="enablePeerReview"
                checked={formData.enablePeerReview || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  enablePeerReview: e.target.checked
                }))}
              />
              Enable Community Verification
            </label>
            <small className="help-text">Neighbors and local community can confirm property existence</small>
          </div>
        </div>

        <div className="trust-card">
          <h4>⭐ Reputation System</h4>
          <p>Your seller reputation based on previous transactions</p>
          <div className="reputation-display">
            <div className="reputation-score">
              <span className="score">{formData.sellerReputation || 0}</span>
              <span className="label">Reputation Points</span>
            </div>
            <small>Build reputation through verified, successful transactions</small>
          </div>
        </div>

        <div className="trust-card">
          <h4>🏆 Verification Badges</h4>
          <p>Earn badges for different verification levels</p>
          <div className="badge-preview">
            <span className="badge">📋 Document Verified</span>
            <span className="badge">🏠 Inspector Verified</span>
            <span className="badge">👥 Community Verified</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sellerStatement">Seller Statement</label>
        <textarea
          id="sellerStatement"
          name="sellerStatement"
          value={formData.sellerStatement}
          onChange={handleInputChange}
          placeholder="Brief statement about the property and your commitment to transparency"
          rows="4"
        />
        <small className="help-text">This statement will be visible to potential buyers</small>
      </div>
    </div>
  );

  // Step 5: Review & Submit (was Step 6, now Step 5 after removing documents)
  const renderStep6 = () => (
    <div className="form-step">
      <h3>📋 Review & Submit</h3>
      <p className="step-description">Review all information before submitting for approval</p>
      
      <div className="review-summary">
        <div className="summary-section">
          <h4>Property Details</h4>
          <div className="summary-item">
            <strong>Title:</strong> {formData.propertyTitle}
          </div>
          <div className="summary-item">
            <strong>Address:</strong> {formData.fullAddress}
          </div>
          <div className="summary-item">
            <strong>Type:</strong> {propertyTypes.find(t => t.value === formData.type)?.label}
          </div>
          <div className="summary-item">
            <strong>Size:</strong> {formData.propertySize}
          </div>
        </div>



        <div className="summary-section">
          <h4>Property Image</h4>
          <div className="summary-item">
            {formData.propertyImagePreview ? (
              <div>
                <span className="status-success">✅ Property image uploaded</span>
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={formData.propertyImagePreview} 
                    alt="Property preview" 
                    style={{ maxWidth: '150px', maxHeight: '100px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ) : (
              <span className="status-info">📷 No image uploaded</span>
            )}
          </div>
        </div>

        <div className="summary-section">
          <h4>Verification Level</h4>
          <div className="verification-level">
            <span className="level-badge">📋 Document Verification</span>
            {formData.requestInspection && (
              <span className="level-badge">🏠 Inspector Verification Requested</span>
            )}
            {formData.enablePeerReview && (
              <span className="level-badge">👥 Community Verification Enabled</span>
            )}
          </div>
        </div>
      </div>

      <div className="submission-agreement">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                agreeToTerms: e.target.checked
              }))}
              required
            />
            I confirm that all information provided is accurate and I agree to the terms and conditions
          </label>
          {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consentToVerification"
              checked={formData.consentToVerification || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                consentToVerification: e.target.checked
              }))}
              required
            />
            I consent to property verification processes including inspector visits and community reviews
          </label>
          {errors.consentToVerification && <span className="error-message">{errors.consentToVerification}</span>}
        </div>
      </div>

      <div className="submission-info">
        <h4>🚀 What happens next?</h4>
        <ol>
          <li>Your property will be submitted for approval</li>
          <li>Our team will verify the property information and media</li>
          <li>Inspector visit will be scheduled (if requested)</li>
          <li>Community verification will be enabled</li>
          <li>You'll receive approval notification</li>
          <li>Property will be listed on the platform</li>
        </ol>
      </div>
    </div>
  );

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
        <p>
          {property 
            ? 'Update your property information' 
            : 'Complete all required information to submit your property for approval'
          }
        </p>
      </div>

      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isActive = stepNumber <= currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div 
                key={stepNumber} 
                className={`step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                title={getStepTitle(stepNumber)}
              >
                {stepNumber}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep4()}
        {currentStep === 3 && renderStep5()}
        {currentStep === 4 && renderStep6()}

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
                {isSubmitting ? 'Submitting...' : (property ? 'Update Property' : 'Submit for Approval')}
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
