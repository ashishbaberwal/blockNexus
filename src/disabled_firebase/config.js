import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA4Li4OBFCQHVWr9DFVuKI_invdd1cKKM",
  authDomain: "blocknexus.firebaseapp.com",
  projectId: "blocknexus",
  storageBucket: "blocknexus.firebasestorage.app",
  messagingSenderId: "207748624783",
  appId: "1:207748624783:web:3f71324f73ac708cbf9bfa",
  measurementId: "G-4LJ4Z3WGWD"
};

// Initialize Firebase
let app;
let db;
let storage;
let auth;
let analytics;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('✓ Firebase app initialized');

  // Initialize Firestore with detailed error handling
  db = getFirestore(app);
  console.log('✓ Firestore initialized');

  // Initialize other services
  storage = getStorage(app);
  auth = getAuth(app);
  
  // Only initialize analytics in production (not localhost)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    try {
      analytics = getAnalytics(app);
      console.log('✓ Analytics initialized');
    } catch (analyticsError) {
      console.warn('Analytics initialization failed:', analyticsError);
    }
  }

  console.log('✓ All Firebase services initialized successfully');

} catch (error) {
  console.error('✗ Firebase initialization failed:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
}

export { db, storage, auth, analytics };
export default app;