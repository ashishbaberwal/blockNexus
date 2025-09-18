// LocalStorage-based Transaction Service
// Replaces Firebase Firestore with localStorage for transaction management

// Transaction status constants
export const TRANSACTION_STATUS = {
  PURCHASE_REQUESTED: 'purchase_requested',
  LENDER_APPROVED: 'lender_approved',
  UNDER_INSPECTION: 'under_inspection',
  INSPECTOR_APPROVED: 'inspector_approved',
  SELLER_APPROVED: 'seller_approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Transaction roles
export const TRANSACTION_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  LENDER: 'lender',
  INSPECTOR: 'inspector'
};

class LocalTransactionService {
  constructor() {
    this.storageKey = 'blockNexus_Transactions';
    this.counterKey = 'blockNexus_Transaction_Counter';
  }

  // Get all transactions from localStorage
  getAllTransactions() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading transactions:', error);
      return {};
    }
  }

  // Save all transactions to localStorage
  saveAllTransactions(transactions) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      return true;
    } catch (error) {
      console.error('Error saving transactions:', error);
      return false;
    }
  }

  // Get next transaction ID
  getNextTransactionId() {
    try {
      const counter = localStorage.getItem(this.counterKey);
      const nextId = counter ? parseInt(counter) + 1 : 1;
      localStorage.setItem(this.counterKey, nextId.toString());
      return `TXN_${nextId.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating transaction ID:', error);
      return `TXN_${Date.now()}`;
    }
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    try {
      const transactions = this.getAllTransactions();
      const transactionId = this.getNextTransactionId();
      
      const newTransaction = {
        id: transactionId,
        ...transactionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: TRANSACTION_STATUS.PURCHASE_REQUESTED,
        statusHistory: [{
          status: TRANSACTION_STATUS.PURCHASE_REQUESTED,
          timestamp: new Date().toISOString(),
          updatedBy: 'system'
        }]
      };

      transactions[transactionId] = newTransaction;
      this.saveAllTransactions(transactions);
      
      console.log('✅ Transaction created:', transactionId);
      return { id: transactionId, ...newTransaction };
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  // Get transaction by property ID
  async getTransactionByProperty(propertyId) {
    try {
      const transactions = this.getAllTransactions();
      const transaction = Object.values(transactions).find(
        tx => tx.propertyId === propertyId || tx.propertyId === propertyId.toString()
      );
      return transaction || null;
    } catch (error) {
      console.error('Error getting transaction by property:', error);
      return null;
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId, newStatus, updatedBy = 'system') {
    try {
      const transactions = this.getAllTransactions();
      const transaction = transactions[transactionId];
      
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      // Update status and add to history
      transaction.status = newStatus;
      transaction.updatedAt = new Date().toISOString();
      
      if (!transaction.statusHistory) {
        transaction.statusHistory = [];
      }
      
      transaction.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        updatedBy: updatedBy
      });

      transactions[transactionId] = transaction;
      this.saveAllTransactions(transactions);
      
      console.log(`✅ Transaction ${transactionId} status updated to ${newStatus}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error updating transaction status:', error);
      throw error;
    }
  }

  // Subscribe to transaction changes (simulated)
  subscribeToTransaction(transactionId, callback) {
    // Since localStorage doesn't support real-time updates,
    // we'll simulate this with periodic checks
    const checkForUpdates = () => {
      const transactions = this.getAllTransactions();
      const transaction = transactions[transactionId];
      if (transaction) {
        callback(transaction);
      }
    };

    // Initial call
    checkForUpdates();

    // Set up periodic checking (every 5 seconds)
    const intervalId = setInterval(checkForUpdates, 5000);

    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }

  // Get transactions for a specific address
  async getTransactionsByAddress(address) {
    try {
      const transactions = this.getAllTransactions();
      return Object.values(transactions).filter(tx => 
        tx.buyerAddress === address ||
        tx.sellerAddress === address ||
        tx.lenderAddress === address ||
        tx.inspectorAddress === address
      );
    } catch (error) {
      console.error('Error getting transactions by address:', error);
      return [];
    }
  }

  // Upload document (simulate - just return a local reference)
  async uploadDocument(file, path) {
    try {
      // Convert file to base64 for localStorage storage
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result;
          const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Store document in localStorage
          const documentKey = `blockNexus_Document_${documentId}`;
          localStorage.setItem(documentKey, JSON.stringify({
            id: documentId,
            data: base64Data,
            filename: file.name,
            type: file.type,
            size: file.size,
            uploadPath: path,
            uploadedAt: new Date().toISOString()
          }));
          
          resolve(documentId);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get document URL (retrieve from localStorage)
  async getDocumentURL(documentId) {
    try {
      const documentKey = `blockNexus_Document_${documentId}`;
      const documentData = localStorage.getItem(documentKey);
      
      if (documentData) {
        const doc = JSON.parse(documentData);
        return doc.data; // Return base64 data URL
      }
      
      throw new Error(`Document ${documentId} not found`);
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  }

  // Get transaction statistics
  getTransactionStats() {
    try {
      const transactions = this.getAllTransactions();
      const transactionList = Object.values(transactions);
      
      return {
        total: transactionList.length,
        completed: transactionList.filter(tx => tx.status === TRANSACTION_STATUS.COMPLETED).length,
        pending: transactionList.filter(tx => tx.status !== TRANSACTION_STATUS.COMPLETED && tx.status !== TRANSACTION_STATUS.CANCELLED).length,
        cancelled: transactionList.filter(tx => tx.status === TRANSACTION_STATUS.CANCELLED).length
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      return { total: 0, completed: 0, pending: 0, cancelled: 0 };
    }
  }

  // Clear all transaction data (for testing/reset)
  clearAllTransactions() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.counterKey);
      console.log('✅ All transaction data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing transaction data:', error);
      return false;
    }
  }
}

// Create singleton instance
const localTransactionService = new LocalTransactionService();

// Export the functions to match the original API
export const createTransaction = (data) => localTransactionService.createTransaction(data);
export const getTransactionByProperty = (propertyId) => localTransactionService.getTransactionByProperty(propertyId);
export const updateTransactionStatus = (id, status, updatedBy) => localTransactionService.updateTransactionStatus(id, status, updatedBy);
export const subscribeToTransaction = (id, callback) => localTransactionService.subscribeToTransaction(id, callback);
export const getTransactionsByAddress = (address) => localTransactionService.getTransactionsByAddress(address);
export const uploadDocument = (file, path) => localTransactionService.uploadDocument(file, path);
export const getDocumentURL = (documentId) => localTransactionService.getDocumentURL(documentId);

export default localTransactionService;