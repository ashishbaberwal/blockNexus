// Location Service for automating address fields using coordinates
class LocationService {
  constructor() {
    this.geocodingEndpoints = {
      // Free APIs for reverse geocoding
      nominatim: 'https://nominatim.openstreetmap.org/reverse',
      // You can add more providers like Google Maps API, MapBox etc.
      // google: 'https://maps.googleapis.com/maps/api/geocode/json',
      // mapbox: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
    };
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('User denied the request for Geolocation.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case error.TIMEOUT:
              reject(new Error('The request to get user location timed out.'));
              break;
            default:
              reject(new Error('An unknown error occurred.'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // Reverse geocode coordinates to get address details
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.geocodingEndpoints.nominatim}?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BlockNexus Property App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        throw new Error('No address data found for these coordinates');
      }

      return this.parseAddressData(data);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // Parse the geocoding response into our required format
  parseAddressData(geocodeData) {
    const address = geocodeData.address;
    
    // Map common address components
    const addressInfo = {
      // Basic coordinates
      latitude: parseFloat(geocodeData.lat),
      longitude: parseFloat(geocodeData.lon),
      
      // Full formatted address
      fullAddress: geocodeData.display_name,
      
      // Detailed components
      houseNumber: address.house_number || '',
      road: address.road || address.street || '',
      locality: address.suburb || address.neighbourhood || address.locality || '',
      area: address.suburb || address.neighbourhood || address.city_district || '',
      city: address.city || address.town || address.village || '',
      state: address.state || address.province || '',
      pincode: address.postcode || '',
      country: address.country || 'India',
      countryCode: address.country_code || 'in',
      
      // Additional useful info
      amenity: address.amenity || '',
      building: address.building || '',
      landmark: address.tourism || address.historic || address.amenity || ''
    };

    // Smart city detection for Greater Noida area
    if (this.isGreaterNoidaArea(addressInfo)) {
      addressInfo.city = 'Greater Noida';
      addressInfo.state = 'Uttar Pradesh';
    }

    return addressInfo;
  }

  // Special handling for Greater Noida area detection
  isGreaterNoidaArea(addressInfo) {
    const noidaKeywords = ['noida', 'greater noida', 'gautam buddha nagar', 'sector'];
    const searchText = `${addressInfo.city} ${addressInfo.area} ${addressInfo.locality}`.toLowerCase();
    
    return noidaKeywords.some(keyword => searchText.includes(keyword));
  }

  // Get address suggestions based on partial input
  async getAddressSuggestions(query, options = {}) {
    try {
      const { countryCode = 'in', limit = 5 } = options;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=${limit}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BlockNexus Property App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Address search failed');
      }

      const results = await response.json();
      
      return results.map(result => ({
        displayName: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        ...this.parseAddressData(result)
      }));
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  }

  // Validate coordinates
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }

  // Get distance between two coordinates (in kilometers)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new LocationService();