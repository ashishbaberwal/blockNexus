// Wallet-based Role Assignment Configuration
// This file defines how roles are assigned based on wallet selection

export const roleAssignmentConfig = {
  // Available roles from the smart contract deployment
  availableRoles: ['buyer', 'seller', 'inspector', 'lender'],
  
  // Default role for unknown wallets
  defaultRole: 'buyer',
  
  // Enable/disable automatic assignment
  enabled: true
};

// Function to get role for a wallet address
export const getAutoAssignedRole = (walletAddress) => {
  if (!roleAssignmentConfig.enabled) {
    return roleAssignmentConfig.defaultRole;
  }
  
  // Check if there's a saved role for this wallet
  const savedRole = getWalletRole(walletAddress);
  if (savedRole) {
    return savedRole;
  }
  
  // Return default role if no saved role
  return roleAssignmentConfig.defaultRole;
};

// Function to get all possible roles
export const getAllRoles = () => {
  return roleAssignmentConfig.availableRoles;
};

// Function to get role description
export const getRoleDescription = (role) => {
  const descriptions = {
    buyer: 'Can view and purchase properties',
    seller: 'Can list and manage properties for sale',
    inspector: 'Can verify and approve properties',
    lender: 'Can provide financing for property transactions'
  };
  
  return descriptions[role] || 'Custom role';
};

// Function to save role for a specific wallet
export const saveWalletRole = (walletAddress, role) => {
  try {
    const walletRoles = JSON.parse(localStorage.getItem('blockNexus_wallet_roles') || '{}');
    walletRoles[walletAddress.toLowerCase()] = role;
    localStorage.setItem('blockNexus_wallet_roles', JSON.stringify(walletRoles));
    console.log('💾 Saved role for wallet:', walletAddress, '->', role);
  } catch (error) {
    console.error('Error saving wallet role:', error);
  }
};

// Function to get role for a specific wallet
export const getWalletRole = (walletAddress) => {
  try {
    const walletRoles = JSON.parse(localStorage.getItem('blockNexus_wallet_roles') || '{}');
    return walletRoles[walletAddress.toLowerCase()] || null;
  } catch (error) {
    console.error('Error getting wallet role:', error);
    return null;
  }
};

// Function to remove role for a specific wallet
export const removeWalletRole = (walletAddress) => {
  try {
    const walletRoles = JSON.parse(localStorage.getItem('blockNexus_wallet_roles') || '{}');
    delete walletRoles[walletAddress.toLowerCase()];
    localStorage.setItem('blockNexus_wallet_roles', JSON.stringify(walletRoles));
    console.log('🗑️ Removed role for wallet:', walletAddress);
  } catch (error) {
    console.error('Error removing wallet role:', error);
  }
};
