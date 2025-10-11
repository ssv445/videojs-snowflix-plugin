// Vite handles these imports as URLs to the assets in dist/assets/audio/
import slide from '../../public/audio/slide.mp3?url';
import click from '../../public/audio/click.mp3?url';

import { appState } from './state';

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
      console.warn('Speech synthesis not supported in this browser');
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
      console.log('Speaking:', text);

      utterance.onstart = () => {
        console.log('Speech started:', text);
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event);
      };

      utterance.onend = () => {
        console.log('Speech ended:', text);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak function:', error);
    }
  } else {
    console.log('Audio is muted, not speaking:', text);
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
