import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [testResults, setTestResults] = useState([]);

  const runTests = async () => {
    const results = [];
    
    try {
      // Test 1: Basic connection
      results.push({ test: 'Firebase Init', status: 'PASS', message: 'Firebase initialized successfully' });
      
      // Test 2: Try to read from a collection
      setStatus('Testing read access...');
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      results.push({ test: 'Read Access', status: 'PASS', message: `Read ${snapshot.size} documents` });
      
      // Test 3: Try to write a simple document
      setStatus('Testing write access...');
      const testDocRef = doc(db, 'test', 'connectivity-test');
      await setDoc(testDocRef, {
        timestamp: new Date(),
        message: 'Connectivity test successful',
        source: 'Firebase Test Component'
      });
      results.push({ test: 'Write Access', status: 'PASS', message: 'Document written successfully' });
      
      setStatus('All tests completed successfully!');
      
    } catch (error) {
      console.error('Firebase test error:', error);
      results.push({ 
        test: 'Firebase Error', 
        status: 'FAIL', 
        message: `Error: ${error.code || 'Unknown'} - ${error.message || error.toString()}` 
      });
      setStatus('Tests failed - check console for details');
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #333', 
      padding: '20px', 
      zIndex: 9999,
      borderRadius: '8px',
      minWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h3>Firebase Connectivity Test</h3>
      <p><strong>Status:</strong> {status}</p>
      
      {testResults.length > 0 && (
        <div>
          <h4>Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              margin: '5px 0', 
              padding: '5px',
              backgroundColor: result.status === 'PASS' ? '#d4edda' : '#f8d7da',
              borderRadius: '4px'
            }}>
              <strong>{result.test}:</strong> 
              <span style={{ color: result.status === 'PASS' ? 'green' : 'red' }}>
                {result.status}
              </span>
              <br />
              <small>{result.message}</small>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={runTests}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Re-run Tests
      </button>
    </div>
  );
};

export default FirebaseTest;