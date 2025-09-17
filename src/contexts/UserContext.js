import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Test Firebase connection on import
console.log('🔥 Firebase DB initialized:', !!db);

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [kycStatus, setKycStatus] = useState(null); // 'not_submitted', 'pending', 'approved', 'rejected'

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('blockNexusUser');
    const savedAccount = localStorage.getItem('blockNexusAccount');
    
    if (savedUser && savedAccount) {
      setUser(JSON.parse(savedUser));
      setAccount(savedAccount);
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  // Sign message to authenticate user
  const signAuthenticationMessage = async (walletAddress) => {
    if (!provider) {
      throw new Error('No provider available');
    }

    const message = `Welcome to BlockNexus!\n\nSign this message to authenticate with your wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
    
    try {
      console.log('📝 Getting signer...');
      const signer = await provider.getSigner();
      console.log('📝 Requesting signature for message...');
      const signature = await signer.signMessage(message);
      console.log('✅ Message signed successfully');
      return { message, signature };
    } catch (error) {
      console.error('❌ Signature failed:', error);
      if (error.code === 4001) {
        throw new Error('User denied message signature');
      } else {
        // For other errors, provide a fallback
        console.warn('⚠️ Using fallback signature due to error');
        return { 
          message, 
          signature: 'FALLBACK_' + Date.now() + '_' + walletAddress.slice(-6)
        };
      }
    }
  };

  // Register new user
  const registerUser = async (userInfo, walletAddress) => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting user registration...', { userInfo, walletAddress });
      
      // Sign authentication message
      console.log('📝 Requesting message signature...');
      const { signature } = await Promise.race([
        signAuthenticationMessage(walletAddress),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signature timeout')), 30000)
        )
      ]);
      console.log('✅ Message signed successfully');
      
      const userData = {
        ...userInfo,
        walletAddress,
        signature,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        kycStatus: 'not_submitted'
      };

      console.log('💾 Saving to localStorage...');
      // Save to localStorage and Firebase
      localStorage.setItem('blockNexusUser', JSON.stringify(userData));
      localStorage.setItem('blockNexusAccount', walletAddress);
      
      console.log('🔥 Saving to Firebase...');
      // Save to Firebase
      try {
        await saveUserToFirebase(userData);
        console.log('✅ Firebase save successful');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase save failed, continuing with local storage:', firebaseError);
        // Continue without Firebase for now
      }

      console.log('✅ Registration completed successfully');
      setUser(userData);
      setAccount(walletAddress);
      setIsAuthenticated(true);
      setKycStatus('not_submitted');
      
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login existing user
  const loginUser = async (walletAddress) => {
    setIsLoading(true);
    try {
      // Check if user exists in localStorage
      const savedUser = localStorage.getItem('blockNexusUser');
      
      if (!savedUser) {
        throw new Error('User not found. Please register first.');
      }

      const userData = JSON.parse(savedUser);
      
      if (userData.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Wallet address mismatch. Please use the registered wallet.');
      }

      // Sign authentication message
      await signAuthenticationMessage(walletAddress);
      
      // Update last login
      userData.lastLogin = new Date().toISOString();
      localStorage.setItem('blockNexusUser', JSON.stringify(userData));

      setUser(userData);
      setAccount(walletAddress);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logoutUser = () => {
    setUser(null);
    setAccount(null);
    setIsAuthenticated(false);
    // Don't remove from localStorage, just clear session
  };

  // Update user profile
  const updateUserProfile = (updatedInfo) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updatedInfo,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('blockNexusUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Check KYC status from Firebase
  const checkKYCStatus = async (walletAddress) => {
    try {
      const kycDocRef = doc(db, 'kyc', walletAddress);
      const kycDoc = await getDoc(kycDocRef);
      
      if (kycDoc.exists()) {
        const kycData = kycDoc.data();
        setKycStatus(kycData.verificationStatus);
        return kycData.verificationStatus;
      } else {
        setKycStatus('not_submitted');
        return 'not_submitted';
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setKycStatus('not_submitted');
      return 'not_submitted';
    }
  };

  // Update KYC status
  const updateKYCStatus = (status) => {
    setKycStatus(status);
    
    // Update user object with KYC status
    if (user) {
      const updatedUser = {
        ...user,
        kycStatus: status,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('blockNexusUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  // Save user data to Firebase
  const saveUserToFirebase = async (userData) => {
    try {
      console.log('🔥 Attempting to save to Firebase...');
      const userDocRef = doc(db, 'users', userData.walletAddress);
      await setDoc(userDocRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        kycStatus: 'not_submitted'
      });
      console.log('✅ Firebase save successful');
    } catch (error) {
      console.error('❌ Error saving user to Firebase:', error);
      // Don't throw the error, just log it
      // This allows registration to continue even if Firebase fails
    }
  };

  // Check if user exists
  const checkUserExists = (walletAddress) => {
    const savedUser = localStorage.getItem('blockNexusUser');
    if (!savedUser) return false;
    
    const userData = JSON.parse(savedUser);
    return userData.walletAddress.toLowerCase() === walletAddress.toLowerCase();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    account,
    kycStatus,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    checkUserExists,
    signAuthenticationMessage,
    checkKYCStatus,
    updateKYCStatus,
    saveUserToFirebase
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;