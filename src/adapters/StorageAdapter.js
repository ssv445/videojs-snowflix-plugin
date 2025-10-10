/**
 * @file StorageAdapter.js
 * @description Abstract base class for storage adapters.
 */

/**
 * @class StorageAdapter
 * @abstract
 * @description Abstract base class for storage adapters, providing a common interface for state persistence.
 * All concrete storage adapters must extend this class and implement its abstract methods.
 */
class StorageAdapter {
  constructor() {
    if (new.target === StorageAdapter) {
      throw new TypeError("Cannot instantiate abstract class StorageAdapter directly.");
    }
  }

  /**
   * Saves a value to storage with the specified key.
   * @abstract
   * @param {string} key - The storage key.
   * @param {*} value - The value to store.
   * @returns {Promise<void>} Promise that resolves when the value is saved.
   */
  async save(key, value) {
    throw new Error("Method 'save()' must be implemented.");
  }

  /**
   * Loads a value from storage by key.
   * @abstract
   * @param {string} key - The storage key.
   * @returns {Promise<*>} Promise that resolves with the stored value, or null if not found.
   */
  async load(key) {
    throw new Error("Method 'load()' must be implemented.");
  }

  /**
   * Removes a value from storage by key.
   * @abstract
   * @param {string} key - The storage key to remove.
   * @returns {Promise<void>} Promise that resolves when the value is removed.
   */
  async remove(key) {
    throw new Error("Method 'remove()' must be implemented.");
  }

  /**
   * Clears all values from storage.
   * @abstract
   * @returns {Promise<void>} Promise that resolves when storage is cleared.
   */
  async clear() {
    throw new Error("Method 'clear()' must be implemented.");
  }

  /**
   * Checks if a key exists in storage.
   * @abstract
   * @param {string} key - The storage key to check.
   * @returns {Promise<boolean>} Promise that resolves with true if key exists, false otherwise.
   */
  async exists(key) {
    throw new Error("Method 'exists()' must be implemented.");
  }

  /**
   * Gets all keys from storage.
   * @abstract
   * @returns {Promise<string[]>} Promise that resolves with array of all storage keys.
   */
  async getKeys() {
    throw new Error("Method 'getKeys()' must be implemented.");
  }
}

export default StorageAdapter;