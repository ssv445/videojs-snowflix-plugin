import * as THREE from 'three';
import { CONSTANTS, RGB_MODES } from '../constants';
import { appState, rgbAudio, clickAudio, clearButtons, saveUserData, logSnowflix } from '../utils';

// Simple DOM utils
const Utils = {
  Dom: {
    addClassName: (el, className) => el?.classList.add(className),
    hasClassName: (el, className) => el?.classList.contains(className),
  },
};

class Rgb {
  debugGui;
  hueActive;
  uniforms;
  plane;
  hue;

  constructor(uniforms, plane, debugGui) {
    this.debugGui = debugGui;
    this.uniforms = uniforms;
    this.plane = plane;

    this.currentColor = new THREE.Color(appState.rgbMode.hex);
    this.hueActive = false;
    this.hue = 0.0;

    this.uniforms.hueActive = { value: this.hueActive };
    this.uniforms.hue = { value: this.hue };

    this.initUI();
    /// #if DEBUG
    this.initDebugUI();
    /// #endif
  }

  update() {
    this.plane.material.color.set(this.currentColor);
    this.uniforms.hueActive.value = this.hueActive;
    this.uniforms.hue.value = this.hue / 360;
  }

  setColor(colorMode) {
    // debugger;
    appState.rgbMode = appState.rgbMode === colorMode ? RGB_MODES.Default : colorMode;
    this.hueActive = colorMode.hue !== -1 && colorMode.hue !== this.hue;
    this.currentColor.set(appState.rgbMode.hex);
    this.hue = appState.rgbMode.hue;
    this.update();

    logSnowflix('RGB', appState.rgbMode);
  }

  clickRgb(button, rgbColor) {
    this.setColor(rgbColor);
    const isActive = Utils.Dom.hasClassName(button, CONSTANTS.ACTIVE_CLASS);
    clearButtons('#snowflix-rgb-container .snowflix-rgb-option');
    this.lastButton = button;
    saveUserData();
    clickAudio();
    if (!isActive) {
      Utils.Dom.addClassName(button, CONSTANTS.ACTIVE_CLASS);
    }
  }

  restoreState() {
    const hex = appState.rgbMode.hex;
    const hue = appState.rgbMode.hue;
    if (hex === RGB_MODES.Red.hex && hue === RGB_MODES.Red.hue) {
      this.lastButton = this.redBtn;
    } else if (hex === RGB_MODES.Blue.hex && hue === RGB_MODES.Blue.hue) {
      this.lastButton = this.blueBtn;
    } else if (hex === RGB_MODES.Green.hex && hue === RGB_MODES.Green.hue) {
      this.lastButton = this.greenBtn;
    } else if (hex === RGB_MODES.RedBlue.hex && hue === RGB_MODES.RedBlue.hue) {
      this.lastButton = this.redBlueBtn;
    } else if (hex === RGB_MODES.RedGreen.hex && hue === RGB_MODES.RedGreen.hue) {
      this.lastButton = this.redGreenBtn;
    } else if (hex === RGB_MODES.GreenBlue.hex && hue === RGB_MODES.GreenBlue.hue) {
      this.lastButton = this.greenBlueBtn;
    }
  }

  initUI() {
    const listen = (button, rgbColor) => {
      button.addEventListener('click', this.clickRgb.bind(this, button, rgbColor));
    };

    this.greenBlueBtn = document.getElementById('rgb-green-blue-btn');
    this.redGreenBtn = document.getElementById('rgb-red-green-btn');
    this.redBlueBtn = document.getElementById('rgb-red-blue-btn');
    this.greenBtn = document.getElementById('rgb-green-btn');
    this.blueBtn = document.getElementById('rgb-blue-btn');
    this.redBtn = document.getElementById('rgb-red-btn');

    listen(this.greenBlueBtn, RGB_MODES.GreenBlue);
    listen(this.redGreenBtn, RGB_MODES.RedGreen);
    listen(this.redBlueBtn, RGB_MODES.RedBlue);
    listen(this.greenBtn, RGB_MODES.Green);
    listen(this.blueBtn, RGB_MODES.Blue);
    listen(this.redBtn, RGB_MODES.Red);
  }

  enable() {
    this.lastButton ? this.lastButton.click() : this.greenBtn.click();
    rgbAudio();
  }

  disable() {
    clearButtons('#snowflix-rgb-container .snowflix-rgb-option');
    this.currentColor.set(RGB_MODES.Default.hex);
    appState.rgbMode = RGB_MODES.Default;
    this.hue = appState.rgbMode.hue;
    this.hueActive = false;
    this.update();
  }

  /// #if DEBUG
  initDebugUI() {
    const folder = this.debugGui.addFolder('Rgb');
    folder
      .add(this, 'hueActive', 0, 360, 1)
      .name('Hue Active')
      .onChange(() => {
        this.update();
      });

    folder
      .add(this, 'hue', 0, 360, 1)
      .name('Hue')
      .onChange(() => {
        this.update();
      });
  }
  /// #endif
}

export { Rgb };
