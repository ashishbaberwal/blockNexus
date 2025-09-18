import React, { useState } from 'react';
import { testFirebaseConnection, testUserRegistration } from '../utils/firebaseTest';

const FirebaseTestPanel = ({ inSettings = false }) => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const result = await testFirebaseConnection();
      setTestResult(result);
      
      // Auto-clear result after 15 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 15000);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      // Auto-clear error after 15 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 15000);
    } finally {
      setIsLoading(false);
    }
  };

  const runUserTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const result = await testUserRegistration();
      setTestResult(result);
      
      // Auto-clear result after 15 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 15000);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      // Auto-clear error after 15 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 15000);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setTestResult(null);
  };

  return (
    <div style={{ 
      position: inSettings ? 'static' : 'fixed', 
      top: inSettings ? 'auto' : '10px', 
      right: inSettings ? 'auto' : '10px', 
      background: 'var(--clr-white)', 
      padding: inSettings ? '15px' : '20px', 
      border: inSettings ? '1px solid var(--clr-grey-light)' : '2px solid var(--clr-orange)', 
      borderRadius: '10px',
      zIndex: inSettings ? 'auto' : 9999,
      minWidth: inSettings ? 'auto' : '300px',
      maxWidth: inSettings ? 'none' : '450px',
      color: 'var(--clr-black)',
      boxShadow: inSettings ? 'none' : 'var(--glass-shadow)',
      marginTop: inSettings ? '10px' : '0'
    }}>
      <h3 style={{ color: 'var(--clr-orange)', marginBottom: '15px' }}>🔥 Firebase Test Panel</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={runConnectionTest}
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            marginRight: '10px',
            backgroundColor: 'var(--clr-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Testing...' : '🔍 Test Connection'}
        </button>

        <button 
          onClick={runUserTest}
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: 'var(--clr-orange-light)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳ Testing...' : '👤 Test User Reg'}
        </button>
      </div>

      {testResult && (
        <div style={{
          padding: '12px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          fontSize: '14px',
          position: 'relative',
          marginBottom: '10px',
          color: testResult.success ? '#155724' : '#721c24'
        }}>
          <button
            onClick={clearResult}
            style={{
              position: 'absolute',
              top: '5px',
              right: '8px',
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              width: '20px',
              height: '20px',
              color: testResult.success ? '#155724' : '#721c24'
            }}
            title="Clear result"
          >
            ×
          </button>
          
          <strong>{testResult.success ? '✅ Success' : '❌ Failed'}</strong>
          <br />
          {testResult.success ? (
            <div style={{ marginTop: '8px' }}>
              {testResult.firestoreDocId && <div>📄 Firestore Doc: {testResult.firestoreDocId}</div>}
              {testResult.storageUrl && <div>🗂️ Storage: <a href={testResult.storageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>View File</a></div>}
              {testResult.walletAddress && <div>👤 User: {testResult.walletAddress}</div>}
            </div>
          ) : (
            <div style={{ marginTop: '8px' }}>
              <div>❌ Error: {testResult.error}</div>
              {testResult.solution && (
                <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
                  💡 Solution: {testResult.solution}
                </div>
              )}
              {testResult.helpUrl && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  🔗 <a href={testResult.helpUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Open Firebase Console
                  </a>
                </div>
              )}
              {testResult.code && (
                <div style={{ marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                  Code: {testResult.code}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: 'var(--clr-grey)', borderTop: '1px solid var(--clr-grey-light)', paddingTop: '8px' }}>
        💡 Open browser console (F12) for detailed logs<br/>
        🕒 Results auto-clear after 15 seconds
      </div>
    </div>
  );
};

export default FirebaseTestPanel;