import { DESAT_LEVELS, SCENE } from '../constants';
import { appState, toggleLargeSlider, desatAudio, saveUserData, logSnowflix } from '../utils';

class Desat {
  debugGui;
  saturation;
  uniforms;
  isActive;

  constructor(uniforms, debugGui) {
    this.debugGui = debugGui;
    this.uniforms = uniforms;

    this.saturation = DESAT_LEVELS[3];
    this.uniforms.saturation = { value: this.saturation };

    this.initUI();
    /// #if DEBUG
    this.initDebugUI();
    /// #endif
  }

  update() {
    this.uniforms.saturation.value = this.saturation;
  }

  setSaturation(event) {
    this.lastIndex = parseInt(event.target.value);
    const saturation = DESAT_LEVELS[this.lastIndex];
    this.saturation = this.saturation === saturation ? DESAT_LEVELS[3] : saturation;
    appState.desatIndex = this.lastIndex;

    this.update();
    toggleLargeSlider(event.target);
    saveUserData();
    logSnowflix('DESAT', this.saturation);
  }

  enable() {
    const index = this.lastIndex ? this.lastIndex : 1;
    this.saturation = DESAT_LEVELS[index];
    this.uniforms.saturation.value = this.saturation;
    appState.desatIndex = index;
    this.slider.value = index;
    toggleLargeSlider(this.slider);
    desatAudio();
  }

  disable() {
    this.saturation = DESAT_LEVELS[3];
    this.uniforms.saturation.value = this.saturation;
    this.slider.value = 3;
    toggleLargeSlider(this.slider);
  }

  initUI() {
    this.slider = document.getElementById('snowflix-desat-slider');
    this.slider.addEventListener('change', this.setSaturation.bind(this));
  }

  restoreState(desatIndex) {
    if (appState.currentScene === SCENE.Desat) {
      this.saturation = DESAT_LEVELS[desatIndex];
      this.uniforms.saturation.value = this.saturation;
      this.slider.value = desatIndex;
      toggleLargeSlider(this.slider);
    }
  }

  /// #if DEBUG
  initDebugUI() {
    const folder = this.debugGui.addFolder('Desat');
    folder
      .add(this, 'saturation', 0, 2, 0.05)
      .name('Saturation')
      .onChange(() => {
        this.update();
      });
  }
  /// #endif
}

export { Desat };
