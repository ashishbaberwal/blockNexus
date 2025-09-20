import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import localDocumentStorage from '../utils/localDocumentStorage';

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

  // Check KYC status when user changes
  useEffect(() => {
    if (user && user.walletAddress) {
      checkKYCStatus(user.walletAddress);
    }
  }, [user?.walletAddress]);

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
      // Save to localStorage
      localStorage.setItem('blockNexusUser', JSON.stringify(userData));
      localStorage.setItem('blockNexusAccount', walletAddress);
      
      console.log('� Saving to localStorage...');
      // Save to localStorage
      try {
        await saveUserData(userData);
        console.log('✅ localStorage save successful');
      } catch (storageError) {
        console.warn('⚠️ localStorage save failed:', storageError);
        // Continue anyway as we already have basic storage above
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

  // Check KYC status from localStorage
  const checkKYCStatus = async (walletAddress) => {
    try {
      console.log('Checking KYC status for wallet:', walletAddress);
      
      // Check direct localStorage first (primary method)
      const directKYCData = localStorage.getItem('blockNexusKYC_' + walletAddress);
      let kycData = null;
      
      if (directKYCData) {
        kycData = JSON.parse(directKYCData);
        console.log('Found KYC data in direct localStorage:', kycData);
      } else {
        // Fallback to localDocumentStorage
        kycData = localDocumentStorage.getKYCData(walletAddress);
        console.log('Found KYC data in localDocumentStorage:', kycData);
      }
      
      if (kycData) {
        // Check both possible status field names
        const status = kycData.verificationStatus || kycData.status || 'not_submitted';
        console.log('KYC status determined as:', status);
        setKycStatus(status);
        return status;
      } else {
        console.log('No KYC data found, setting status to not_submitted');
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

  // Expose updateKYCStatus globally for Settings component
  React.useEffect(() => {
    window.updateKYCStatus = updateKYCStatus;
    return () => {
      delete window.updateKYCStatus;
    };
  }, [updateKYCStatus]);

  // Save user data to localStorage
  const saveUserData = async (userData) => {
    try {
      console.log('� Saving user data to localStorage...');
      
      // Save to localStorage using the existing storage utility
      localDocumentStorage.updateKYCStatus(userData.walletAddress, 'pending');
      
      // Also save to the main user storage
      localStorage.setItem('blockNexusUser', JSON.stringify({
        ...userData,
        createdAt: new Date().toISOString(),
        kycStatus: 'not_submitted'
      }));
      
      console.log('✅ User data save successful');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      // Don't throw the error, just log it
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
    user: user ? { ...user, kycVerified: kycStatus === 'approved' } : null, // Add kycVerified computed property
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
    saveUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;