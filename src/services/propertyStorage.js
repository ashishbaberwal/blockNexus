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
  
  if (!property.propertyNumber?.trim()) {
    errors.propertyNumber = 'Property/Survey Number is required';
  }
  
  if (!property.location?.trim()) {
    errors.location = 'Location is required';
  }
  
  if (!property.type?.trim()) {
    errors.type = 'Property type is required';
  }
  
  if (!property.landArea?.trim()) {
    errors.landArea = 'Land area is required';
  }
  
  if (!property.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!property.district?.trim()) {
    errors.district = 'District is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Property types and their options
export const propertyTypes = [
  { value: 'land', label: 'Land' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Other' }
];

// Default property template
export const getDefaultProperty = () => ({
  propertyNumber: '',
  location: '',
  type: '',
  landArea: '',
  city: '',
  district: '',
  geoCoordinates: '',
  ownershipTitle: '',
  encumbranceCertificate: '',
  governmentApprovals: '',
  litigationStatus: '',
  additionalNotes: '',
  documents: []
});
