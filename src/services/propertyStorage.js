// Property Storage Service using IndexedDB
import indexedDBService from './indexedDBService';

export const propertyStorage = {
  // Get all properties
  getAllProperties: async () => {
    try {
      const properties = await indexedDBService.getAll('properties');
      return properties || [];
    } catch (error) {
      console.error('Error loading properties from storage:', error);
      return [];
    }
  },

  // Get property by ID
  getPropertyById: async (id) => {
    try {
      return await indexedDBService.get('properties', id);
    } catch (error) {
      console.error('Error loading property by ID:', error);
      return null;
    }
  },

  // Save property
  saveProperty: async (property) => {
    try {
      // Clean up property data to reduce size before saving
      const cleanProperty = propertyStorage.cleanPropertyForStorage(property);
      
      // Check if property exists
      const existingProperty = await indexedDBService.get('properties', cleanProperty.id);
      
      let propertyToSave;
      if (existingProperty) {
        // Update existing property
        propertyToSave = { ...cleanProperty, updatedAt: new Date().toISOString() };
      } else {
        // Add new property with pending approval status
        propertyToSave = {
          ...cleanProperty,
          id: cleanProperty.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvalStatus: approvalStatuses.PENDING,
          submittedAt: new Date().toISOString()
        };
      }
      
      // Save to IndexedDB
      await indexedDBService.put('properties', propertyToSave);
      return true;
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
      return false;
    }
  },

  // Clean property data to reduce storage size
  cleanPropertyForStorage: (property) => {
    const cleaned = { ...property };
    
    // Remove or compress large image data
    if (cleaned.propertyImageData && cleaned.propertyImageData.length > 100000) {
      // Keep only a thumbnail version for very large images
      console.log('Compressing large image data for storage');
      cleaned.propertyImageData = propertyStorage.createThumbnail(cleaned.propertyImageData);
    }
    
    // Remove temporary file objects that can't be serialized
    delete cleaned.propertyImage;
    
    // Clean up empty or undefined fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null || cleaned[key] === '') {
        delete cleaned[key];
      }
    });
    
    return cleaned;
  },

  // Remove image data from property to save space
  removeImageData: (property) => {
    const cleaned = { ...property };
    delete cleaned.propertyImageData;
    delete cleaned.propertyImagePreview;
    delete cleaned.propertyImage;
    delete cleaned.propertyImages;
    delete cleaned.propertyImagesData;
    return cleaned;
  },

  // Create a small thumbnail from base64 image
  createThumbnail: (base64Image, maxSize = 50000) => {
    try {
      // If already small enough, return as is
      if (base64Image.length <= maxSize) {
        return base64Image;
      }
      
      // For very large images, create a placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return base64Image;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      await indexedDBService.delete('properties', id);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  },

  // Search properties
  searchProperties: async (query) => {
    const properties = await propertyStorage.getAllProperties();
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
  getPropertiesByType: async (type) => {
    try {
      return await indexedDBService.getByIndex('properties', 'type', type);
    } catch (error) {
      console.error('Error getting properties by type:', error);
      return [];
    }
  },

  // Clear all properties (for testing)
  clearAllProperties: async () => {
    try {
      await indexedDBService.clear('properties');
      return true;
    } catch (error) {
      console.error('Error clearing properties:', error);
      return false;
    }
  },

  // Get storage statistics
  getStorageStats: async () => {
    try {
      const properties = await propertyStorage.getAllProperties();
      const storageEstimate = await indexedDBService.getStorageEstimate();
      const storageSizeMB = Math.round(storageEstimate.usage / (1024 * 1024));
      const quotaMB = Math.round(storageEstimate.quota / (1024 * 1024));
      
      return {
        totalProperties: properties.length,
        storageSizeMB: storageSizeMB,
        quotaMB: quotaMB,
        storageUsagePercent: quotaMB > 0 ? Math.round((storageSizeMB / quotaMB) * 100) : 0,
        byType: properties.reduce((acc, property) => {
          acc[property.type] = (acc[property.type] || 0) + 1;
          return acc;
        }, {}),
        byApprovalStatus: properties.reduce((acc, property) => {
          const status = property.approvalStatus || approvalStatuses.PENDING;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        lastUpdated: properties.length > 0 ? 
          Math.max(...properties.map(p => new Date(p.updatedAt).getTime())) : null
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalProperties: 0,
        storageSizeMB: 0,
        quotaMB: 0,
        storageUsagePercent: 0,
        byType: {},
        byApprovalStatus: {},
        lastUpdated: null
      };
    }
  },

  // Clean up storage to free space
  cleanupStorage: async () => {
    try {
      const properties = await propertyStorage.getAllProperties();
      
      // Remove image data from all but the 3 most recent properties
      const sortedProperties = properties.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const cleanedProperties = sortedProperties.map((prop, index) => {
        if (index >= 3) { // Keep images only for the 3 newest properties
          return propertyStorage.removeImageData(prop);
        }
        return prop;
      });
      
      // Save cleaned properties back to IndexedDB
      await indexedDBService.clear('properties');
      for (const property of cleanedProperties) {
        await indexedDBService.put('properties', property);
      }
      
      const stats = await propertyStorage.getStorageStats();
      console.log(`Storage cleaned up. New size: ${stats.storageSizeMB}MB`);
      
      return true;
    } catch (error) {
      console.error('Error cleaning up storage:', error);
      return false;
    }
  },

  // Check if storage is getting full and warn user
  checkStorageHealth: async () => {
    try {
      const stats = await propertyStorage.getStorageStats();
      
      if (stats.storageUsagePercent > 80) {
        console.warn(`Storage usage is at ${stats.storageUsagePercent}%. Consider cleaning up old properties.`);
        return {
          status: 'warning',
          message: `Storage is ${stats.storageUsagePercent}% full (${stats.storageSizeMB}MB of ${stats.quotaMB}MB). Consider removing old properties or their images.`,
          stats
        };
      } else if (stats.storageUsagePercent > 95) {
        console.error(`Storage usage is at ${stats.storageUsagePercent}%. Storage cleanup recommended.`);
        return {
          status: 'critical',
          message: `Storage is ${stats.storageUsagePercent}% full (${stats.storageSizeMB}MB of ${stats.quotaMB}MB). Automatic cleanup may occur.`,
          stats
        };
      }
      
      return {
        status: 'healthy',
        message: `Storage usage: ${stats.storageUsagePercent}% (${stats.storageSizeMB}MB of ${stats.quotaMB}MB)`,
        stats
      };
    } catch (error) {
      console.error('Error checking storage health:', error);
      return {
        status: 'error',
        message: 'Unable to check storage status',
        stats: null
      };
    }
  },

  // Get properties by approval status
  getPropertiesByApprovalStatus: async (status) => {
    try {
      return await indexedDBService.getByIndex('properties', 'approvalStatus', status);
    } catch (error) {
      console.error('Error getting properties by approval status:', error);
      return [];
    }
  },

  // Update property approval status
  updateApprovalStatus: async (propertyId, status, reviewedBy = null, rejectionReason = null) => {
    try {
      const property = await indexedDBService.get('properties', propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }

      const now = new Date().toISOString();

      // Update approval status
      property.approvalStatus = status;
      property.updatedAt = now;
      property.reviewedBy = reviewedBy;

      // Set specific timestamps based on status
      switch (status) {
        case approvalStatuses.APPROVED:
          property.approvedAt = now;
          property.rejectedAt = null;
          property.rejectionReason = null;
          break;
        case approvalStatuses.REJECTED:
          property.rejectedAt = now;
          property.approvedAt = null;
          property.rejectionReason = rejectionReason;
          break;
        case approvalStatuses.UNDER_REVIEW:
          property.approvedAt = null;
          property.rejectedAt = null;
          property.rejectionReason = null;
          break;
        default:
          break;
      }

      await indexedDBService.put('properties', property);
      return true;
    } catch (error) {
      console.error('Error updating approval status:', error);
      return false;
    }
  }
};

// Property data validation
export const validateProperty = (property) => {
  const errors = {};
  
  // Core Property Details Validation
  if (!property.propertyTitle?.trim()) {
    errors.propertyTitle = 'Property title is required';
  }
  
  if (!property.fullAddress?.trim()) {
    errors.fullAddress = 'Full address is required';
  }
  
  if (!property.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!property.state?.trim()) {
    errors.state = 'State is required';
  }
  
  if (!property.pinCode?.trim()) {
    errors.pinCode = 'PIN code is required';
  } else if (!/^\d{6}$/.test(property.pinCode.trim())) {
    errors.pinCode = 'PIN code must be 6 digits';
  }
  
  if (!property.type?.trim()) {
    errors.type = 'Property type is required';
  }
  
  if (!property.propertySize?.trim()) {
    errors.propertySize = 'Property size is required';
  }
  
  if (!property.currentUseStatus?.trim()) {
    errors.currentUseStatus = 'Current use status is required';
  }
  
  // Step 6 validation - Terms agreement
  if (property.currentStep === 6 || property.agreeToTerms !== undefined) {
    if (!property.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    if (!property.consentToVerification) {
      errors.consentToVerification = 'You must consent to verification processes';
    }
  }
  
  // Backward compatibility with old field names
  if (!property.propertyTitle && property.propertyNumber?.trim()) {
    property.propertyTitle = property.propertyNumber;
  }
  
  if (!property.fullAddress && property.location?.trim()) {
    property.fullAddress = property.location;
  }
  
  if (!property.propertySize && property.landArea?.trim()) {
    property.propertySize = property.landArea;
  }
  
  if (!property.state && property.district?.trim()) {
    property.state = property.district;
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

// Property approval statuses
export const approvalStatuses = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review'
};

// Property use status options
export const useStatusOptions = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'renovation', label: 'Under Renovation' },
  { value: 'disputed', label: 'Disputed' }
];

// Document types for verification
export const documentTypes = {
  RECORD_OF_RIGHTS: 'record_of_rights',
  SALE_DEED: 'sale_deed',
  TAX_RECEIPT: 'tax_receipt',
  ENCUMBRANCE_CERT: 'encumbrance_certificate',
  GOVERNMENT_ID: 'government_id',
  INSPECTOR_REPORT: 'inspector_report'
};

// Default property template
export const getDefaultProperty = () => ({
  // Core Property Details
  propertyTitle: '',
  propertyNumber: '',
  fullAddress: '',
  city: '',
  state: '',
  pinCode: '',
  locality: '',
  gpsCoordinates: {
    latitude: '',
    longitude: ''
  },
  type: '',
  propertySize: '',
  plotNumber: '',
  surveyNumber: '',
  currentUseStatus: '',
  
  // Legacy fields (for backward compatibility)
  location: '',
  landArea: '',
  district: '',
  geoCoordinates: '',
  
  // Legal Documentation
  documents: {
    recordOfRights: null,
    saleDeed: null,
    taxReceipt: null,
    encumbranceCertificate: null,
    governmentId: null,
    inspectorReport: null
  },
  documentHashes: {},
  
  // Media with Authenticity
  propertyImages: [],
  propertyVideo: null,
  inspectorImages: [],
  sellerSelfie: null,
  mediaMetadata: {},
  
  // Legacy image fields
  propertyImage: null,
  propertyImagePreview: null,
  
  // Verification Status
  verificationLevel: 'basic', // basic, inspector_verified, community_verified
  inspectorVerified: false,
  inspectorId: null,
  inspectorReport: null,
  communityRating: 0,
  communityReviews: [],
  
  // Seller Information
  sellerKYC: {
    verified: false,
    documentType: '',
    documentNumber: '',
    verificationDate: null
  },
  
  // Blockchain & Security
  blockchainHash: null,
  documentIntegrity: true,
  
  // Trust & Reputation
  sellerReputation: 0,
  verificationBadges: [],
  peerReviews: [],
  
  // Legacy fields
  ownershipTitle: '',
  encumbranceCertificate: '',
  governmentApprovals: '',
  litigationStatus: '',
  additionalNotes: '',
  
  // Approval workflow
  approvalStatus: approvalStatuses.PENDING,
  submittedAt: null,
  approvedAt: null,
  rejectedAt: null,
  rejectionReason: null,
  reviewedBy: null
});
