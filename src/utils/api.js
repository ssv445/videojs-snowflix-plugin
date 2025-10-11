import { appState, uuid } from './index';
import { logWarn, logDebug } from './logger';

const STORAGE_KEY = 'snowflix_user_data';

/**
 * Get user data from localStorage
 * @returns {Promise<Object>} User data object with message property containing setupdata
 */
export const getUserData = () => {
  return new Promise((resolve) => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${uuid}`);
      if (stored) {
        const data = JSON.parse(stored);
        // Return in the same format as the Cloud API expected
        resolve({ message: data.setupdata || data });
      } else {
        // Return null message if no data stored
        resolve({ message: null });
      }
    } catch (error) {
      logWarn('Error reading from localStorage:', error);
      resolve({ message: null });
    }
  });
};

/**
 * Save user data to localStorage
 * @returns {Promise<void>}
 */
export const saveUserData = () => {
  return new Promise((resolve) => {
    try {
      const payload = {
        setupdata: appState,
        uuid: uuid,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${STORAGE_KEY}_${uuid}`, JSON.stringify(payload));
      resolve();
    } catch (error) {
      logWarn('Error saving to localStorage:', error);
      resolve();
    }
  });
};

/**
 * Save browser data - now only logs to console
 * Cloud API functionality removed
 * @returns {Promise<void>}
 */
export const saveBrowserData = () => {
  return new Promise((resolve) => {
    // Browser data logging disabled - was only used for analytics
    resolve();
  });
};

/**
 * Save log data - now only logs to console
 * Cloud API functionality removed
 * @param {Object} logData - Log data to save
 * @returns {Promise<void>}
 */
export const saveLogData = (logData) => {
  return new Promise((resolve) => {
    // Log to console for debugging purposes
    logDebug('Snowflix Event:', logData);
    resolve();
  });
};
