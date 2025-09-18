// Firebase Connection Test
// This file helps verify that Firebase is properly configured

import { db, storage, auth, analytics } from '../firebase/config';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Test Firebase Connection with actual writes
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
    
    // Test actual Firestore write with better error handling
    console.log('📝 Testing Firestore write...');
    try {
      const testData = {
        message: 'Firebase connection test',
        timestamp: new Date(),
        testType: 'connection_verification'
      };
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      console.log('✅ Firestore write successful! Document ID:', docRef.id);
      
      // Test Firebase Storage upload
      console.log('📤 Testing Storage upload...');
      const testFile = new Blob(['Hello Firebase Storage! Test file created at ' + new Date()], { type: 'text/plain' });
      const storageRef = ref(storage, `test/connection-test-${Date.now()}.txt`);
      const snapshot = await uploadBytes(storageRef, testFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Storage upload successful! Download URL:', downloadURL);
      
      console.log('🎉 Firebase connection test completed successfully!');
      return { success: true, firestoreDocId: docRef.id, storageUrl: downloadURL };
      
    } catch (writeError) {
      console.error('❌ Firebase write operation failed:', writeError);
      
      // Provide specific guidance based on error type
      if (writeError.code === 'permission-denied') {
        console.log('🔧 SOLUTION: Update your Firestore security rules to allow writes');
        console.log('🔧 Go to Firebase Console > Firestore Database > Rules');
        console.log('🔧 Set rules to: allow read, write: if true; (for testing)');
        console.log('🔧 Direct link: https://console.firebase.google.com/project/blocknexus/firestore/rules');
        return { 
          success: false, 
          error: 'Permission denied - Firestore security rules blocking writes',
          solution: 'Update Firestore security rules to allow writes',
          helpUrl: 'https://console.firebase.google.com/project/blocknexus/firestore/rules'
        };
      } else if (writeError.code === 'unavailable') {
        console.log('🔧 SOLUTION: Check your internet connection and Firebase project status');
        return { 
          success: false, 
          error: 'Firebase service unavailable - check connection',
          solution: 'Check internet connection and Firebase status'
        };
      } else if (writeError.message && writeError.message.includes('400')) {
        console.log('🔧 SOLUTION: Firebase 400 error - likely security rules issue');
        console.log('🔧 This typically means Firestore rules are denying write access');
        console.log('🔧 Update your Firestore rules: https://console.firebase.google.com/project/blocknexus/firestore/rules');
        return { 
          success: false, 
          error: 'HTTP 400 Bad Request - Security rules blocking access',
          solution: 'Update Firestore security rules to allow writes',
          helpUrl: 'https://console.firebase.google.com/project/blocknexus/firestore/rules'
        };
      }
      
      return { 
        success: false, 
        error: writeError.message,
        code: writeError.code,
        solution: 'Check console logs for specific error details'
      };
    }
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test user registration flow
export const testUserRegistration = async (walletAddress = '0xTEST123456789') => {
  try {
    console.log('👤 Testing user registration...');
    const userData = {
      walletAddress,
      fullName: 'Test User',
      email: 'test@blocknexus.com',
      phone: '+1234567890',
      registrationDate: new Date().toISOString(),
      kycStatus: 'not_submitted',
      testUser: true
    };
    
    const userDocRef = doc(db, 'users', walletAddress);
    await setDoc(userDocRef, userData);
    console.log('✅ Test user registered successfully');
    return { success: true, walletAddress };
  } catch (error) {
    console.error('❌ User registration test failed:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in components
export default testFirebaseConnection;