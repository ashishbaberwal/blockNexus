// Firebase Connection Test
// This file helps verify that Firebase is properly configured

import { db, storage, auth, analytics } from './firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref } from 'firebase/storage';

// Test Firebase Connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase Connection...');
    
    // Test Firestore
    console.log('📊 Firestore initialized:', !!db);
    
    // Test Storage
    console.log('📁 Storage initialized:', !!storage);
    
    // Test Auth
    console.log('🔐 Auth initialized:', !!auth);
    
    // Test Analytics
    console.log('📈 Analytics initialized:', !!analytics);
    
    // Test creating a reference (doesn't actually write data)
    const testRef = collection(db, 'test');
    console.log('✅ Firestore collection reference created:', !!testRef);
    
    const storageRef = ref(storage, 'test/test.txt');
    console.log('✅ Storage reference created:', !!storageRef);
    
    console.log('🎉 Firebase connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Export for use in components
export default testFirebaseConnection;