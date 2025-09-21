// IndexedDB Service for BlockNexus
// Replaces localStorage with IndexedDB for better storage capacity and performance

class IndexedDBService {
  constructor() {
    this.dbName = 'BlockNexusDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('IndexedDB upgrade needed, creating object stores...');

        // Create properties store
        if (!db.objectStoreNames.contains('properties')) {
          const propertyStore = db.createObjectStore('properties', { keyPath: 'id' });
          propertyStore.createIndex('type', 'type', { unique: false });
          propertyStore.createIndex('approvalStatus', 'approvalStatus', { unique: false });
          propertyStore.createIndex('createdAt', 'createdAt', { unique: false });
          propertyStore.createIndex('city', 'city', { unique: false });
          console.log('Properties store created');
        }

        // Create transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('propertyId', 'propertyId', { unique: false });
          transactionStore.createIndex('buyerAddress', 'buyerAddress', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
          transactionStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Transactions store created');
        }

        // Create KYC store
        if (!db.objectStoreNames.contains('kyc')) {
          const kycStore = db.createObjectStore('kyc', { keyPath: 'walletAddress' });
          kycStore.createIndex('status', 'status', { unique: false });
          kycStore.createIndex('verificationDate', 'verificationDate', { unique: false });
          console.log('KYC store created');
        }

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'walletAddress' });
          userStore.createIndex('email', 'email', { unique: false });
          userStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Users store created');
        }

        // Create notifications store
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('userAddress', 'userAddress', { unique: false });
          notificationStore.createIndex('read', 'read', { unique: false });
          notificationStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Notifications store created');
        }
      };
    });
  }

  // Generic method to add/update data
  async put(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get data by key
  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to get all data from a store
  async getAll(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to delete data
  async delete(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Generic method to clear a store
  async clear(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Search data using an index
  async getByIndex(storeName, indexName, value) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Count records in a store
  async count(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage estimate
  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return { usage: 0, quota: 0 };
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create singleton instance
const indexedDBService = new IndexedDBService();

export default indexedDBService;