/**
 * @file AdapterFactory.js
 * @description Factory for creating player adapters based on player type.
 */

/**
 * @class AdapterFactory
 * @description Provides a static method to create instances of PlayerAdapter based on the specified player type.
 */
class AdapterFactory {
  /**
   * Creates an appropriate player adapter based on the given player type.
   * @param {string} playerType - The type of the player (e.g., 'kaltura', 'videojs').
   * @param {object} config - Configuration object for the player adapter.
   * @returns {PlayerAdapter} An instance of a concrete PlayerAdapter.
   * @throws {Error} If the player type is not supported.
   */
  static createAdapter(playerType, config) {
    switch (playerType) {
      // TODO: Implement concrete adapters for Kaltura and Video.js
      // case 'kaltura':
      //   return new KalturaPlayerAdapter(config);
      // case 'videojs':
      //   return new VideoJsPlayerAdapter(config);
      default:
        throw new Error(`Unsupported player type: ${playerType}`);
    }
  }
}

export default AdapterFactory;
