import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;