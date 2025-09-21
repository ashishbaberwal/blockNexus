import React, { useState, useEffect } from 'react';
import { propertyStorage } from '../services/propertyStorage';
import FileUpload from './FileUpload';
import './PropertyForm.css';

const EnhancedPropertyForm = ({ property, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Core Property Information
    title: '',
    fullAddress: '',
    latitude: '',
    longitude: '',
    type: '',
    subType: '',
    builtUpArea: '',
    superArea: '',
    floorNumber: '',
    totalFloors: '',
    currentStatus: '',
    description: '',
    
    // Owner/Seller Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    kycDocumentType: '',
    kycDocumentNumber: '',
    
    // Additional Details
    price: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    furnishing: '',
    facing: '',
    age: '',
    amenities: [],
    nearbyFacilities: [],
    
    // Images
    images: [],
    
    // File References
    fileReferences: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedNearbyFacilities, setSelectedNearbyFacilities] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFolders, setUploadedFolders] = useState([]);

  const amenityOptions = [
    'Lift', 'Power Backup', 'Security', 'Parking', 'Garden', 'Swimming Pool',
    'Gym', 'Club House', 'Playground', 'Water Supply', '24/7 Security',
    'Intercom', 'Maintenance Staff', 'Pet Friendly', 'Balcony', 'Terrace'
  ];

  const nearbyFacilities = [
    'Metro Station', 'Bus Stop', 'Railway Station', 'Airport', 'Hospital',
    'School', 'College', 'Shopping Mall', 'Market', 'Bank', 'ATM',
    'Restaurant', 'Park', 'Gym', 'Pharmacy', 'Petrol Pump'
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'land', label: 'Land' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'plot', label: 'Plot' },
    { value: 'house', label: 'House' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'studio', label: 'Studio' }
  ];

  const kycDocumentTypes = [
    'Aadhaar Card',
    'Passport',
    'Driving License',
    'Voter ID',
    'PAN Card',
    'Other Government ID'
  ];

  useEffect(() => {
    if (property) {
      setFormData({ ...formData, ...property });
      setSelectedAmenities(property.amenities || []);
      setSelectedNearbyFacilities(property.nearbyFacilities || []);
      setUploadedFiles(property.fileReferences || []);
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

  const handleAmenityChange = (amenity) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(newAmenities);
    setFormData(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  const handleNearbyFacilityChange = (facility) => {
    const newFacilities = selectedNearbyFacilities.includes(facility)
      ? selectedNearbyFacilities.filter(f => f !== facility)
      : [...selectedNearbyFacilities, facility];
    
    setSelectedNearbyFacilities(newFacilities);
    setFormData(prev => ({
      ...prev,
      nearbyFacilities: newFacilities
    }));
  };

  const handleFilesUploaded = (files) => {
    setUploadedFiles(files);
    setFormData(prev => ({
      ...prev,
      fileReferences: files
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Full address is required';
      if (!formData.latitude) newErrors.latitude = 'Latitude is required';
      if (!formData.longitude) newErrors.longitude = 'Longitude is required';
      if (!formData.type) newErrors.type = 'Property type is required';
      if (!formData.builtUpArea) newErrors.builtUpArea = 'Built-up area is required';
      if (!formData.currentStatus) newErrors.currentStatus = 'Current status is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }

    if (step === 2) {
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
      if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
      if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone is required';
      if (!formData.kycDocumentType) newErrors.kycDocumentType = 'KYC document type is required';
      if (!formData.kycDocumentNumber.trim()) newErrors.kycDocumentNumber = 'KYC document number is required';
    }

    if (step === 3) {
      if (!formData.price) newErrors.price = 'Price is required';
      if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
      if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const propertyData = {
        ...formData,
        id: property?.id || Date.now().toString(),
        createdAt: property?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      await propertyStorage.saveProperty(propertyData);
      
      // Save file references
      if (uploadedFiles.length > 0) {
        for (const fileRef of uploadedFiles) {
          await propertyStorage.addFileReference(propertyData.id, fileRef);
        }
      }

      onSave(propertyData);
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>1. Core Property Information</h3>
      
      <div className="form-group">
        <label htmlFor="title">Title / Listing Name *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., 3BHK Flat in Noida Sector 62"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="fullAddress">Full Address *</label>
        <textarea
          id="fullAddress"
          name="fullAddress"
          value={formData.fullAddress}
          onChange={handleInputChange}
          placeholder="House/Flat No., Street, Locality, City, State, ZIP/Pin Code"
          rows="3"
          className={errors.fullAddress ? 'error' : ''}
        />
        {errors.fullAddress && <span className="error-message">{errors.fullAddress}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="latitude">Latitude *</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            placeholder="e.g., 28.6139"
            step="any"
            className={errors.latitude ? 'error' : ''}
          />
          {errors.latitude && <span className="error-message">{errors.latitude}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude *</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            placeholder="e.g., 77.2090"
            step="any"
            className={errors.longitude ? 'error' : ''}
          />
          {errors.longitude && <span className="error-message">{errors.longitude}</span>}
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
            <option value="">Select Property Type</option>
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
          <input
            type="text"
            id="subType"
            name="subType"
            value={formData.subType}
            onChange={handleInputChange}
            placeholder="e.g., 2BHK, 3BHK, Duplex"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="builtUpArea">Built-up Area (sqft) *</label>
          <input
            type="number"
            id="builtUpArea"
            name="builtUpArea"
            value={formData.builtUpArea}
            onChange={handleInputChange}
            placeholder="e.g., 1200"
            className={errors.builtUpArea ? 'error' : ''}
          />
          {errors.builtUpArea && <span className="error-message">{errors.builtUpArea}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="superArea">Super Area (sqft)</label>
          <input
            type="number"
            id="superArea"
            name="superArea"
            value={formData.superArea}
            onChange={handleInputChange}
            placeholder="e.g., 1400"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="floorNumber">Floor Number</label>
          <input
            type="number"
            id="floorNumber"
            name="floorNumber"
            value={formData.floorNumber}
            onChange={handleInputChange}
            placeholder="e.g., 5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalFloors">Total Floors</label>
          <input
            type="number"
            id="totalFloors"
            name="totalFloors"
            value={formData.totalFloors}
            onChange={handleInputChange}
            placeholder="e.g., 20"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="currentStatus">Current Status *</label>
        <select
          id="currentStatus"
          name="currentStatus"
          value={formData.currentStatus}
          onChange={handleInputChange}
          className={errors.currentStatus ? 'error' : ''}
        >
          <option value="">Select Current Status</option>
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
          <option value="under_construction">Under Construction</option>
          <option value="new_booking">New Booking</option>
          <option value="resale">Resale</option>
          <option value="ready_to_move">Ready to Move</option>
        </select>
        {errors.currentStatus && <span className="error-message">{errors.currentStatus}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Property Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your property in detail..."
          rows="4"
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>2. Owner/Seller Information</h3>
      
      <div className="form-group">
        <label htmlFor="ownerName">Owner Name *</label>
        <input
          type="text"
          id="ownerName"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleInputChange}
          placeholder="Full name as per legal documents"
          className={errors.ownerName ? 'error' : ''}
        />
        {errors.ownerName && <span className="error-message">{errors.ownerName}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerEmail">Email *</label>
          <input
            type="email"
            id="ownerEmail"
            name="ownerEmail"
            value={formData.ownerEmail}
            onChange={handleInputChange}
            placeholder="owner@example.com"
            className={errors.ownerEmail ? 'error' : ''}
          />
          {errors.ownerEmail && <span className="error-message">{errors.ownerEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ownerPhone">Phone *</label>
          <input
            type="tel"
            id="ownerPhone"
            name="ownerPhone"
            value={formData.ownerPhone}
            onChange={handleInputChange}
            placeholder="+91 9876543210"
            className={errors.ownerPhone ? 'error' : ''}
          />
          {errors.ownerPhone && <span className="error-message">{errors.ownerPhone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="kycDocumentType">KYC Document Type *</label>
          <select
            id="kycDocumentType"
            name="kycDocumentType"
            value={formData.kycDocumentType}
            onChange={handleInputChange}
            className={errors.kycDocumentType ? 'error' : ''}
          >
            <option value="">Select Document Type</option>
            {kycDocumentTypes.map(doc => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
          {errors.kycDocumentType && <span className="error-message">{errors.kycDocumentType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="kycDocumentNumber">KYC Document Number *</label>
          <input
            type="text"
            id="kycDocumentNumber"
            name="kycDocumentNumber"
            value={formData.kycDocumentNumber}
            onChange={handleInputChange}
            placeholder="Document number"
            className={errors.kycDocumentNumber ? 'error' : ''}
          />
          {errors.kycDocumentNumber && <span className="error-message">{errors.kycDocumentNumber}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>KYC Document Upload</label>
        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          uploadedFiles={uploadedFiles}
          uploadedFolders={uploadedFolders}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>3. Property Details & Pricing</h3>
      
      <div className="form-group">
        <label htmlFor="price">Price (₹) *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="e.g., 5000000"
          className={errors.price ? 'error' : ''}
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bedrooms">Bedrooms *</label>
          <select
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            className={errors.bedrooms ? 'error' : ''}
          >
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
          {errors.bedrooms && <span className="error-message">{errors.bedrooms}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="bathrooms">Bathrooms *</label>
          <select
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            className={errors.bathrooms ? 'error' : ''}
          >
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5+">5+</option>
          </select>
          {errors.bathrooms && <span className="error-message">{errors.bathrooms}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="parking">Parking</label>
          <select
            id="parking"
            name="parking"
            value={formData.parking}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="0">No Parking</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4+">4+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            name="furnishing"
            value={formData.furnishing}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="furnished">Furnished</option>
            <option value="semi_furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Amenities</label>
        <div className="checkbox-grid">
          {amenityOptions.map(amenity => (
            <label key={amenity} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Nearby Facilities</label>
        <div className="checkbox-grid">
          {nearbyFacilities.map(facility => (
            <label key={facility} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedNearbyFacilities.includes(facility)}
                onChange={() => handleNearbyFacilityChange(facility)}
              />
              <span>{facility}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>4. Images & Final Details</h3>
      
      <div className="form-group">
        <label>Property Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
        <div className="image-preview">
          {formData.images.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image} alt={`Property ${index + 1}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="remove-image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Legal Documents & Files</label>
        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          uploadedFiles={uploadedFiles}
          uploadedFolders={uploadedFolders}
        />
      </div>
    </div>
  );

  return (
    <div className="property-form">
      <div className="form-header">
        <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
        <div className="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="form-actions">
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn btn--outline"
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn--primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn--primary"
                >
                  {isSubmitting ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
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
        </div>
      </form>
    </div>
  );
};

export default EnhancedPropertyForm;
