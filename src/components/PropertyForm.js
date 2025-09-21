import React, { useState, useEffect } from 'react';
import { propertyTypes, getDefaultProperty, validateProperty, amenityOptions, furnishingOptions, facingDirections, ownershipTypes, nearbyFacilities } from '../services/propertyStorage';
import './PropertyForm.css';

const PropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState(getDefaultProperty());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedNearbyFacilities, setSelectedNearbyFacilities] = useState([]);
  const [subTypeOptions, setSubTypeOptions] = useState([]);

  useEffect(() => {
    if (property) {
      const propertyData = { ...getDefaultProperty(), ...property };
      setFormData(propertyData);
      setSelectedAmenities(propertyData.amenities || []);
      setSelectedNearbyFacilities(propertyData.nearbyFacilities || []);
      
      // Set sub-types based on property type
      const typeObj = propertyTypes.find(t => t.value === propertyData.type);
      if (typeObj) {
        setSubTypeOptions(typeObj.subTypes || []);
      }
    }
  }, [property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Handle property type change to update sub-types
    if (name === 'type') {
      const typeObj = propertyTypes.find(t => t.value === value);
      setSubTypeOptions(typeObj ? typeObj.subTypes || [] : []);
      setFormData(prev => ({ ...prev, subType: '' })); // Reset sub-type
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (value, type) => {
    if (type === 'amenities') {
      const newAmenities = selectedAmenities.includes(value)
        ? selectedAmenities.filter(item => item !== value)
        : [...selectedAmenities, value];
      setSelectedAmenities(newAmenities);
      setFormData(prev => ({ ...prev, amenities: newAmenities }));
    } else if (type === 'nearbyFacilities') {
      const newFacilities = selectedNearbyFacilities.includes(value)
        ? selectedNearbyFacilities.filter(item => item !== value)
        : [...selectedNearbyFacilities, value];
      setSelectedNearbyFacilities(newFacilities);
      setFormData(prev => ({ ...prev, nearbyFacilities: newFacilities }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateProperty(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Go to the first step with errors
      const firstErrorStep = getStepWithErrors(validation.errors);
      if (firstErrorStep) {
        setCurrentStep(firstErrorStep);
      }
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

  const getStepWithErrors = (errors) => {
    const step1Fields = ['propertyNumber', 'propertyTitle', 'type', 'subType', 'landArea'];
    const step2Fields = ['location', 'streetAddress', 'city', 'district', 'state', 'pincode'];
    const step3Fields = ['bedrooms', 'bathrooms', 'yearBuilt', 'furnishingStatus'];
    const step4Fields = ['currentValue', 'purchasePrice', 'registrationValue'];
    const step5Fields = ['ownerName', 'ownerContact', 'ownerEmail'];
    
    if (step1Fields.some(field => errors[field])) return 1;
    if (step2Fields.some(field => errors[field])) return 2;
    if (step3Fields.some(field => errors[field])) return 3;
    if (step4Fields.some(field => errors[field])) return 4;
    if (step5Fields.some(field => errors[field])) return 5;
    return 6;
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
        <label htmlFor="propertyTitle">Property Title *</label>
        <input
          type="text"
          id="propertyTitle"
          name="propertyTitle"
          value={formData.propertyTitle}
          onChange={handleInputChange}
          className={errors.propertyTitle ? 'error' : ''}
          placeholder="Enter property title or name"
        />
        {errors.propertyTitle && <span className="error-message">{errors.propertyTitle}</span>}
      </div>

      <div className="form-row">
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
          <label htmlFor="subType">Sub Type</label>
          <select
            id="subType"
            name="subType"
            value={formData.subType}
            onChange={handleInputChange}
            disabled={!subTypeOptions.length}
          >
            <option value="">Select sub-type</option>
            {subTypeOptions.map(subType => (
              <option key={subType} value={subType}>
                {subType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
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
          <label htmlFor="builtUpArea">Built-up Area</label>
          <input
            type="text"
            id="builtUpArea"
            name="builtUpArea"
            value={formData.builtUpArea}
            onChange={handleInputChange}
            placeholder="e.g., 800 sq ft"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="yearBuilt">Year Built</label>
          <input
            type="number"
            id="yearBuilt"
            name="yearBuilt"
            value={formData.yearBuilt}
            onChange={handleInputChange}
            className={errors.yearBuilt ? 'error' : ''}
            placeholder="e.g., 2020"
            min="1800"
            max={new Date().getFullYear()}
          />
          {errors.yearBuilt && <span className="error-message">{errors.yearBuilt}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="totalFloors">Total Floors</label>
          <input
            type="number"
            id="totalFloors"
            name="totalFloors"
            value={formData.totalFloors}
            onChange={handleInputChange}
            placeholder="e.g., 3"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Location & Address Details</h3>
      
      <div className="form-group">
        <label htmlFor="location">Complete Address *</label>
        <textarea
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={errors.location ? 'error' : ''}
          placeholder="Enter complete property address"
          rows="3"
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="streetAddress">Street Address</label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleInputChange}
          placeholder="House number, street name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="locality">Locality/Area</label>
          <input
            type="text"
            id="locality"
            name="locality"
            value={formData.locality}
            onChange={handleInputChange}
            placeholder="Sector, locality, area name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="landmark">Landmark</label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            placeholder="Nearby landmark"
          />
        </div>
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

      <div className="form-row">
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
          <label htmlFor="pincode">Pincode *</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            className={errors.pincode ? 'error' : ''}
            placeholder="6-digit pincode"
            maxLength="6"
          />
          {errors.pincode && <span className="error-message">{errors.pincode}</span>}
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
          className={errors.geoCoordinates ? 'error' : ''}
          placeholder="e.g., 12.9716, 77.5946"
        />
        {errors.geoCoordinates && <span className="error-message">{errors.geoCoordinates}</span>}
        <small className="help-text">Enter latitude and longitude separated by comma</small>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Property Features & Specifications</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bedrooms">Bedrooms</label>
          <select
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
          >
            <option value="">Select bedrooms</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>
                {num === 0 ? 'Studio' : `${num} BHK`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bathrooms">Bathrooms</label>
          <select
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
          >
            <option value="">Select bathrooms</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="parkingSpaces">Parking Spaces</label>
          <select
            id="parkingSpaces"
            name="parkingSpaces"
            value={formData.parkingSpaces}
            onChange={handleInputChange}
          >
            <option value="">Select parking</option>
            <option value="0">No Parking</option>
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num} Car{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="furnishingStatus">Furnishing Status</label>
          <select
            id="furnishingStatus"
            name="furnishingStatus"
            value={formData.furnishingStatus}
            onChange={handleInputChange}
          >
            <option value="">Select furnishing</option>
            {furnishingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="floorNumber">Floor Number</label>
          <input
            type="text"
            id="floorNumber"
            name="floorNumber"
            value={formData.floorNumber}
            onChange={handleInputChange}
            placeholder="e.g., Ground, 1st, 2nd"
          />
        </div>

        <div className="form-group">
          <label htmlFor="facingDirection">Facing Direction</label>
          <select
            id="facingDirection"
            name="facingDirection"
            value={formData.facingDirection}
            onChange={handleInputChange}
          >
            <option value="">Select direction</option>
            {facingDirections.map(direction => (
              <option key={direction.value} value={direction.value}>
                {direction.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Amenities & Features</label>
        <div className="checkbox-grid">
          {amenityOptions.map(amenity => (
            <label key={amenity} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleCheckboxChange(amenity, 'amenities')}
              />
              <span className="checkmark"></span>
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Nearby Facilities</label>
        <div className="checkbox-grid">
          {nearbyFacilities.map(facility => (
            <label key={facility} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedNearbyFacilities.includes(facility)}
                onChange={() => handleCheckboxChange(facility, 'nearbyFacilities')}
              />
              <span className="checkmark"></span>
              {facility}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>Financial Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="currentValue">Current Market Value (₹)</label>
          <input
            type="number"
            id="currentValue"
            name="currentValue"
            value={formData.currentValue}
            onChange={handleInputChange}
            className={errors.currentValue ? 'error' : ''}
            placeholder="e.g., 5000000"
            min="0"
          />
          {errors.currentValue && <span className="error-message">{errors.currentValue}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="purchasePrice">Purchase Price (₹)</label>
          <input
            type="number"
            id="purchasePrice"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            className={errors.purchasePrice ? 'error' : ''}
            placeholder="e.g., 4500000"
            min="0"
          />
          {errors.purchasePrice && <span className="error-message">{errors.purchasePrice}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="registrationValue">Registration Value (₹)</label>
          <input
            type="number"
            id="registrationValue"
            name="registrationValue"
            value={formData.registrationValue}
            onChange={handleInputChange}
            placeholder="Value mentioned in registration"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stampDuty">Stamp Duty Paid (₹)</label>
          <input
            type="number"
            id="stampDuty"
            name="stampDuty"
            value={formData.stampDuty}
            onChange={handleInputChange}
            placeholder="Stamp duty amount"
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="registrationFees">Registration Fees (₹)</label>
          <input
            type="number"
            id="registrationFees"
            name="registrationFees"
            value={formData.registrationFees}
            onChange={handleInputChange}
            placeholder="Registration fees paid"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="brokerageAmount">Brokerage Amount (₹)</label>
          <input
            type="number"
            id="brokerageAmount"
            name="brokerageAmount"
            value={formData.brokerageAmount}
            onChange={handleInputChange}
            placeholder="Brokerage/commission paid"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="investmentPotential">Investment Potential</label>
        <textarea
          id="investmentPotential"
          name="investmentPotential"
          value={formData.investmentPotential}
          onChange={handleInputChange}
          placeholder="Investment potential, future prospects, appreciation potential"
          rows="3"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="form-step">
      <h3>Ownership & Contact Details</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerName">Owner Name *</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleInputChange}
            className={errors.ownerName ? 'error' : ''}
            placeholder="Full name of property owner"
          />
          {errors.ownerName && <span className="error-message">{errors.ownerName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ownershipType">Ownership Type</label>
          <select
            id="ownershipType"
            name="ownershipType"
            value={formData.ownershipType}
            onChange={handleInputChange}
          >
            <option value="">Select ownership type</option>
            {ownershipTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerContact">Owner Contact *</label>
          <input
            type="tel"
            id="ownerContact"
            name="ownerContact"
            value={formData.ownerContact}
            onChange={handleInputChange}
            className={errors.ownerContact ? 'error' : ''}
            placeholder="10-digit mobile number"
            maxLength="10"
          />
          {errors.ownerContact && <span className="error-message">{errors.ownerContact}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ownerEmail">Owner Email</label>
          <input
            type="email"
            id="ownerEmail"
            name="ownerEmail"
            value={formData.ownerEmail}
            onChange={handleInputChange}
            className={errors.ownerEmail ? 'error' : ''}
            placeholder="owner@example.com"
          />
          {errors.ownerEmail && <span className="error-message">{errors.ownerEmail}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="propertyDescription">Property Description</label>
        <textarea
          id="propertyDescription"
          name="propertyDescription"
          value={formData.propertyDescription}
          onChange={handleInputChange}
          placeholder="Detailed description of the property"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialFeatures">Special Features</label>
        <textarea
          id="specialFeatures"
          name="specialFeatures"
          value={formData.specialFeatures}
          onChange={handleInputChange}
          placeholder="Any special features, unique selling points, recent renovations"
          rows="3"
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="form-step">
      <h3>Legal Documents & Verification</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="surveyNumber">Survey Number</label>
          <input
            type="text"
            id="surveyNumber"
            name="surveyNumber"
            value={formData.surveyNumber}
            onChange={handleInputChange}
            placeholder="Official survey number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subDivisionNumber">Sub-division Number</label>
          <input
            type="text"
            id="subDivisionNumber"
            name="subDivisionNumber"
            value={formData.subDivisionNumber}
            onChange={handleInputChange}
            placeholder="Sub-division number if applicable"
          />
        </div>
      </div>

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
        <label htmlFor="titleClearance">Title Clearance Status</label>
        <select
          id="titleClearance"
          name="titleClearance"
          value={formData.titleClearance}
          onChange={handleInputChange}
        >
          <option value="">Select status</option>
          <option value="clear">Clear Title</option>
          <option value="pending">Pending Verification</option>
          <option value="issues">Issues Found</option>
          <option value="disputed">Under Dispute</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="environmentalClearance">Environmental Clearance</label>
        <textarea
          id="environmentalClearance"
          name="environmentalClearance"
          value={formData.environmentalClearance}
          onChange={handleInputChange}
          placeholder="Environmental clearance details (if applicable)"
          rows="2"
        />
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
              onClick={() => setCurrentStep(i + 1)}
              style={{ cursor: 'pointer' }}
              title={`Step ${i + 1}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="step-labels">
          <div className="step-label-grid">
            <span className={currentStep === 1 ? 'active' : ''}>Basic Info</span>
            <span className={currentStep === 2 ? 'active' : ''}>Location</span>
            <span className={currentStep === 3 ? 'active' : ''}>Features</span>
            <span className={currentStep === 4 ? 'active' : ''}>Financial</span>
            <span className={currentStep === 5 ? 'active' : ''}>Ownership</span>
            <span className={currentStep === 6 ? 'active' : ''}>Legal</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}

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
