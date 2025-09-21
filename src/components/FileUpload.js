import React, { useState, useRef, useEffect } from 'react';
import indexedDBStorage from '../services/indexedDBStorage';
import './FileUpload.css';

const FileUpload = ({ propertyId, onFilesUploaded, existingFiles = [], existingFolders = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles);
  const [uploadedFolders, setUploadedFolders] = useState(existingFolders);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    // Initialize IndexedDB
    indexedDBStorage.init().catch(console.error);
  }, []);

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setError('');
  };

  // Handle folder selection
  const handleFolderSelect = (files) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setError('');
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Upload files individually
  const uploadFiles = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const result = await indexedDBStorage.storeFile(file, propertyId);
        setUploadProgress(((index + 1) / selectedFiles.length) * 100);
        return result;
      });

      const uploaded = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploaded]);
      setSelectedFiles([]);
      setSuccess(`${uploaded.length} file(s) uploaded successfully!`);
      
      if (onFilesUploaded) {
        onFilesUploaded(uploaded);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload files as folder
  const uploadFolder = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const folderName = `Property_${propertyId}_${new Date().toISOString().split('T')[0]}`;
      const result = await indexedDBStorage.storeFolder(selectedFiles, propertyId, folderName);
      
      setUploadedFolders(prev => [...prev, result]);
      setSelectedFiles([]);
      setSuccess(`Folder "${folderName}" uploaded successfully with ${result.files.length} files!`);
      
      if (onFilesUploaded) {
        onFilesUploaded(result.files);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading folder:', error);
      setError('Failed to upload folder. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete file
  const deleteFile = async (fileId) => {
    try {
      await indexedDBStorage.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      setSuccess('File deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  // Delete folder
  const deleteFolder = async (folderId) => {
    try {
      await indexedDBStorage.deleteFolder(folderId);
      setUploadedFolders(prev => prev.filter(folder => folder.id !== folderId));
      setSuccess('Folder deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder. Please try again.');
    }
  };

  // Download file
  const downloadFile = async (fileId, fileName) => {
    try {
      await indexedDBStorage.downloadFile(fileId);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📁';
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-header">
        <h3>Document Upload</h3>
        <p>Upload property documents, images, and legal papers</p>
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <h4>Drop files here or click to browse</h4>
          <p>Support for images, PDFs, documents, and more</p>
          
          <div className="upload-buttons">
            <button 
              type="button"
              className="btn btn--outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Select Files
            </button>
            <button 
              type="button"
              className="btn btn--outline"
              onClick={() => folderInputRef.current?.click()}
              disabled={uploading}
            >
              Select Folder
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory=""
            onChange={(e) => handleFolderSelect(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(uploadProgress)}%</span>
          </div>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({selectedFiles.length})</h4>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">{getFileIcon(file.type)}</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
          <div className="upload-actions">
            <button 
              type="button"
              className="btn btn--primary"
              onClick={uploadFiles}
              disabled={uploading}
            >
              Upload as Individual Files
            </button>
            <button 
              type="button"
              className="btn btn--secondary"
              onClick={uploadFolder}
              disabled={uploading}
            >
              Upload as Folder
            </button>
            <button 
              type="button"
              className="btn btn--outline"
              onClick={() => setSelectedFiles([])}
              disabled={uploading}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          <div className="file-list">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item uploaded">
                <span className="file-icon">{getFileIcon(file.fileType)}</span>
                <div className="file-info">
                  <span className="file-name">{file.fileName}</span>
                  <span className="file-meta">
                    {formatFileSize(file.fileSize)} • {new Date(file.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="file-actions">
                  <button 
                    type="button"
                    className="btn-icon"
                    onClick={() => downloadFile(file.id, file.fileName)}
                    title="Download"
                  >
                    ⬇️
                  </button>
                  <button 
                    type="button"
                    className="btn-icon delete"
                    onClick={() => deleteFile(file.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Folders */}
      {uploadedFolders.length > 0 && (
        <div className="uploaded-folders">
          <h4>Uploaded Folders ({uploadedFolders.length})</h4>
          <div className="folder-list">
            {uploadedFolders.map((folder) => (
              <div key={folder.id} className="folder-item">
                <span className="folder-icon">📁</span>
                <div className="folder-info">
                  <span className="folder-name">{folder.folderName}</span>
                  <span className="folder-meta">
                    {folder.fileCount} files • {new Date(folder.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="folder-actions">
                  <button 
                    type="button"
                    className="btn-icon delete"
                    onClick={() => deleteFolder(folder.id)}
                    title="Delete Folder"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="status-message error">
          <span className="status-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="status-message success">
          <span className="status-icon">✅</span>
          {success}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
