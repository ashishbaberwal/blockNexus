import React, { useState, useEffect } from 'react';
import locationService from '../services/locationService';
import './SmartAddressForm.css';

const SmartAddressForm = ({ onAddressUpdate, initialData = {} }) => {
  const [addressData, setAddressData] = useState({
    houseNumber: '',
    road: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
    ...initialData
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-fill using current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const coords = await locationService.getCurrentLocation();
      const addressInfo = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      
      const newAddressData = {
        houseNumber: addressInfo.houseNumber,
        road: addressInfo.road,
        area: addressInfo.area || addressInfo.locality,
        city: addressInfo.city,
        state: addressInfo.state,
        pincode: addressInfo.pincode,
        latitude: addressInfo.latitude,
        longitude: addressInfo.longitude
      };

      setAddressData(newAddressData);
      onAddressUpdate?.(newAddressData);
      
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle manual coordinate input
  const handleCoordinateUpdate = async (field, value) => {
    const newData = { ...addressData, [field]: parseFloat(value) || null };
    setAddressData(newData);

    // If both coordinates are valid, reverse geocode
    if (newData.latitude && newData.longitude && 
        locationService.isValidCoordinates(newData.latitude, newData.longitude)) {
      
      try {
        const addressInfo = await locationService.reverseGeocode(newData.latitude, newData.longitude);
        
        const updatedData = {
          ...newData,
          road: addressInfo.road || newData.road,
          area: addressInfo.area || addressInfo.locality || newData.area,
          city: addressInfo.city || newData.city,
          state: addressInfo.state || newData.state,
          pincode: addressInfo.pincode || newData.pincode
        };

        setAddressData(updatedData);
        onAddressUpdate?.(updatedData);
      } catch (error) {
        console.error('Failed to reverse geocode:', error);
      }
    }
  };

  // Handle address search
  const handleAddressSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await locationService.getAddressSuggestions(query, { 
        countryCode: 'in', 
        limit: 5 
      });
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search failed:', error);
      setSuggestions([]);
    }
  };

  // Select suggestion
  const handleSuggestionSelect = (suggestion) => {
    const newAddressData = {
      houseNumber: suggestion.houseNumber,
      road: suggestion.road,
      area: suggestion.area || suggestion.locality,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    };

    setAddressData(newAddressData);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    onAddressUpdate?.(newAddressData);
  };

  // Handle manual field changes
  const handleFieldChange = (field, value) => {
    const newData = { ...addressData, [field]: value };
    setAddressData(newData);
    onAddressUpdate?.(newData);
  };

  return (
    <div className="smart-address-form">
      <div className="address-form-header">
        <h3>Property Address</h3>
        <div className="location-actions">
          <button
            type="button"
            className="btn btn--outline location-btn"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? '📍 Getting Location...' : '📍 Use Current Location'}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="error-message">
          ⚠️ {locationError}
        </div>
      )}

      {/* Address Search */}
      <div className="address-search-container">
        <label htmlFor="addressSearch">Quick Address Search</label>
        <div className="search-input-container">
          <input
            id="addressSearch"
            type="text"
            placeholder="Start typing an address to search..."
            value={searchQuery}
            onChange={(e) => handleAddressSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="suggestion-main">{suggestion.displayName}</div>
                <div className="suggestion-details">
                  📍 {suggestion.latitude?.toFixed(6)}, {suggestion.longitude?.toFixed(6)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Address Fields */}
      <div className="address-fields-grid">
        <div className="field-group">
          <label htmlFor="houseNumber">House/Building Number</label>
          <input
            id="houseNumber"
            type="text"
            value={addressData.houseNumber}
            onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
            placeholder="e.g., A-123, Building Name"
          />
        </div>

        <div className="field-group">
          <label htmlFor="road">Street/Road Name *</label>
          <input
            id="road"
            type="text"
            value={addressData.road}
            onChange={(e) => handleFieldChange('road', e.target.value)}
            placeholder="e.g., MG Road, Sector 18"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="area">Area/Locality Name *</label>
          <input
            id="area"
            type="text"
            value={addressData.area}
            onChange={(e) => handleFieldChange('area', e.target.value)}
            placeholder="e.g., Koramangala, Bandra West, Sector 18"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="city">City *</label>
          <input
            id="city"
            type="text"
            value={addressData.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="e.g., Greater Noida"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={addressData.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            required
          >
            <option value="">Select State</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="pincode">PIN Code *</label>
          <input
            id="pincode"
            type="text"
            value={addressData.pincode}
            onChange={(e) => handleFieldChange('pincode', e.target.value)}
            placeholder="e.g., 400066"
            pattern="[0-9]{6}"
            maxLength="6"
            required
          />
        </div>
      </div>

      {/* Coordinates Section */}
      <div className="coordinates-section">
        <h4>📍 Coordinates (Optional but Recommended)</h4>
        <p className="coordinates-help">
          Coordinates help with accurate property location on maps
        </p>
        
        <div className="coordinates-grid">
          <div className="field-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={addressData.latitude || ''}
              onChange={(e) => handleCoordinateUpdate('latitude', e.target.value)}
              placeholder="e.g., 28.6139"
            />
          </div>

          <div className="field-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={addressData.longitude || ''}
              onChange={(e) => handleCoordinateUpdate('longitude', e.target.value)}
              placeholder="e.g., 77.2090"
            />
          </div>
        </div>

        {addressData.latitude && addressData.longitude && (
          <div className="coordinates-display">
            <span className="coordinates-label">📍 Current Location:</span>
            <span className="coordinates-value">
              {addressData.latitude.toFixed(6)}, {addressData.longitude.toFixed(6)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${addressData.latitude},${addressData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-on-map-link"
            >
              View on Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAddressForm;