/**
 * @file PlayerAdapter.js
 * @description Abstract base class for player adapters.
 */

/**
 * @class PlayerAdapter
 * @abstract
 * @description Abstract base class for player adapters, providing a common interface for player interactions.
 * All concrete player adapters must extend this class and implement its abstract methods.
 */
class PlayerAdapter {
  constructor() {
    if (new.target === PlayerAdapter) {
      throw new TypeError("Cannot instantiate abstract class PlayerAdapter directly.");
    }
  }

  /**
   * Plays the media.
   * @abstract
   * @returns {void}
   */
  play() {
    throw new Error("Method 'play()' must be implemented.");
  }

  /**
   * Pauses the media.
   * @abstract
   * @returns {void}
   */
  pause() {
    throw new Error("Method 'pause()' must be implemented.");
  }

  /**
   * Gets the current playback time in seconds.
   * @abstract
   * @returns {number} The current playback time.
   */
  getCurrentTime() {
    throw new Error("Method 'getCurrentTime()' must be implemented.");
  }

  /**
   * Gets the total duration of the media in seconds.
   * @abstract
   * @returns {number} The duration of the media.
   */
  getDuration() {
    throw new Error("Method 'getDuration()' must be implemented.");
  }

  /**
   * Registers an event listener for a specific event.
   * @abstract
   * @param {string} eventName - The name of the event to listen for.
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

  /**
   * Gets the underlying video element.
   * @abstract
   * @returns {HTMLVideoElement} The video element.
   */
  getVideoElement() {
    throw new Error("Method 'getVideoElement()' must be implemented.");
  }
}

export default PlayerAdapter;
