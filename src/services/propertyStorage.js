// Property Storage Service using Local Storage
const PROPERTY_STORAGE_KEY = 'blockNexus_properties';

export const propertyStorage = {
  // Get all properties
  getAllProperties: () => {
    try {
      const properties = localStorage.getItem(PROPERTY_STORAGE_KEY);
      return properties ? JSON.parse(properties) : [];
    } catch (error) {
      console.error('Error loading properties from storage:', error);
      return [];
    }
  },

  // Get property by ID
  getPropertyById: (id) => {
    const properties = propertyStorage.getAllProperties();
    return properties.find(property => property.id === id);
  },

  // Save property
  saveProperty: (property) => {
    try {
      const properties = propertyStorage.getAllProperties();
      const existingIndex = properties.findIndex(p => p.id === property.id);
      
      if (existingIndex >= 0) {
        // Update existing property
        properties[existingIndex] = { ...property, updatedAt: new Date().toISOString() };
      } else {
        // Add new property
        const newProperty = {
          ...property,
          id: property.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        properties.push(newProperty);
      }
      
      localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(properties));
      return true;
    } catch (error) {
      console.error('Error saving property:', error);
      return false;
    }
  },

  // Delete property
  deleteProperty: (id) => {
    try {
      const properties = propertyStorage.getAllProperties();
      const filteredProperties = properties.filter(property => property.id !== id);
      localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(filteredProperties));
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  },

  // Search properties
  searchProperties: (query) => {
    const properties = propertyStorage.getAllProperties();
    if (!query) return properties;
    
    const searchTerm = query.toLowerCase();
    return properties.filter(property => 
      property.propertyNumber?.toLowerCase().includes(searchTerm) ||
      property.location?.toLowerCase().includes(searchTerm) ||
      property.type?.toLowerCase().includes(searchTerm) ||
      property.city?.toLowerCase().includes(searchTerm) ||
      property.district?.toLowerCase().includes(searchTerm)
    );
  },

  // Get properties by type
  getPropertiesByType: (type) => {
    const properties = propertyStorage.getAllProperties();
    return properties.filter(property => property.type === type);
  },

  // Clear all properties (for testing)
  clearAllProperties: () => {
    try {
      localStorage.removeItem(PROPERTY_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing properties:', error);
      return false;
    }
  },

  // Get storage statistics
  getStorageStats: () => {
    const properties = propertyStorage.getAllProperties();
    return {
      totalProperties: properties.length,
      byType: properties.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {}),
      lastUpdated: properties.length > 0 ? 
        Math.max(...properties.map(p => new Date(p.updatedAt).getTime())) : null
    };
  }
};

// Property data validation
export const validateProperty = (property) => {
  const errors = {};
  
  // Basic Information - Required
  if (!property.propertyNumber?.trim()) {
    errors.propertyNumber = 'Property/Survey Number is required';
  }
  
  if (!property.propertyTitle?.trim()) {
    errors.propertyTitle = 'Property title is required';
  }
  
  if (!property.type?.trim()) {
    errors.type = 'Property type is required';
  }
  
  if (!property.landArea?.trim()) {
    errors.landArea = 'Land area is required';
  }
  
  // Location Details - Required
  if (!property.location?.trim()) {
    errors.location = 'Property address is required';
  }
  
  if (!property.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!property.district?.trim()) {
    errors.district = 'District is required';
  }
  
  if (!property.state?.trim()) {
    errors.state = 'State is required';
  }
  
  if (!property.pincode?.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(property.pincode)) {
    errors.pincode = 'Pincode must be 6 digits';
  }
  
  // Ownership Details - Required
  if (!property.ownerName?.trim()) {
    errors.ownerName = 'Owner name is required';
  }
  
  if (!property.ownerContact?.trim()) {
    errors.ownerContact = 'Owner contact is required';
  } else if (!/^\d{10}$/.test(property.ownerContact.replace(/\D/g, ''))) {
    errors.ownerContact = 'Please enter a valid 10-digit contact number';
  }
  
  // Optional validation for numeric fields
  if (property.currentValue && isNaN(property.currentValue)) {
    errors.currentValue = 'Current value must be a number';
  }
  
  if (property.purchasePrice && isNaN(property.purchasePrice)) {
    errors.purchasePrice = 'Purchase price must be a number';
  }
  
  if (property.yearBuilt && (isNaN(property.yearBuilt) || property.yearBuilt < 1800 || property.yearBuilt > new Date().getFullYear())) {
    errors.yearBuilt = 'Please enter a valid year';
  }
  
  // Email validation if provided
  if (property.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(property.ownerEmail)) {
    errors.ownerEmail = 'Please enter a valid email address';
  }
  
  // Coordinates validation if provided
  if (property.geoCoordinates && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(property.geoCoordinates)) {
    errors.geoCoordinates = 'Please enter valid coordinates (latitude, longitude)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Property types and their options
export const propertyTypes = [
  { value: 'residential', label: 'Residential', subTypes: ['apartment', 'house', 'villa', 'studio', 'penthouse', 'duplex', 'townhouse'] },
  { value: 'commercial', label: 'Commercial', subTypes: ['office', 'retail', 'warehouse', 'showroom', 'restaurant', 'hotel', 'mall'] },
  { value: 'industrial', label: 'Industrial', subTypes: ['factory', 'manufacturing', 'storage', 'processing', 'research'] },
  { value: 'agricultural', label: 'Agricultural', subTypes: ['farmland', 'orchard', 'vineyard', 'dairy', 'poultry', 'fishery'] },
  { value: 'land', label: 'Land/Plot', subTypes: ['residential-plot', 'commercial-plot', 'agricultural-land', 'industrial-plot'] },
  { value: 'special', label: 'Special Purpose', subTypes: ['hospital', 'school', 'temple', 'government', 'recreational'] }
];

export const amenityOptions = [
  'Swimming Pool', 'Gym/Fitness Center', 'Garden/Park', 'Children\'s Play Area', 
  'Security/CCTV', 'Elevator/Lift', 'Power Backup', 'Water Storage', 
  'Parking Space', 'Club House', 'Tennis Court', 'Basketball Court',
  'Jogging Track', 'Community Hall', 'Library', 'Shopping Complex',
  'Hospital/Clinic', 'School/College', 'Temple/Religious Center', 'Senior Citizen Area'
];

export const furnishingOptions = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'fully-furnished', label: 'Fully Furnished' }
];

export const facingDirections = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north-east', label: 'North-East' },
  { value: 'north-west', label: 'North-West' },
  { value: 'south-east', label: 'South-East' },
  { value: 'south-west', label: 'South-West' }
];

export const ownershipTypes = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'cooperative', label: 'Cooperative Society' },
  { value: 'power-of-attorney', label: 'Power of Attorney' },
  { value: 'joint', label: 'Joint Ownership' }
];

export const nearbyFacilities = [
  'Metro Station', 'Bus Stop', 'Railway Station', 'Airport', 'Hospital',
  'School', 'College', 'Shopping Mall', 'Bank', 'ATM', 'Restaurant',
  'Market', 'Park', 'Temple', 'Mosque', 'Church', 'Police Station',
  'Fire Station', 'Post Office', 'Petrol Pump', 'Pharmacy'
];

// Default property template
export const getDefaultProperty = () => ({
  // Basic Information
  propertyNumber: '',
  propertyTitle: '',
  type: '',
  subType: '',
  landArea: '',
  builtUpArea: '',
  yearBuilt: '',
  totalFloors: '',
  propertyAge: '',
  
  // Location Details
  location: '',
  streetAddress: '',
  locality: '',
  landmark: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  geoCoordinates: '',
  
  // Property Features
  bedrooms: '',
  bathrooms: '',
  parkingSpaces: '',
  amenities: [],
  furnishingStatus: '',
  floorNumber: '',
  facingDirection: '',
  
  // Financial Information
  currentValue: '',
  purchasePrice: '',
  registrationValue: '',
  stampDuty: '',
  registrationFees: '',
  brokerageAmount: '',
  
  // Legal Documents
  ownershipTitle: '',
  ownershipType: '',
  encumbranceCertificate: '',
  governmentApprovals: '',
  litigationStatus: '',
  titleClearance: '',
  surveyNumber: '',
  subDivisionNumber: '',
  
  // Utilities & Infrastructure
  waterSupply: '',
  electricityConnection: '',
  sewageConnection: '',
  gasConnection: '',
  internetConnectivity: '',
  roadAccess: '',
  publicTransport: '',
  
  // Additional Information
  propertyDescription: '',
  specialFeatures: '',
  nearbyFacilities: [],
  environmentalClearance: '',
  futureProjects: '',
  investmentPotential: '',
  additionalNotes: '',
  
  // Ownership Details
  ownerName: '',
  ownerContact: '',
  ownerEmail: '',
  coOwners: [],
  
  // Documents & Media
  documents: [],
  images: [],
  videos: [],
  
  // Verification Status
  verificationStatus: 'pending',
  verificationNotes: '',
  lastInspectionDate: '',
  nextInspectionDue: ''
});
