/**
 * Storage Utilities - Handles both localStorage and sessionStorage with fallback
 */

/**
 * Saves data to both localStorage and sessionStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to be stored (will be stringified)
 * @param {boolean} [useSession=false] - If true, only uses sessionStorage
 */
export const saveToStorage = (key, data, useSession = false) => {
  try {
    const serialized = JSON.stringify(data);
    if (!useSession) {
      localStorage.setItem(key, serialized);
    }
    sessionStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Storage save error:', error);
    // Fallback to memory storage if both fail
    if (typeof window.memoryStorage === 'undefined') {
      window.memoryStorage = {};
    }
    window.memoryStorage[key] = data;
  }
};

/**
 * Loads data from storage (tries localStorage first, then sessionStorage)
 * @param {string} key - Storage key
 * @param {boolean} [useSession=false] - If true, only checks sessionStorage
 * @returns {any} Parsed data or null if not found
 */
export const loadFromStorage = (key, useSession = false) => {
  try {
    let data;
    if (!useSession) {
      data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    }
    
    data = sessionStorage.getItem(key);
    if (data) return JSON.parse(data);
    
    // Check memory fallback
    if (typeof window.memoryStorage !== 'undefined' && window.memoryStorage[key]) {
      return window.memoryStorage[key];
    }
    
    return null;
  } catch (error) {
    console.error('Storage load error:', error);
    return null;
  }
};

/**
 * Removes data from both storage types
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    if (typeof window.memoryStorage !== 'undefined') {
      delete window.memoryStorage[key];
    }
  } catch (error) {
    console.error('Storage remove error:', error);
  }
};

/**
 * Clears all stored data (both storage types)
 */
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    if (typeof window.memoryStorage !== 'undefined') {
      window.memoryStorage = {};
    }
  } catch (error) {
    console.error('Storage clear error:', error);
  }
};

/**
 * Gets all keys from storage
 * @returns {string[]} Array of storage keys
 */
export const getAllStorageKeys = () => {
  try {
    const keys = new Set([
      ...Object.keys(localStorage),
      ...Object.keys(sessionStorage),
      ...(typeof window.memoryStorage !== 'undefined' ? Object.keys(window.memoryStorage) : [])
    ]);
    return Array.from(keys);
  } catch (error) {
    console.error('Storage keys error:', error);
    return [];
  }
};

/**
 * Checks if storage is available
 * @param {'local'|'session'} type - Storage type to test
 * @returns {boolean} True if storage is available
 */
export const isStorageAvailable = (type = 'local') => {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Storage manager with expiration support
 */
export const storageWithExpiry = {
  /**
   * Sets item with expiration (in minutes)
   * @param {string} key 
   * @param {any} value 
   * @param {number} minutes 
   */
  set: (key, value, minutes) => {
    const expiry = new Date().getTime() + minutes * 60000;
    saveToStorage(key, { value, expiry });
  },
  
  /**
   * Gets item and checks expiration
   * @param {string} key 
   * @returns {any|null} Value or null if expired
   */
  get: (key) => {
    const data = loadFromStorage(key);
    if (!data) return null;
    
    if (new Date().getTime() > data.expiry) {
      removeFromStorage(key);
      return null;
    }
    
    return data.value;
  }
};

// Optional: Initialize memory storage if needed
if (typeof window.memoryStorage === 'undefined') {
  window.memoryStorage = {};
}

export default {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  clearAllStorage,
  getAllStorageKeys,
  isStorageAvailable,
  storageWithExpiry
};

// Save connection details
saveToStorage('mongoConfig', {
  uri: 'mongodb+srv://...',
  certificate: '-----BEGIN...',
  lastConnected: new Date().toISOString()
});

// Load with expiration check (30 minutes)
const cachedData = storageWithExpiry.get('recentQueries');
if (!cachedData) {
  // Fetch fresh data
  const newData = await fetchData();
  storageWithExpiry.set('recentQueries', newData, 30);
}

// Check storage availability
if (isStorageAvailable('local')) {
  console.log('LocalStorage is available');
}

// Get all stored keys
console.log('All stored keys:', getAllStorageKeys());