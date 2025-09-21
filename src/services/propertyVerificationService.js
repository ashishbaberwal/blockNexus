// Property Verification Service for Inspector Workflow
const VERIFICATION_STORAGE_KEY = 'blockNexus_property_verifications';

export const verificationStatuses = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_REVISION: 'requires_revision'
};

export const verificationReasons = {
  DOCUMENT_INCOMPLETE: 'document_incomplete',
  LEGAL_ISSUES: 'legal_issues',
  PROPERTY_DISCREPANCY: 'property_discrepancy',
  OWNERSHIP_VERIFICATION: 'ownership_verification',
  VALUATION_CONCERN: 'valuation_concern',
  TECHNICAL_ISSUE: 'technical_issue',
  OTHER: 'other'
};

export const propertyVerificationService = {
  // Get all properties pending verification
  getPendingVerifications: () => {
    try {
      const verifications = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      const allVerifications = verifications ? JSON.parse(verifications) : [];
      
      return allVerifications.filter(verification => 
        verification.status === verificationStatuses.PENDING
      );
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      return [];
    }
  },

  // Get all properties under review
  getUnderReviewVerifications: () => {
    try {
      const verifications = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      const allVerifications = verifications ? JSON.parse(verifications) : [];
      
      return allVerifications.filter(verification => 
        verification.status === verificationStatuses.UNDER_REVIEW
      );
    } catch (error) {
      console.error('Error getting under review verifications:', error);
      return [];
    }
  },

  // Get all verified properties (approved/rejected)
  getVerifiedProperties: () => {
    try {
      const verifications = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      const allVerifications = verifications ? JSON.parse(verifications) : [];
      
      return allVerifications.filter(verification => 
        [verificationStatuses.APPROVED, verificationStatuses.REJECTED].includes(verification.status)
      );
    } catch (error) {
      console.error('Error getting verified properties:', error);
      return [];
    }
  },

  // Get verification by property ID
  getVerificationByPropertyId: (propertyId) => {
    try {
      const verifications = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      const allVerifications = verifications ? JSON.parse(verifications) : [];
      
      return allVerifications.find(verification => 
        verification.propertyId === propertyId
      );
    } catch (error) {
      console.error('Error getting verification by property ID:', error);
      return null;
    }
  },

  // Create verification record
  createVerification: (propertyId, propertyData) => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      
      const verification = {
        id: `verification_${Date.now()}`,
        propertyId,
        propertyData,
        status: verificationStatuses.PENDING,
        submittedAt: new Date().toISOString(),
        submittedBy: propertyData.ownerName || 'Unknown',
        inspectorId: null,
        inspectorName: null,
        reviewedAt: null,
        reviewNotes: '',
        rejectionReason: null,
        documents: propertyData.fileReferences || [],
        verificationScore: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      verifications.push(verification);
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
      
      return verification;
    } catch (error) {
      console.error('Error creating verification:', error);
      return null;
    }
  },

  // Update verification status
  updateVerificationStatus: (verificationId, status, inspectorId, inspectorName, notes = '', rejectionReason = null) => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      const verificationIndex = verifications.findIndex(v => v.id === verificationId);
      
      if (verificationIndex === -1) {
        throw new Error('Verification not found');
      }

      const verification = verifications[verificationIndex];
      verification.status = status;
      verification.inspectorId = inspectorId;
      verification.inspectorName = inspectorName;
      verification.reviewedAt = new Date().toISOString();
      verification.reviewNotes = notes;
      verification.rejectionReason = rejectionReason;
      verification.updatedAt = new Date().toISOString();

      // Add status history
      if (!verification.statusHistory) {
        verification.statusHistory = [];
      }
      
      verification.statusHistory.push({
        status,
        inspectorId,
        inspectorName,
        timestamp: new Date().toISOString(),
        notes,
        rejectionReason
      });

      verifications[verificationIndex] = verification;
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
      
      return verification;
    } catch (error) {
      console.error('Error updating verification status:', error);
      return null;
    }
  },

  // Assign verification to inspector
  assignToInspector: (verificationId, inspectorId, inspectorName) => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      const verificationIndex = verifications.findIndex(v => v.id === verificationId);
      
      if (verificationIndex === -1) {
        throw new Error('Verification not found');
      }

      const verification = verifications[verificationIndex];
      verification.status = verificationStatuses.UNDER_REVIEW;
      verification.inspectorId = inspectorId;
      verification.inspectorName = inspectorName;
      verification.assignedAt = new Date().toISOString();
      verification.updatedAt = new Date().toISOString();

      verifications[verificationIndex] = verification;
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
      
      return verification;
    } catch (error) {
      console.error('Error assigning verification to inspector:', error);
      return null;
    }
  },

  // Get all verifications
  getAllVerifications: () => {
    try {
      const verifications = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      return verifications ? JSON.parse(verifications) : [];
    } catch (error) {
      console.error('Error getting all verifications:', error);
      return [];
    }
  },

  // Get verifications by inspector
  getVerificationsByInspector: (inspectorId) => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      return verifications.filter(verification => 
        verification.inspectorId === inspectorId
      );
    } catch (error) {
      console.error('Error getting verifications by inspector:', error);
      return [];
    }
  },

  // Get verification statistics
  getVerificationStats: () => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      
      const stats = {
        total: verifications.length,
        pending: verifications.filter(v => v.status === verificationStatuses.PENDING).length,
        underReview: verifications.filter(v => v.status === verificationStatuses.UNDER_REVIEW).length,
        approved: verifications.filter(v => v.status === verificationStatuses.APPROVED).length,
        rejected: verifications.filter(v => v.status === verificationStatuses.REJECTED).length,
        requiresRevision: verifications.filter(v => v.status === verificationStatuses.REQUIRES_REVISION).length
      };

      return stats;
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
  },

  // Search verifications
  searchVerifications: (query, status = null) => {
    try {
      let verifications = propertyVerificationService.getAllVerifications();
      
      if (status) {
        verifications = verifications.filter(v => v.status === status);
      }
      
      if (!query) return verifications;
      
      const searchTerm = query.toLowerCase();
      return verifications.filter(verification => 
        verification.propertyData?.propertyTitle?.toLowerCase().includes(searchTerm) ||
        verification.propertyData?.propertyNumber?.toLowerCase().includes(searchTerm) ||
        verification.propertyData?.location?.toLowerCase().includes(searchTerm) ||
        verification.propertyData?.city?.toLowerCase().includes(searchTerm) ||
        verification.submittedBy?.toLowerCase().includes(searchTerm) ||
        verification.inspectorName?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching verifications:', error);
      return [];
    }
  },

  // Delete verification
  deleteVerification: (verificationId) => {
    try {
      const verifications = propertyVerificationService.getAllVerifications();
      const filteredVerifications = verifications.filter(v => v.id !== verificationId);
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(filteredVerifications));
      return true;
    } catch (error) {
      console.error('Error deleting verification:', error);
      return false;
    }
  },

  // Clear all verifications (for testing)
  clearAllVerifications: () => {
    try {
      localStorage.removeItem(VERIFICATION_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing verifications:', error);
      return false;
    }
  }
};

// Helper function to create verification from property
export const createVerificationFromProperty = (property) => {
  return propertyVerificationService.createVerification(property.id, property);
};

// Helper function to get verification status display
export const getVerificationStatusDisplay = (status) => {
  const statusMap = {
    [verificationStatuses.PENDING]: { text: 'Pending Review', color: '#f59e0b', icon: '⏳' },
    [verificationStatuses.UNDER_REVIEW]: { text: 'Under Review', color: '#3b82f6', icon: '🔍' },
    [verificationStatuses.APPROVED]: { text: 'Approved', color: '#10b981', icon: '✅' },
    [verificationStatuses.REJECTED]: { text: 'Rejected', color: '#ef4444', icon: '❌' },
    [verificationStatuses.REQUIRES_REVISION]: { text: 'Requires Revision', color: '#f97316', icon: '📝' }
  };
  
  return statusMap[status] || { text: 'Unknown', color: '#6b7280', icon: '❓' };
};

// Helper function to get rejection reason display
export const getRejectionReasonDisplay = (reason) => {
  const reasonMap = {
    [verificationReasons.DOCUMENT_INCOMPLETE]: 'Documentation Incomplete',
    [verificationReasons.LEGAL_ISSUES]: 'Legal Issues Found',
    [verificationReasons.PROPERTY_DISCREPANCY]: 'Property Information Discrepancy',
    [verificationReasons.OWNERSHIP_VERIFICATION]: 'Ownership Verification Failed',
    [verificationReasons.VALUATION_CONCERN]: 'Valuation Concerns',
    [verificationReasons.TECHNICAL_ISSUE]: 'Technical Issue',
    [verificationReasons.OTHER]: 'Other'
  };
  
  return reasonMap[reason] || 'Unknown Reason';
};

export default propertyVerificationService;
