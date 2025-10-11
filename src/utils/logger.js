/**
 * Logger utility for Snowflix plugin
 * Provides debug logging that can be toggled on/off
 */

let debugEnabled = false;

/**
 * Enable or disable debug logging
 * @param {boolean} enabled - Whether to enable debug logs
 */
export function setDebugMode(enabled) {
  debugEnabled = enabled;
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export function isDebugEnabled() {
  return debugEnabled;
}

/**
 * Log a debug message (only if debug is enabled)
 * @param {...any} args - Arguments to log
 */
export function logDebug(...args) {
  if (debugEnabled) {
    console.log('[Snowflix Debug]', ...args);
  }
}

/**
 * Log a warning message (only if debug is enabled)
 * @param {...any} args - Arguments to log
 */
export function logWarn(...args) {
  if (debugEnabled) {
    console.warn('[Snowflix Warn]', ...args);
  }
}

/**
 * Log an error message (always shown, but prefixed only if debug is enabled)
 * @param {...any} args - Arguments to log
 */
export function logError(...args) {
  if (debugEnabled) {
    console.error('[Snowflix Error]', ...args);
  } else {
    // Still log errors in production, but without prefix
    console.error(...args);
  }
}

/**
 * Log an info message (only if debug is enabled)
 * @param {...any} args - Arguments to log
 */
export function logInfo(...args) {
  if (debugEnabled) {
    console.info('[Snowflix Info]', ...args);
  }
}
