/**
 * @file EventAdapter.js
 * @description Defines standard event names and provides an interface for event listener management.
 */

/**
 * @class EventAdapter
 * @abstract
 * @description Abstract base class for managing player events, ensuring cross-player event normalization.
 * Concrete event adapters must extend this class and implement its abstract methods.
 */
class EventAdapter {
  constructor() {
    if (new.target === EventAdapter) {
      throw new TypeError("Cannot instantiate abstract class EventAdapter directly.");
    }
  }

  /**
   * Standard event names mapping.
   * @static
   * @readonly
   * @enum {string}
   */
  static get EVENTS() {
    return {
      // Player events
      PLAY: 'play',
      PAUSE: 'pause',
      TIME_UPDATE: 'timeupdate',
      ENDED: 'ended',
      ERROR: 'error',
      
      // Storage events
      STORAGE_SAVE: 'storage:save',
      STORAGE_LOAD: 'storage:load',
      STORAGE_REMOVE: 'storage:remove',
      STORAGE_CLEAR: 'storage:clear',
      STORAGE_ERROR: 'storage:error',
      STORAGE_PROGRESS: 'storage:progress',
    };
  }

  /**
   * Registers an event listener for a specific event.
   * @abstract
   * @param {string} eventName - The name of the event to listen for (use EventAdapter.EVENTS).
   * @param {function} callback - The callback function to execute when the event is triggered.
   * @returns {void}
   */
  on(eventName, callback) {
    throw new Error("Method 'on()' must be implemented.");
  }

  /**
   * Unregisters an event listener for a specific event.
   * @abstract
   * @param {string} eventName - The name of the event to remove the listener from.
   * @param {function} callback - The callback function to remove.
   * @returns {void}
   */
  off(eventName, callback) {
    throw new Error("Method 'off()' must be implemented.");
  }

  /**
   * Triggers an event, notifying all registered listeners.
   * @abstract
   * @param {string} eventName - The name of the event to trigger.
   * @param {object} [data] - Optional data to pass to the event listeners.
   * @returns {void}
   */
  trigger(eventName, data) {
    throw new Error("Method 'trigger()' must be implemented.");
  }
}

export default EventAdapter;
