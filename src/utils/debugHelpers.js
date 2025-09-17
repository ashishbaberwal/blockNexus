// Debug utility for testing wallet and Firebase connections
export const debugConnections = async () => {
  console.log('🔍 Running connection diagnostics...');
  
  // Test 1: Check if MetaMask is available
  if (typeof window.ethereum === 'undefined') {
    console.error('❌ MetaMask not detected');
    return false;
  }
  console.log('✅ MetaMask detected');
  
  // Test 2: Check wallet connection
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.warn('⚠️ No wallet accounts connected');
    } else {
      console.log('✅ Wallet connected:', accounts[0]);
    }
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    return false;
  }
  
  // Test 3: Check Firebase connection
  try {
    const { db } = await import('../firebase/config');
    if (db) {
      console.log('✅ Firebase connected');
    } else {
      console.error('❌ Firebase not initialized');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    return false;
  }
  
  console.log('🎉 All connections working!');
  return true;
};

// Test message signing
export const testMessageSigning = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not available');
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    
    const message = 'Test message for BlockNexus';
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, account]
    });
    
    console.log('✅ Message signing test successful');
    return { success: true, signature };
  } catch (error) {
    console.error('❌ Message signing test failed:', error);
    return { success: false, error: error.message };
  }
};

const debugUtils = { debugConnections, testMessageSigning };
export default debugUtils;