// IndexedDB Transaction Service
// Replaces Firebase Firestore with IndexedDB for transaction management

import indexedDBService from './indexedDBService';

class LocalTransactionService {
  constructor() {
    this.storageKey = 'blockNexus_Transactions'; // Keep for backward compatibility
  }

  // Generate unique transaction ID
  generateTransactionId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get all transactions from IndexedDB
  async getAllTransactions() {
    try {
      return await indexedDBService.getAll('transactions');
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Save transaction to IndexedDB
  async saveTransaction(transaction) {
    try {
      await indexedDBService.put('transactions', transaction);
      return transaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  // Get transaction by ID
  async getTransactionById(id) {
    try {
      return await indexedDBService.get('transactions', id);
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return null;
    }
  }

  // Get transactions by property ID
  async getTransactionsByProperty(propertyId) {
    try {
      return await indexedDBService.getByIndex('transactions', 'propertyId', propertyId);
    } catch (error) {
      console.error('Error getting transactions by property:', error);
      return [];
    }
  }

  // Get transactions by user address
  async getTransactionsByUser(userAddress) {
    try {
      const allTransactions = await this.getAllTransactions();
      return allTransactions.filter(t => 
        t.buyerAddress === userAddress ||
        t.sellerAddress === userAddress ||
        t.lenderAddress === userAddress ||
        t.inspectorAddress === userAddress
      );
    } catch (error) {
      console.error('Error getting transactions by user:', error);
      return [];
    }
  }

  // Update transaction status
  async updateTransactionStatus(id, status, updatedBy) {
    try {
      const transaction = await this.getTransactionById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      transaction.status = status;
      transaction.lastUpdated = new Date().toISOString();
      transaction.updatedBy = updatedBy;

      // Add status history
      if (!transaction.statusHistory) {
        transaction.statusHistory = [];
      }
      
      transaction.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        updatedBy
      });

      return await this.saveTransaction(transaction);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }
}

const localTransactionService = new LocalTransactionService();

// Export functions that match the Firebase API for easy replacement
export const createTransaction = async (transactionData) => {
  try {
    const transaction = {
      id: localTransactionService.generateTransactionId(),
      ...transactionData,
      createdAt: new Date().toISOString(),
      status: transactionData.status || 'purchase_requested',
      statusHistory: [{
        status: transactionData.status || 'purchase_requested',
        timestamp: new Date().toISOString(),
        updatedBy: transactionData.buyerAddress
      }]
    };
    
    return await localTransactionService.saveTransaction(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const getTransactionByProperty = async (propertyId) => {
  try {
    const transactions = await localTransactionService.getTransactionsByProperty(propertyId);
    return transactions.length > 0 ? transactions[0] : null;
  } catch (error) {
    console.error('Error getting transaction by property:', error);
    return null;
  }
};

export const updateTransactionStatus = async (transactionId, status, updatedBy) => {
  try {
    return await localTransactionService.updateTransactionStatus(transactionId, status, updatedBy);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

export const subscribeToTransaction = (transactionId, callback) => {
  // Since we're using localStorage, we'll simulate subscription with polling
  let lastTransaction = null;
  
  const checkForUpdates = () => {
    const currentTransaction = localTransactionService.getTransactionById(transactionId);
    
    if (currentTransaction && JSON.stringify(currentTransaction) !== JSON.stringify(lastTransaction)) {
      lastTransaction = currentTransaction;
      callback(currentTransaction);
    }
  };

  // Initial call
  checkForUpdates();
  
  // Poll for changes every 2 seconds
  const interval = setInterval(checkForUpdates, 2000);
  
  // Return unsubscribe function
  return () => clearInterval(interval);
};

export const getTransactionsByUser = async (userAddress) => {
  try {
    return localTransactionService.getTransactionsByUser(userAddress);
  } catch (error) {
    console.error('Error getting transactions by user:', error);
    return [];
  }
};

export const getAllTransactions = async () => {
  try {
    return localTransactionService.getAllTransactions();
  } catch (error) {
    console.error('Error getting all transactions:', error);
    return [];
  }
};

// Additional utility functions
export const getTransactionStats = () => {
  try {
    const transactions = localTransactionService.getAllTransactions();
    
    return {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
      cancelled: transactions.filter(t => t.status === 'cancelled').length
    };
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    return { total: 0, completed: 0, pending: 0, cancelled: 0 };
  }
};

export const clearAllTransactions = () => {
  try {
    localStorage.removeItem(localTransactionService.storageKey);
    return true;
  } catch (error) {
    console.error('Error clearing transactions:', error);
    return false;
  }
};

// Additional functions for compatibility with other components

export const generateEStampPaper = async (transactionData) => {
  try {
    // Generate e-stamp paper data
    return {
      stampNumber: `ESTAMP-${Date.now()}`,
      stampValue: '₹100',
      generatedAt: new Date().toISOString(),
      transactionId: transactionData.id,
      buyerName: transactionData.buyerName || 'Buyer',
      sellerName: transactionData.sellerName || 'Seller',
      propertyDetails: transactionData.propertyDetails || 'Property',
      amount: transactionData.amount || '0 ETH'
    };
  } catch (error) {
    console.error('Error generating e-stamp paper:', error);
    throw error;
  }
};

export const getUserNotifications = async (userAddress) => {
  try {
    return await indexedDBService.getByIndex('notifications', 'userAddress', userAddress);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

export const addNotification = async (notification) => {
  try {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    await indexedDBService.put('notifications', newNotification);
    return newNotification.id;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Migration function to move notifications from localStorage to IndexedDB
export const migrateNotificationsToIndexedDB = async () => {
  try {
    const localStorageNotifications = localStorage.getItem('blockNexus_Notifications');
    if (localStorageNotifications) {
      const notifications = JSON.parse(localStorageNotifications);
      console.log(`Migrating ${notifications.length} notifications to IndexedDB...`);
      
      for (const notification of notifications) {
        await indexedDBService.put('notifications', notification);
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem('blockNexus_Notifications');
      console.log('Notifications migrated successfully and localStorage cleared');
    }
  } catch (error) {
    console.error('Error migrating notifications:', error);
  }
};

// Clean up localStorage notifications to prevent quota errors
export const cleanupNotificationsStorage = () => {
  try {
    // Remove notifications from localStorage to free up space
    localStorage.removeItem('blockNexus_Notifications');
    console.log('Cleaned up notifications from localStorage');
  } catch (error) {
    console.error('Error cleaning up notifications storage:', error);
  }
};

export default localTransactionService;