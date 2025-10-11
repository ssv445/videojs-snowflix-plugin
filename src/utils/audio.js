// Vite inlines these as base64 data URLs in the bundle
import slide from '../../public/audio/slide.mp3';
import click from '../../public/audio/click.mp3';

import { appState } from './state';
import { logWarn, logDebug, logError } from './logger';

const playAudio = (audio) => {
  if (!appState.isMuted) {
    if (!audio.paused) {
      audio.currentTime = 0;
    } else {
      audio.play();
    }
  }
};

// Text-to-speech function for voice instructions
const speak = (text) => {
  if (!appState.isMuted) {
    if (!('speechSynthesis' in window)) {
      logWarn('Speech synthesis not supported in this browser');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume

      // Debug logging
      logDebug('Speaking:', text);

      utterance.onstart = () => {
        logDebug('Speech started:', text);
      };

      utterance.onerror = (event) => {
        logError('Speech error:', event);
      };

      utterance.onend = () => {
        logDebug('Speech ended:', text);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      logError('Error in speak function:', error);
    }
  } else {
    logDebug('Audio is muted, not speaking:', text);
  }
};

const _clickAudio = new Audio(click);
const _slideAudio = new Audio(slide);

export const flashlightAudio = () => speak('Flashlight mode');
export const billboardAudio = () => speak('Billboard mode');
export const clickAudio = () => {
  _clickAudio.volume = 0.25;
  playAudio(_clickAudio);
};
export const slideAudio = () => {
  _slideAudio.volume = 0.25;
  playAudio(_slideAudio);
};
export const desatAudio = () => speak('Desaturation mode');
export const toonAudio = () => speak('Cartoon mode');
export const rgbAudio = () => speak('Color filter mode');
export const tvAudio = () => speak('TV mode');
