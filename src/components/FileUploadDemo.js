import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import indexedDBStorage from '../services/indexedDBStorage';
import './FileUploadDemo.css';

const FileUploadDemo = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFolders, setUploadedFolders] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      await indexedDBStorage.init();
      await loadExistingData();
      setLoading(false);
    } catch (error) {
      console.error('Error initializing storage:', error);
      setLoading(false);
    }
  };

  const loadExistingData = async () => {
    try {
      const [files, folders, stats] = await Promise.all([
        indexedDBStorage.getAllFiles(),
        indexedDBStorage.getAllFolders(),
        indexedDBStorage.getStorageStats()
      ]);
      
      setUploadedFiles(files);
      setUploadedFolders(folders);
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleFilesUploaded = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    loadStorageStats();
  };

  const loadStorageStats = async () => {
    try {
      const stats = await indexedDBStorage.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all uploaded files? This action cannot be undone.')) {
      try {
        await indexedDBStorage.clearAllData();
        setUploadedFiles([]);
        setUploadedFolders([]);
        await loadStorageStats();
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="file-upload-demo">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing file storage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-upload-demo">
      <div className="demo-header">
        <h2>File Upload Demo</h2>
        <p>Test the folder upload functionality with IndexedDB storage</p>
      </div>

      {/* Storage Statistics */}
      {storageStats && (
        <div className="storage-stats">
          <h3>Storage Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{storageStats.totalFiles}</span>
              <span className="stat-label">Total Files</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{storageStats.totalFolders}</span>
              <span className="stat-label">Total Folders</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{storageStats.totalSizeFormatted}</span>
              <span className="stat-label">Total Size</span>
            </div>
          </div>
          <div className="file-types">
            <h4>Files by Type:</h4>
            <div className="type-list">
              {Object.entries(storageStats.filesByType).map(([type, count]) => (
                <span key={type} className="type-item">
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Component */}
      <FileUpload
        propertyId="demo-property"
        onFilesUploaded={handleFilesUploaded}
        existingFiles={uploadedFiles}
        existingFolders={uploadedFolders}
      />

      {/* Demo Actions */}
      <div className="demo-actions">
        <button 
          className="btn btn--outline"
          onClick={loadStorageStats}
        >
          Refresh Statistics
        </button>
        <button 
          className="btn btn--danger"
          onClick={clearAllData}
        >
          Clear All Data
        </button>
      </div>

      {/* Instructions */}
      <div className="demo-instructions">
        <h3>How to Use:</h3>
        <ol>
          <li><strong>Select Files:</strong> Click "Select Files" to choose individual files</li>
          <li><strong>Select Folder:</strong> Click "Select Folder" to upload an entire folder structure</li>
          <li><strong>Drag & Drop:</strong> Drag files or folders directly onto the upload area</li>
          <li><strong>Upload Options:</strong> Choose to upload as individual files or as a folder</li>
          <li><strong>Manage Files:</strong> Download or delete uploaded files using the action buttons</li>
        </ol>
        
        <div className="features">
          <h4>Features:</h4>
          <ul>
            <li>✅ IndexedDB storage for offline file management</li>
            <li>✅ Folder upload with directory structure preservation</li>
            <li>✅ File preview with icons and metadata</li>
            <li>✅ Drag and drop support</li>
            <li>✅ Progress tracking during upload</li>
            <li>✅ File download and deletion</li>
            <li>✅ Storage statistics and monitoring</li>
            <li>✅ Responsive design for mobile devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo;
