// Local Storage KYC Management
// Stores KYC documents by wallet address locally

class LocalKYCStorage {
  constructor() {
    this.storageKey = 'blockNexus_KYC_Data';
    this.userStorageKey = 'blockNexus_Users';
  }

  // Get all KYC data from localStorage
  getAllKYCData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading KYC data from localStorage:', error);
      return {};
    }
  }

  // Get all user data from localStorage
  getAllUserData() {
    try {
      const data = localStorage.getItem(this.userStorageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading user data from localStorage:', error);
      return {};
    }
  }

  // Save KYC data for a specific wallet address
  saveKYCData(walletAddress, kycData) {
    try {
      console.log(`Saving KYC data for wallet: ${walletAddress}`);
      
      const allKYCData = this.getAllKYCData();
      
      // Store KYC data with wallet address as key
      allKYCData[walletAddress] = {
        ...kycData,
        walletAddress,
        submittedAt: new Date().toISOString(),
        verificationStatus: 'pending'
      };

      localStorage.setItem(this.storageKey, JSON.stringify(allKYCData));
      console.log(`KYC data saved successfully for wallet: ${walletAddress}`);
      
      // Also update user status
      this.updateUserKYCStatus(walletAddress, 'pending');
      
      return true;
    } catch (error) {
      console.error('Error saving KYC data to localStorage:', error);
      throw new Error('Failed to save KYC data locally');
    }
  }

  // Get KYC data for a specific wallet address
  getKYCData(walletAddress) {
    try {
      const allKYCData = this.getAllKYCData();
      return allKYCData[walletAddress] || null;
    } catch (error) {
      console.error('Error getting KYC data from localStorage:', error);
      return null;
    }
  }

  // Update user KYC status
  updateUserKYCStatus(walletAddress, status) {
    try {
      const allUserData = this.getAllUserData();
      
      if (!allUserData[walletAddress]) {
        allUserData[walletAddress] = {};
      }
      
      allUserData[walletAddress] = {
        ...allUserData[walletAddress],
        walletAddress,
        kycStatus: status,
        kycSubmittedAt: new Date().toISOString()
      };

      localStorage.setItem(this.userStorageKey, JSON.stringify(allUserData));
      console.log(`User KYC status updated for ${walletAddress}: ${status}`);
    } catch (error) {
      console.error('Error updating user KYC status:', error);
    }
  }

  // Get user data for a specific wallet address
  getUserData(walletAddress) {
    try {
      const allUserData = this.getAllUserData();
      return allUserData[walletAddress] || null;
    } catch (error) {
      console.error('Error getting user data from localStorage:', error);
      return null;
    }
  }

  // Check if KYC exists for wallet address
  hasKYCData(walletAddress) {
    return this.getKYCData(walletAddress) !== null;
  }

  // Delete KYC data for a wallet address
  deleteKYCData(walletAddress) {
    try {
      const allKYCData = this.getAllKYCData();
      delete allKYCData[walletAddress];
      localStorage.setItem(this.storageKey, JSON.stringify(allKYCData));
      
      // Also update user status
      this.updateUserKYCStatus(walletAddress, 'none');
      
      console.log(`KYC data deleted for wallet: ${walletAddress}`);
      return true;
    } catch (error) {
      console.error('Error deleting KYC data:', error);
      return false;
    }
  }

  // Get statistics
  getKYCStats() {
    try {
      const allKYCData = this.getAllKYCData();
      const walletAddresses = Object.keys(allKYCData);
      
      const stats = {
        total: walletAddresses.length,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      walletAddresses.forEach(address => {
        const kycData = allKYCData[address];
        if (kycData.verificationStatus === 'pending') stats.pending++;
        else if (kycData.verificationStatus === 'approved') stats.approved++;
        else if (kycData.verificationStatus === 'rejected') stats.rejected++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting KYC stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  // Clear all KYC data (admin function)
  clearAllKYCData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.userStorageKey);
      console.log('All KYC data cleared from localStorage');
      return true;
    } catch (error) {
      console.error('Error clearing KYC data:', error);
      return false;
    }
  }

  // Export KYC data for backup
  exportKYCData() {
    try {
      const allKYCData = this.getAllKYCData();
      const dataStr = JSON.stringify(allKYCData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blockNexus_KYC_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      console.log('KYC data exported successfully');
    } catch (error) {
      console.error('Error exporting KYC data:', error);
    }
  }
}

// Create singleton instance
const localKYCStorage = new LocalKYCStorage();

export default localKYCStorage;