// Sample data generator for testing inspector functionality
import { propertyVerificationService, verificationStatuses } from '../services/propertyVerificationService';
import { propertyStorage } from '../services/propertyStorage';

export const createSampleVerifications = () => {
  try {
    // Get existing properties
    const properties = propertyStorage.getAllProperties();
    
    if (properties.length === 0) {
      console.log('No properties found. Please add some properties first.');
      return false;
    }

    // Create sample verifications for existing properties
    const sampleVerifications = properties.slice(0, 3).map((property, index) => {
      const verification = propertyVerificationService.createVerification(property.id, property);
      
      // Set different statuses for variety
      if (index === 0) {
        // Keep first one as pending
        return verification;
      } else if (index === 1) {
        // Set second one as under review
        return propertyVerificationService.updateVerificationStatus(
          verification.id,
          verificationStatuses.UNDER_REVIEW,
          'sample-inspector-123',
          'Sample Inspector',
          'Property assigned for detailed review'
        );
      } else {
        // Set third one as approved
        return propertyVerificationService.updateVerificationStatus(
          verification.id,
          verificationStatuses.APPROVED,
          'sample-inspector-123',
          'Sample Inspector',
          'Property meets all verification requirements. Approved for listing.'
        );
      }
    });

    console.log('Sample verifications created:', sampleVerifications.length);
    return true;
  } catch (error) {
    console.error('Error creating sample verifications:', error);
    return false;
  }
};

export const clearAllVerifications = () => {
  try {
    propertyVerificationService.clearAllVerifications();
    console.log('All verifications cleared');
    return true;
  } catch (error) {
    console.error('Error clearing verifications:', error);
    return false;
  }
};

export const getVerificationStats = () => {
  try {
    return propertyVerificationService.getVerificationStats();
  } catch (error) {
    console.error('Error getting verification stats:', error);
    return {
      total: 0,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      requiresRevision: 0
    };
  }
};
