import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

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

// Create a new property transaction
export const createTransaction = async (transactionData) => {
  try {
    const transaction = {
      ...transactionData,
      status: TRANSACTION_STATUS.PURCHASE_REQUESTED,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      progress: {
        purchaseRequested: { completed: true, timestamp: serverTimestamp() },
        lenderApproved: { completed: false, timestamp: null },
        underInspection: { completed: false, timestamp: null },
        inspectorApproved: { completed: false, timestamp: null },
        sellerApproved: { completed: false, timestamp: null },
        transactionCompleted: { completed: false, timestamp: null }
      }
    };

    const docRef = await addDoc(collection(db, 'transactions'), transaction);
    return { success: true, transactionId: docRef.id };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
};

// Update transaction status and progress
export const updateTransactionStatus = async (transactionId, newStatus, updaterRole) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const currentData = transactionDoc.data();
    const updatedProgress = { ...currentData.progress };

    // Update progress based on status
    switch (newStatus) {
      case TRANSACTION_STATUS.LENDER_APPROVED:
        updatedProgress.lenderApproved = { completed: true, timestamp: serverTimestamp() };
        break;
      case TRANSACTION_STATUS.UNDER_INSPECTION:
        updatedProgress.underInspection = { completed: true, timestamp: serverTimestamp() };
        break;
      case TRANSACTION_STATUS.INSPECTOR_APPROVED:
        updatedProgress.inspectorApproved = { completed: true, timestamp: serverTimestamp() };
        break;
      case TRANSACTION_STATUS.SELLER_APPROVED:
        updatedProgress.sellerApproved = { completed: true, timestamp: serverTimestamp() };
        break;
      case TRANSACTION_STATUS.COMPLETED:
        updatedProgress.transactionCompleted = { completed: true, timestamp: serverTimestamp() };
        break;
    }

    await updateDoc(transactionRef, {
      status: newStatus,
      progress: updatedProgress,
      updatedAt: serverTimestamp(),
      [`lastUpdatedBy`]: updaterRole
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return { success: false, error: error.message };
  }
};

// Get transaction by property ID
export const getTransactionByProperty = async (propertyId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, transaction: null };
    }

    const latestTransaction = querySnapshot.docs[0];
    return { 
      success: true, 
      transaction: { 
        id: latestTransaction.id, 
        ...latestTransaction.data() 
      } 
    };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return { success: false, error: error.message };
  }
};

// Get all transactions for a user (by wallet address)
export const getUserTransactions = async (walletAddress) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('participants', 'array-contains', walletAddress),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, transactions };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for transaction updates
export const subscribeToTransaction = (transactionId, callback) => {
  const transactionRef = doc(db, 'transactions', transactionId);
  
  return onSnapshot(transactionRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to transaction updates:', error);
    callback(null);
  });
};

// Upload KYC document for transaction verification
export const uploadTransactionKYC = async (transactionId, file, documentType, userRole) => {
  try {
    const fileName = `transactions/${transactionId}/kyc/${userRole}_${documentType}_${Date.now()}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update transaction with document URL
    const transactionRef = doc(db, 'transactions', transactionId);
    const updateData = {};
    updateData[`kycDocuments.${userRole}.${documentType}`] = {
      url: downloadURL,
      uploadedAt: serverTimestamp(),
      verified: false
    };
    
    await updateDoc(transactionRef, updateData);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading transaction KYC:', error);
    return { success: false, error: error.message };
  }
};

// Generate e-stamp paper data
export const generateEStampPaper = async (transactionId) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }

    const transactionData = transactionDoc.data();
    
    // Get buyer and seller KYC data
    const buyerDoc = await getDoc(doc(db, 'users', transactionData.buyerAddress));
    const sellerDoc = await getDoc(doc(db, 'users', transactionData.sellerAddress));
    
    const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};
    const sellerData = sellerDoc.exists() ? sellerDoc.data() : {};

    const eStampData = {
      transactionId,
      propertyId: transactionData.propertyId,
      salePrice: transactionData.salePrice,
      currency: transactionData.currency || 'ETH',
      
      // Buyer details
      buyer: {
        name: buyerData.fullName || 'Buyer Name',
        address: buyerData.address || 'Buyer Address',
        walletAddress: transactionData.buyerAddress,
        aadharNumber: buyerData.aadharNumber || 'XXXX-XXXX-XXXX',
        panNumber: buyerData.panNumber || 'XXXXXXXXXX'
      },
      
      // Seller details
      seller: {
        name: sellerData.fullName || 'Seller Name',
        address: sellerData.address || 'Seller Address',
        walletAddress: transactionData.sellerAddress,
        aadharNumber: sellerData.aadharNumber || 'XXXX-XXXX-XXXX',
        panNumber: sellerData.panNumber || 'XXXXXXXXXX'
      },
      
      // Property details
      property: transactionData.propertyDetails || {},
      
      // Legal details
      stampDuty: calculateStampDuty(transactionData.salePrice),
      registrationFee: calculateRegistrationFee(transactionData.salePrice),
      generatedAt: serverTimestamp()
    };

    // Save e-stamp data to transaction
    await updateDoc(transactionRef, {
      eStampPaper: eStampData,
      updatedAt: serverTimestamp()
    });

    return { success: true, eStampData };
  } catch (error) {
    console.error('Error generating e-stamp paper:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions for stamp duty calculation
const calculateStampDuty = (salePrice) => {
  // Basic calculation - 5% of sale price (can be customized)
  return salePrice * 0.05;
};

const calculateRegistrationFee = (salePrice) => {
  // Basic calculation - 1% of sale price (can be customized)
  return salePrice * 0.01;
};

// Add notification to user
export const addNotification = async (walletAddress, notification) => {
  try {
    const notificationData = {
      ...notification,
      timestamp: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), {
      userAddress: walletAddress,
      ...notificationData
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { success: false, error: error.message };
  }
};

// Get user notifications
export const getUserNotifications = async (walletAddress) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userAddress', '==', walletAddress),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};