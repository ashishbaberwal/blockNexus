// Local Document Storage Service
// Saves documents as actual files in public/documents folder

class LocalDocumentStorage {
  constructor() {
    this.kycStorageKey = 'blockNexus_KYC_Data';
    this.documentsBasePath = '/documents';
  }

  // Generate unique filename
  generateFileName(originalName, walletAddress, documentType) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const sanitizedWallet = walletAddress.slice(0, 10);
    return `${documentType}_${sanitizedWallet}_${timestamp}.${extension}`;
  }

  // Get KYC data from localStorage
  getAllKYCData() {
    try {
      const data = localStorage.getItem(this.kycStorageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting KYC data:', error);
      return {};
    }
  }

  // Save KYC data to localStorage
  saveKYCData(walletAddress, kycData) {
    try {
      const allData = this.getAllKYCData();
      allData[walletAddress] = {
        ...kycData,
        walletAddress,
        submittedAt: new Date().toISOString(),
        status: 'approved', // Auto-approve all KYC submissions
        approvedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.kycStorageKey, JSON.stringify(allData));
      return allData[walletAddress];
    } catch (error) {
      console.error('Error saving KYC data:', error);
      throw error;
    }
  }

  // Get KYC data for specific wallet
  getKYCData(walletAddress) {
    try {
      const allData = this.getAllKYCData();
      return allData[walletAddress] || null;
    } catch (error) {
      console.error('Error getting KYC data for wallet:', error);
      return null;
    }
  }

  // Save file locally (this is a simulated save - in real app would need backend)
  async saveDocument(file, walletAddress, documentType) {
    try {
      // Generate filename
      const fileName = this.generateFileName(file.name, walletAddress, documentType);
      const filePath = `${this.documentsBasePath}/${documentType}/${fileName}`;
      
      // Convert file to base64 for now (in production, use proper file upload)
      const base64 = await this.fileToBase64(file);
      
      // In a real application, you would upload this to a server
      // For now, we'll store the file info and base64 data
      return {
        fileName,
        filePath,
        originalName: file.name,
        size: file.size,
        type: file.type,
        base64Data: base64, // Keep base64 for display purposes
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Update KYC status
  updateKYCStatus(walletAddress, status, rejectionReason = null) {
    try {
      const allData = this.getAllKYCData();
      if (allData[walletAddress]) {
        allData[walletAddress].status = status;
        allData[walletAddress].lastUpdated = new Date().toISOString();
        
        if (status === 'approved') {
          allData[walletAddress].approvedAt = new Date().toISOString();
        } else if (status === 'rejected') {
          allData[walletAddress].rejectedAt = new Date().toISOString();
          allData[walletAddress].rejectionReason = rejectionReason;
        }
        
        localStorage.setItem(this.kycStorageKey, JSON.stringify(allData));
        return allData[walletAddress];
      }
      return null;
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }

  // Get KYC statistics
  getKYCStats() {
    try {
      const allData = this.getAllKYCData();
      const entries = Object.values(allData);
      
      return {
        total: entries.length,
        pending: entries.filter(kyc => kyc.status === 'pending').length,
        approved: entries.filter(kyc => kyc.status === 'approved').length,
        rejected: entries.filter(kyc => kyc.status === 'rejected').length
      };
    } catch (error) {
      console.error('Error getting KYC stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  // Export all KYC data
  exportKYCData() {
    try {
      const data = this.getAllKYCData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kyc_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting KYC data:', error);
      return false;
    }
  }

  // Clear all KYC data
  clearAllKYCData() {
    try {
      localStorage.removeItem(this.kycStorageKey);
      return true;
    } catch (error) {
      console.error('Error clearing KYC data:', error);
      return false;
    }
  }

  // Check if user has completed KYC
  hasCompletedKYC(walletAddress) {
    const kycData = this.getKYCData(walletAddress);
    return kycData && kycData.status === 'approved';
  }

  // Get pending KYC submissions
  getPendingKYC() {
    try {
      const allData = this.getAllKYCData();
      return Object.values(allData).filter(kyc => kyc.status === 'pending');
    } catch (error) {
      console.error('Error getting pending KYC:', error);
      return [];
    }
  }
}

// Create and export service instance
const localDocumentStorage = new LocalDocumentStorage();
export default localDocumentStorage;