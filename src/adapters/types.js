/**
 * @file types.js
 * @description JSDoc type definitions for player adapter interfaces.
 */

/**
 * @typedef {object} PlayerConfig
 * @property {string} id - The ID of the video element.
 * @property {string} [src] - The source URL of the media.
 * @property {boolean} [autoplay=false] - Whether the media should autoplay.
 * @property {boolean} [controls=true] - Whether player controls should be shown.
 * @property {boolean} [loop=false] - Whether the media should loop.
 * @property {boolean} [muted=false] - Whether the media should be muted.
 */

/**
 * @typedef {import('./PlayerAdapter.js').default} PlayerAdapter
 * @description The PlayerAdapter interface is defined in PlayerAdapter.js
 */

/**
 * @typedef {import('./StorageAdapter.js').default} StorageAdapter
 * @description The StorageAdapter interface is defined in StorageAdapter.js
 */

/**
 * @typedef {object} StorageConfig
 * @property {string} type - The type of storage ('local', 'cloud', 'session').
 * @property {string} [prefix] - Key prefix for storage namespacing.
 * @property {string} [apiEndpoint] - API endpoint for cloud storage.
 * @property {string} [apiKey] - API key for cloud storage authentication.
 * @property {number} [timeout=5000] - Timeout in milliseconds for storage operations.
 * @property {boolean} [fallback=true] - Whether to fallback to local storage on cloud failure.
 */

/**
 * @typedef {object} StorageError
 * @property {string} code - Error code ('STORAGE_UNAVAILABLE', 'NETWORK_ERROR', 'QUOTA_EXCEEDED', 'INVALID_KEY').
 * @property {string} message - Human-readable error message.
 * @property {string} [key] - The storage key that caused the error.
 * @property {Error} [cause] - The underlying error that caused this storage error.
 */

/**
 * @typedef {object} StorageEventData
 * @property {string} key - The storage key affected.
 * @property {*} [value] - The value associated with the operation.
 * @property {StorageError} [error] - Error information if operation failed.
 * @property {string} [operation] - The operation performed ('save', 'load', 'remove', 'clear').
 */

/**
 * @interface EventAdapter
 * @description Defines the interface for an event adapter.
 * @example
 * // This class is for JSDoc documentation purposes only
 * // The actual implementation is in EventAdapter.js
 */
class EventAdapter { // eslint-disable-line no-unused-vars
  /**
   * Standard event names mapping.
   * @readonly
   * @enum {string}
   */
  static get EVENTS() {
    return {
      PLAY: 'play',
      PAUSE: 'pause',
      TIME_UPDATE: 'timeupdate',
      ENDED: 'ended',
      ERROR: 'error',
    };
  }

  /**
   * Registers an event listener for a specific event.
   * @param {string} eventName - The name of the event to listen for (use EventAdapter.EVENTS).
   * @param {function} callback - The callback function to execute when the event is triggered.
   * @returns {void}
   */
  on(eventName, callback) {}

  /**
   * Unregisters an event listener for a specific event.
   * @param {string} eventName - The name of the event to remove the listener from.
   * @param {function} callback - The callback function to remove.
   * @returns {void}
   */
  off(eventName, callback) {}

  /**
   * Triggers an event, notifying all registered listeners.
   * @param {string} eventName - The name of the event to trigger.
   * @param {object} [data] - Optional data to pass to the event listeners.
   * @returns {void}
   */
  trigger(eventName, data) {}
}
