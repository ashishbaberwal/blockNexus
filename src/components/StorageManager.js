import React, { useState, useEffect } from 'react';
import { propertyStorage } from '../services/propertyStorage';

const StorageManager = ({ onClose }) => {
  const [storageStats, setStorageStats] = useState(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const stats = await propertyStorage.getStorageStats();
      const health = await propertyStorage.checkStorageHealth();
      setStorageStats({ ...stats, health });
    } catch (error) {
      console.error('Error loading storage stats:', error);
      setStorageStats({
        totalProperties: 0,
        storageSizeMB: 0,
        quotaMB: 0,
        storageUsagePercent: 0,
        health: { status: 'error', message: 'Unable to load storage stats' }
      });
    }
  };

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const success = await propertyStorage.cleanupStorage();
      if (success) {
        alert('Storage cleaned up successfully! Image data from older properties has been removed.');
        loadStorageStats();
      } else {
        alert('Failed to clean up storage. Please try clearing browser data manually.');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Error during cleanup. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL properties? This cannot be undone.')) {
      try {
        const success = await propertyStorage.clearAllProperties();
        if (success) {
          alert('All properties have been deleted.');
          loadStorageStats();
        } else {
          alert('Failed to clear properties.');
        }
      } catch (error) {
        console.error('Error clearing properties:', error);
        alert('Failed to clear properties.');
      }
    }
  };

  if (!storageStats) {
    return <div>Loading storage information...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="storage-manager-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="storage-manager" style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Storage Management</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <div className="storage-stats" style={{ marginBottom: '20px' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            borderLeft: `4px solid ${getStatusColor(storageStats.health.status)}`
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: getStatusColor(storageStats.health.status) }}>
              Storage Status: {storageStats.health.status.toUpperCase()}
            </h3>
            <p style={{ margin: '0 0 10px 0' }}>{storageStats.health.message}</p>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>Total Properties: {storageStats.totalProperties}</div>
              <div>Storage Used: {storageStats.storageSizeMB} MB</div>
              <div>Storage Quota: {storageStats.quotaMB} MB</div>
              <div>Usage: {storageStats.storageUsagePercent}% of available space</div>
            </div>
          </div>
        </div>

        <div className="storage-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleCleanup}
            disabled={isCleaningUp}
            style={{
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isCleaningUp ? 'not-allowed' : 'pointer',
              opacity: isCleaningUp ? 0.6 : 1
            }}
          >
            {isCleaningUp ? 'Cleaning Up...' : 'Clean Up Storage (Remove Old Images)'}
          </button>

          <button
            onClick={handleClearAll}
            style={{
              padding: '12px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Delete All Properties
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <div className="storage-tips" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <h4>Tips to manage storage:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Remove images from properties you no longer need</li>
            <li>Use smaller image files (under 1MB recommended)</li>
            <li>Delete old test properties</li>
            <li>Clear browser data if storage issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageManager;