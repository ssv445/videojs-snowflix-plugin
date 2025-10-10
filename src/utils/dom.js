import { CONSTANTS } from '../constants';
import { clickAudio, slideAudio } from './audio';

// Simple DOM utils
const Utils = {
  Dom: {
    addClassName: (el, className) => el?.classList.add(className),
    removeClassName: (el, className) => el?.classList.remove(className),
  },
};

export const toggleSwitch = (event) => {
  const switchElement = event.target.parentElement;
  const isActive = event.target.checked;
  const offElement = switchElement.nextElementSibling;
  const onElement = switchElement.previousElementSibling;
  if (isActive) {
    Utils.Dom.addClassName(offElement, CONSTANTS.ACTIVE_CLASS);
    Utils.Dom.removeClassName(onElement, CONSTANTS.ACTIVE_CLASS);
  } else {
    Utils.Dom.addClassName(onElement, CONSTANTS.ACTIVE_CLASS);
    Utils.Dom.removeClassName(offElement, CONSTANTS.ACTIVE_CLASS);
  }
  clickAudio();
};

export const toggleSmallSlider = (event) => {
  const slider = event.target;
  const header = slider.parentElement.parentElement.firstElementChild;
  const firstIcon = slider.previousElementSibling;
  const secondIcon = slider.nextElementSibling;
  const firstTitle = header.firstElementChild;
  const secondTitle = header.lastElementChild;
  Utils.Dom.removeClassName(firstIcon, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(firstIcon, CONSTANTS.SEMI_ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondIcon, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondIcon, CONSTANTS.SEMI_ACTIVE_CLASS);
  Utils.Dom.removeClassName(firstTitle, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(firstTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondTitle, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
  slider.className = '';
  const value = parseInt(slider.value);
  switch (value) {
    case 0:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_LEFT);
      Utils.Dom.addClassName(firstIcon, CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.addClassName(firstTitle, CONSTANTS.ACTIVE_CLASS);
      break;
    case 1:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_CENTER);
      Utils.Dom.addClassName(firstIcon, CONSTANTS.SEMI_ACTIVE_CLASS);
      Utils.Dom.addClassName(firstTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
      Utils.Dom.addClassName(secondIcon, CONSTANTS.SEMI_ACTIVE_CLASS);
      Utils.Dom.addClassName(secondTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
      break;
    case 2:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_RIGHT);
      Utils.Dom.addClassName(secondIcon, CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.addClassName(secondTitle, CONSTANTS.ACTIVE_CLASS);
      break;
  }
  slideAudio();
};

export const toggleLargeSlider = (slider) => {
  const header = slider.parentElement.parentElement.firstElementChild;
  const firstTitle = header.firstElementChild;
  const secondTitle = header.lastElementChild;
  Utils.Dom.removeClassName(firstTitle, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(firstTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
  Utils.Dom.removeClassName(firstTitle, CONSTANTS.BARELY_ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondTitle, CONSTANTS.ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
  Utils.Dom.removeClassName(secondTitle, CONSTANTS.BARELY_ACTIVE_CLASS);
  slider.className = '';
  const value = parseInt(slider.value);
  switch (value) {
    case 0:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_LEFT);
      Utils.Dom.addClassName(firstTitle, CONSTANTS.ACTIVE_CLASS);
      break;
    case 1:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_CENTER_LEFT);
      Utils.Dom.addClassName(firstTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
      Utils.Dom.addClassName(secondTitle, CONSTANTS.BARELY_ACTIVE_CLASS);
      break;
    case 2:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_CENTER_RIGHT);
      Utils.Dom.addClassName(firstTitle, CONSTANTS.BARELY_ACTIVE_CLASS);
      Utils.Dom.addClassName(secondTitle, CONSTANTS.SEMI_ACTIVE_CLASS);
      break;
    case 3:
      Utils.Dom.addClassName(slider, CONSTANTS.SLIDER_RIGHT);
      Utils.Dom.addClassName(secondTitle, CONSTANTS.ACTIVE_CLASS);
      break;
  }
  slideAudio();
};

export const clearButtons = (selector) => {
  const buttons = document.querySelectorAll(selector);
  for (let i = 0; i < buttons.length; i++) {
    Utils.Dom.removeClassName(buttons[i], CONSTANTS.ACTIVE_CLASS);
  }
};
