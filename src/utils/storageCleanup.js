// Storage cleanup utilities to prevent localStorage quota exceeded errors

export const cleanupLargeLocalStorageItems = () => {
  try {
    const itemsToCleanup = [
      'blockNexus_Notifications',
      'blockNexus_properties', // Old property storage key
      'blockNexus_Transactions', // Old transaction storage key
    ];

    let totalCleaned = 0;
    
    itemsToCleanup.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        const sizeKB = Math.round((item.length * 2) / 1024);
        localStorage.removeItem(key);
        totalCleaned += sizeKB;
        console.log(`Cleaned up ${key}: ${sizeKB}KB`);
      }
    });

    if (totalCleaned > 0) {
      console.log(`Total localStorage cleaned up: ${totalCleaned}KB`);
    }

    return totalCleaned;
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
    return 0;
  }
};

export const getLocalStorageUsage = () => {
  try {
    let totalSize = 0;
    const items = {};

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        const sizeKB = Math.round((item.length * 2) / 1024);
        items[key] = sizeKB;
        totalSize += sizeKB;
      }
    }

    return {
      totalSizeKB: totalSize,
      items: items,
      itemCount: Object.keys(items).length
    };
  } catch (error) {
    console.error('Error getting localStorage usage:', error);
    return { totalSizeKB: 0, items: {}, itemCount: 0 };
  }
};

export const emergencyLocalStorageCleanup = () => {
  try {
    console.warn('Performing emergency localStorage cleanup...');
    
    // Keep only essential items
    const essentialKeys = [
      'blockNexusUser',
      'blockNexusAccount', 
      'blockNexusTheme'
    ];

    const backup = {};
    essentialKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = value;
      }
    });

    // Clear everything
    localStorage.clear();

    // Restore essential items
    Object.keys(backup).forEach(key => {
      localStorage.setItem(key, backup[key]);
    });

    console.log('Emergency cleanup completed. Restored essential items:', Object.keys(backup));
    return true;
  } catch (error) {
    console.error('Error during emergency cleanup:', error);
    return false;
  }
};