// Test utility to create inspector accounts for testing
export const createTestInspectorAccount = (walletAddress) => {
  const testInspectorData = {
    firstName: 'Test',
    lastName: 'Inspector',
    email: 'inspector@test.com',
    phone: '+1234567890',
    userType: 'inspector',
    role: 'inspector',
    walletAddress: walletAddress,
    signature: 'TEST_SIGNATURE_' + Date.now(),
    registrationDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    kycStatus: 'not_submitted'
  };

  // Save to localStorage
  localStorage.setItem('blockNexusUser', JSON.stringify(testInspectorData));
  localStorage.setItem('blockNexusAccount', walletAddress);
  
  console.log('✅ Test inspector account created for wallet:', walletAddress);
  console.log('📋 Inspector data:', testInspectorData);
  
  return testInspectorData;
};

export const clearTestData = () => {
  localStorage.removeItem('blockNexusUser');
  localStorage.removeItem('blockNexusAccount');
  console.log('🗑️ Test data cleared');
};

export const getCurrentUserData = () => {
  const userData = localStorage.getItem('blockNexusUser');
  return userData ? JSON.parse(userData) : null;
};
