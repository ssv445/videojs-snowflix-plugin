import * as THREE from 'three';
import { CONSTANTS, TOON_MODES, ASPECT_RATIOS } from '../constants';
import { appState, clickAudio, toonAudio, clearButtons, saveUserData, logSnowflix } from '../utils';

// Simple DOM utils
const Utils = {
  Dom: {
    addClassName: (el, className) => el?.classList.add(className),
  },
};

class Toon {
  uniforms;
  toonNeighbour;
  toonEdges;
  invert;
  isActive;

  constructor(uniforms, plane, aspectRatio) {
    this.uniforms = uniforms;
    this.plane = plane;

    this.isActive = false;
    this.isContours = true;
    this.isInverse = false;
    this.isColors = true;

    this.toonExposure = CONSTANTS.TOON_EXPOSURE;
    this.toonContrast = CONSTANTS.TOON_CONTRAST;
    this.toonBrightness = CONSTANTS.TOON_BRIGHTNESS;
    this.contourColor = CONSTANTS.TOON_CONTOUR_COLOR;
    this.setAspectRatio(aspectRatio);

    this.setupToon();
    this.initUI();
  }

  setupToon() {
    this.uniforms.isToon = { value: this.isActive };
    this.uniforms.isColors = { value: this.isColors };
    this.uniforms.isInverse = { value: this.isInverse };
    this.uniforms.isContours = { value: this.isContours };
    this.uniforms.contourColor = { value: this.contourColor };
    this.uniforms.toonExposure = { value: this.toonExposure };
    this.uniforms.toonContrast = { value: this.toonContrast };
    this.uniforms.toonBrightness = { value: this.toonBrightness };
    this.uniforms.contourStrength = { value: 1 - this.contourStrength };
  }

  toggle(isActive) {
    this.isActive = isActive;
    this.update();
  }

  update() {
    this.uniforms.contourStrength.value = 1 - this.contourStrength;
    this.uniforms.toonBrightness.value = this.toonBrightness;
    this.uniforms.contourColor.value = this.contourColor;
    this.uniforms.toonContrast.value = this.toonContrast;
    this.uniforms.toonExposure.value = this.toonExposure;

    this.uniforms.isContours.value = this.isContours;
    this.uniforms.isInverse.value = this.isInverse;
    this.uniforms.isColors.value = this.isColors;
    this.uniforms.isToon.value = this.isActive;
  }

  setToonMode(mode) {
    const toonMode = parseInt(mode);
    appState.toonMode = appState.toonMode === toonMode ? TOON_MODES.Default : toonMode;
    switch (appState.toonMode) {
      case TOON_MODES.Default:
        this.isActive = false;
        this.toggle(false);
        clearButtons('#snowflix-toon-container .snowflix-toon-option');
        break;
      case TOON_MODES.Color:
        logSnowflix('TOON', { toonMode: 'Color' });
        this.contourColor = new THREE.Color(0, 0, 0);
        this.isInverse = false;
        this.isColors = true;
        this.isActive = true;
        this.toggle(true);
        break;
      case TOON_MODES.Contours:
        logSnowflix('TOON', { toonMode: 'Contours' });
        this.contourColor = new THREE.Color(0, 0.15, 0);
        this.isInverse = false;
        this.isColors = false;
        this.isActive = true;
        this.toggle(true);
        break;
      case TOON_MODES.Inverse:
        logSnowflix('TOON', { toonMode: 'Inverse' });
        this.contourColor = new THREE.Color(0.15, 0.15, 0.33);
        this.isInverse = true;
        this.isColors = false;
        this.isActive = true;
        this.toggle(true);
        break;
    }
  }

  clickToonMode(button, toonMode) {
    clearButtons('#snowflix-toon-container .snowflix-toon-option');
    this.setToonMode(toonMode);
    this.lastButton = button;
    saveUserData();
    clickAudio();
    if (this.isActive) {
      Utils.Dom.addClassName(button, CONSTANTS.ACTIVE_CLASS);
    }
  }

  setAspectRatio(aspectRatio) {
    this.contourStrength = aspectRatio === ASPECT_RATIOS.ASPECT_4x3 ? 0.4 : 0.75;
  }

  restoreState() {
    switch (appState.toonMode) {
      case TOON_MODES.Color:
        this.colorBtn.click();
        break;
      case TOON_MODES.Inverse:
        this.inverseBtn.click();
        break;
      case TOON_MODES.Contours:
        this.contoursBtn.click();
        break;
    }
  }

  initUI() {
    const listen = (button, toonMode) => {
      button.addEventListener('click', this.clickToonMode.bind(this, button, toonMode));
    };

    this.contoursBtn = document.getElementById('toon-contours-btn');
    this.inverseBtn = document.getElementById('toon-inverse-btn');
    this.colorBtn = document.getElementById('toon-color-btn');

    listen(this.contoursBtn, TOON_MODES.Contours);
    listen(this.inverseBtn, TOON_MODES.Inverse);
    listen(this.colorBtn, TOON_MODES.Color);
  }

  enable() {
    this.lastButton ? this.lastButton.click() : this.colorBtn.click();
    toonAudio();
  }
}

export { Toon };
