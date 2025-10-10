/**
 * @file StorageFactory.js
 * @description Factory for creating storage adapter instances.
 */

import LocalStorageAdapter from './LocalStorageAdapter.js';

/**
 * @class StorageFactory
 * @description Factory class for creating appropriate storage adapter instances.
 */
class StorageFactory {
  /**
   * Creates a storage adapter based on the provided configuration.
   * @param {import('./types.js').StorageConfig} config - Storage configuration.
   * @returns {StorageAdapter} The appropriate storage adapter instance.
   * @throws {Error} If the storage type is unsupported or adapter creation fails.
   */
  static create(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Storage configuration is required and must be an object.');
    }

    const { type } = config;

    if (!type || typeof type !== 'string') {
      throw new Error('Storage type is required and must be a string.');
    }

    switch (type.toLowerCase()) {
      case 'local':
        return StorageFactory._createLocalStorageAdapter(config);
      case 'session':
        return StorageFactory._createSessionStorageAdapter(config);
      case 'cloud':
        return StorageFactory._createCloudStorageAdapter(config);
      default:
        throw new Error(`Unsupported storage type: ${type}. Supported types: 'local', 'session', 'cloud'.`);
    }
  }

  /**
   * Detects the best available storage type for the current environment.
   * @returns {string} The recommended storage type ('local', 'session', or 'memory').
   */
  static detectStorageType() {
    // Check for localStorage support
    if (StorageFactory._isStorageAvailable('localStorage')) {
      return 'local';
    }

    // Check for sessionStorage support
    if (StorageFactory._isStorageAvailable('sessionStorage')) {
      return 'session';
    }

    // Fallback to memory storage
    return 'memory';
  }

  /**
   * Checks if a storage type is available in the current environment.
   * @param {string} storageType - The storage type to check ('localStorage' or 'sessionStorage').
   * @returns {boolean} True if the storage type is available, false otherwise.
   * @private
   */
  static _isStorageAvailable(storageType) {
    try {
      const storage = window[storageType];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates a localStorage-based storage adapter.
   * @param {import('./types.js').StorageConfig} config - Storage configuration.
   * @returns {StorageAdapter} LocalStorageAdapter instance.
   * @private
   */
  static _createLocalStorageAdapter(config) {
    if (!StorageFactory._isStorageAvailable('localStorage')) {
      throw new Error('localStorage is not available in this environment.');
    }
    
    return new LocalStorageAdapter({
      prefix: config.prefix || 'snowflix_',
      serialize: config.serialize !== false
    });
  }

  /**
   * Creates a sessionStorage-based storage adapter.
   * @param {import('./types.js').StorageConfig} config - Storage configuration.
   * @returns {StorageAdapter} SessionStorageAdapter instance.
   * @private
   */
  static _createSessionStorageAdapter(config) {
    // Note: This will be implemented in a future task
    throw new Error('SessionStorageAdapter implementation is not yet available.');
  }

  /**
   * Creates a cloud-based storage adapter.
   * @param {import('./types.js').StorageConfig} config - Storage configuration.
   * @returns {StorageAdapter} CloudStorageAdapter instance.
   * @private
   */
  static _createCloudStorageAdapter(config) {
    // Note: This will be implemented in a future task
    throw new Error('CloudStorageAdapter implementation is not yet available.');
  }

  /**
   * Validates storage configuration.
   * @param {import('./types.js').StorageConfig} config - Storage configuration to validate.
   * @returns {boolean} True if configuration is valid.
   * @throws {Error} If configuration is invalid.
   */
  static validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Storage configuration must be an object.');
    }

    if (!config.type || typeof config.type !== 'string') {
      throw new Error('Storage type is required and must be a string.');
    }

    const validTypes = ['local', 'session', 'cloud', 'memory'];
    if (!validTypes.includes(config.type.toLowerCase())) {
      throw new Error(`Invalid storage type: ${config.type}. Valid types: ${validTypes.join(', ')}.`);
    }

    // Validate cloud-specific configuration
    if (config.type.toLowerCase() === 'cloud') {
      if (!config.apiEndpoint || typeof config.apiEndpoint !== 'string') {
        throw new Error('Cloud storage requires a valid apiEndpoint.');
      }
    }

    // Validate timeout if provided
    if (config.timeout !== undefined) {
      if (typeof config.timeout !== 'number' || config.timeout < 0) {
        throw new Error('Timeout must be a non-negative number.');
      }
    }

    return true;
  }
}

export default StorageFactory;