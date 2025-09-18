// Emergency Firebase configuration test
// Run this in browser console to test Firebase directly

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAA4Li4OBFCQHVWr9DFVuKI_invdd1cKKM",
  authDomain: "blocknexus.firebaseapp.com",
  projectId: "blocknexus",
  storageBucket: "blocknexus.firebasestorage.app",
  messagingSenderId: "207748624783",
  appId: "1:207748624783:web:3f71324f73ac708cbf9bfa",
  measurementId: "G-4LJ4Z3WGWD"
};

console.log('Testing Firebase config...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key:', firebaseConfig.apiKey ? 'Present' : 'Missing');

// Test if we can initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  console.log('✓ Firebase app initialized successfully');
  
  const db = getFirestore(app);
  console.log('✓ Firestore initialized successfully');
  
  // Check if we're accidentally connecting to emulator
  if (window.location.hostname === 'localhost') {
    console.log('⚠️ Running on localhost - check if Firestore emulator is running');
  }
  
} catch (error) {
  console.error('✗ Firebase initialization failed:', error);
}

export const testConfig = firebaseConfig;