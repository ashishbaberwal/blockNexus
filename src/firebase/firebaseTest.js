// Firebase connection test utility
import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test writing a simple document
    const testDoc = doc(db, 'test', 'connection-test');
    const testData = {
      timestamp: new Date().toISOString(),
      test: true
    };
    
    await setDoc(testDoc, testData);
    console.log('✅ Firebase write test successful');
    
    // Test reading the document back
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firebase read test successful');
      return { success: true, message: 'Firebase connection working' };
    } else {
      throw new Error('Document not found after write');
    }
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testWalletConnection = async () => {
  try {
    console.log('👛 Testing wallet connection...');
    
    if (!window.ethereum) {
      throw new Error('No wallet extension found');
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts connected');
    }
    
    console.log('✅ Wallet connection successful');
    return { 
      success: true, 
      message: 'Wallet connected',
      account: accounts[0]
    };
  } catch (error) {
    console.error('❌ Wallet test failed:', error);
    return { success: false, error: error.message };
  }
};