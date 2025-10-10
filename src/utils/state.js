import getBrowserFingerprint from './fingerprint';
import { SCENE, RGB_MODES, TOON_MODES } from '../constants';

export const { uuid, browserData } = getBrowserFingerprint({ enableWebgl: true });

export const setMediaId = (player) => {
  // Video.js doesn't have _mediaInfo, use currentSrc or ID instead
  mediaId = player.currentSrc?.() || player.id?.() || 'unknown';
};

export const setClientId = (_clientId) => {
  clientId = _clientId;
};

export const setAppState = (newState) => {
  appState = { ...newState };
  appState.currentScene = SCENE.Default;
};

export let mediaId;
export let clientId;
export let appState = {
  isMuted: false,
  isMinimized: false,
  currentScene: SCENE.Default,
  billboardIsDayLight: true,
  billboardSpeedMode: 1,
  billboardPrismCount: 1,
  tvIsDaylight: true,
  tvGoToPosition: null,
  tvCursorPosition: null,
  flashlightIsLarge: true,
  flashlightTarget: null,
  flashlightPosition: null,
  desatIndex: 3,
  toonMode: TOON_MODES.Color,
  rgbMode: RGB_MODES.Default,
};
