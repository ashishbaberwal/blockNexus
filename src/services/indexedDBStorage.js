// IndexedDB Storage Service for File Management
class IndexedDBStorage {
  constructor() {
    this.dbName = 'BlockNexusFileStorage';
    this.dbVersion = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
          fileStore.createIndex('propertyId', 'propertyId', { unique: false });
          fileStore.createIndex('fileName', 'fileName', { unique: false });
          fileStore.createIndex('fileType', 'fileType', { unique: false });
          fileStore.createIndex('uploadDate', 'uploadDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id', autoIncrement: true });
          folderStore.createIndex('propertyId', 'propertyId', { unique: false });
          folderStore.createIndex('folderName', 'folderName', { unique: false });
          folderStore.createIndex('uploadDate', 'uploadDate', { unique: false });
        }
      };
    });
  }

  // Ensure database is initialized
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // Store a file
  async storeFile(file, propertyId, folderId = null) {
    try {
      await this.ensureDB();
      
      const fileData = await this.fileToArrayBuffer(file);
      
      const fileRecord = {
        propertyId,
        folderId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData,
        uploadDate: new Date().toISOString(),
        lastModified: file.lastModified
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const request = store.add(fileRecord);

        request.onsuccess = () => {
          console.log('File stored successfully:', file.name);
          resolve({ id: request.result, ...fileRecord });
        };

        request.onerror = () => {
          console.error('Error storing file:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in storeFile:', error);
      throw error;
    }
  }

  // Store multiple files (folder upload)
  async storeFolder(files, propertyId, folderName) {
    try {
      await this.ensureDB();
      
      // First, create a folder record
      const folderRecord = {
        propertyId,
        folderName,
        fileCount: files.length,
        uploadDate: new Date().toISOString()
      };

      const folderId = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['folders'], 'readwrite');
        const store = transaction.objectStore('folders');
        const request = store.add(folderRecord);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Store all files in the folder
      const filePromises = Array.from(files).map(file => 
        this.storeFile(file, propertyId, folderId)
      );

      const storedFiles = await Promise.all(filePromises);
      
      return {
        folderId,
        folderName,
        files: storedFiles,
        uploadDate: folderRecord.uploadDate
      };
    } catch (error) {
      console.error('Error storing folder:', error);
      throw error;
    }
  }

  // Get files by property ID
  async getFilesByProperty(propertyId) {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const index = store.index('propertyId');
        const request = index.getAll(propertyId);

        request.onsuccess = () => {
          const files = request.result.map(file => ({
            ...file,
            fileData: null // Don't include binary data in list
          }));
          resolve(files);
        };

        request.onerror = () => {
          console.error('Error getting files:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFilesByProperty:', error);
      throw error;
    }
  }

  // Get folders by property ID
  async getFoldersByProperty(propertyId) {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['folders'], 'readonly');
        const store = transaction.objectStore('folders');
        const index = store.index('propertyId');
        const request = index.getAll(propertyId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error('Error getting folders:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFoldersByProperty:', error);
      throw error;
    }
  }

  // Get file data by ID
  async getFileData(fileId) {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.get(fileId);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            reject(new Error('File not found'));
          }
        };

        request.onerror = () => {
          console.error('Error getting file data:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFileData:', error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        const request = store.delete(fileId);

        request.onsuccess = () => {
          console.log('File deleted successfully');
          resolve(true);
        };

        request.onerror = () => {
          console.error('Error deleting file:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteFile:', error);
      throw error;
    }
  }

  // Delete folder and all its files
  async deleteFolder(folderId) {
    try {
      await this.ensureDB();
      
      // First, get all files in the folder
      const files = await this.getFilesByFolder(folderId);
      
      // Delete all files
      const deletePromises = files.map(file => this.deleteFile(file.id));
      await Promise.all(deletePromises);
      
      // Delete folder record
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['folders'], 'readwrite');
        const store = transaction.objectStore('folders');
        const request = store.delete(folderId);

        request.onsuccess = () => {
          console.log('Folder deleted successfully');
          resolve(true);
        };

        request.onerror = () => {
          console.error('Error deleting folder:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteFolder:', error);
      throw error;
    }
  }

  // Get files by folder ID
  async getFilesByFolder(folderId) {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.getAll();

        request.onsuccess = () => {
          const files = request.result
            .filter(file => file.folderId === folderId)
            .map(file => ({
              ...file,
              fileData: null // Don't include binary data in list
            }));
          resolve(files);
        };

        request.onerror = () => {
          console.error('Error getting files by folder:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFilesByFolder:', error);
      throw error;
    }
  }

  // Convert file to ArrayBuffer
  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Convert ArrayBuffer to Blob
  arrayBufferToBlob(arrayBuffer, mimeType) {
    return new Blob([arrayBuffer], { type: mimeType });
  }

  // Download file
  async downloadFile(fileId) {
    try {
      const fileData = await this.getFileData(fileId);
      const blob = this.arrayBufferToBlob(fileData.fileData, fileData.fileType);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      await this.ensureDB();
      
      const [files, folders] = await Promise.all([
        this.getAllFiles(),
        this.getAllFolders()
      ]);

      const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
      
      return {
        totalFiles: files.length,
        totalFolders: folders.length,
        totalSize,
        totalSizeFormatted: this.formatFileSize(totalSize),
        filesByType: files.reduce((acc, file) => {
          const type = file.fileType.split('/')[0];
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Get all files
  async getAllFiles() {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');
        const request = store.getAll();

        request.onsuccess = () => {
          const files = request.result.map(file => ({
            ...file,
            fileData: null // Don't include binary data
          }));
          resolve(files);
        };

        request.onerror = () => {
          console.error('Error getting all files:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getAllFiles:', error);
      throw error;
    }
  }

  // Get all folders
  async getAllFolders() {
    try {
      await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['folders'], 'readonly');
        const store = transaction.objectStore('folders');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error('Error getting all folders:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getAllFolders:', error);
      throw error;
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clear all data
  async clearAllData() {
    try {
      await this.ensureDB();
      
      const transaction = this.db.transaction(['files', 'folders'], 'readwrite');
      
      await Promise.all([
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('files').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('folders').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]);
      
      console.log('All data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const indexedDBStorage = new IndexedDBStorage();

export default indexedDBStorage;
