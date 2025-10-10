import * as THREE from 'three';
import Draggable from 'draggable';

import { appState, toggleSwitch, flashlightAudio, saveUserData, logSnowflix } from '../utils';
import { ASPECT_RATIOS } from '../constants';

class Flashlight {
  isLargeLight;
  spotLight;
  debugGui;
  ambient;
  scene;

  isActive;

  constructor(scene, ambient, aspectRatio, debugGui) {
    this.debugGui = debugGui;
    this.ambient = ambient;
    this.scene = scene;

    this.spotLight = new THREE.SpotLight(0xffffff, 0.8, 0, 0.22, 0.15);
    this.spotLight.position.set(0, 0, 10);
    this.target = new THREE.Object3D();

    this.spotLight.target = this.target;

    this.scene.add(this.target);
    this.scene.add(this.spotLight);

    this.setAspectRatio(aspectRatio);
    this.toggle(false);

    this.initUI();
    /// #if DEBUG
    this.initDebugUI();
    /// #endif
  }

  toggle(isActive) {
    this.isActive = isActive;
    if (this.isActive) {
      this.ambient.intensity = 0.2;
      this.spotLight.visible = true;
      flashlightAudio();
      logSnowflix('FLASHLIGHT');
    } else {
      this.ambient.intensity = 1;
      this.spotLight.visible = false;
    }

    this.toggleLights();
  }

  toggleLights() {
    this.spotLight.angle = appState.flashlightIsLarge ? this.lightParams.large : this.lightParams.small;
  }

  onCursorDrag(element, x, y, event) {
    const position = this.getCursorPosition(event);
    const posX = (0.5 - position.x) * this.lightParams.x;
    const posY = (position.y - 0.5) * this.lightParams.y;
    this.target.position.set(posX, posY);
    appState.flashlightPosition = { x: posX, y: posY };
    appState.flashlightTarget = { x, y };
  }

  getCursorPosition(event) {
    const rect = this.controller.getBoundingClientRect();
    let clientX;
    let clientY;
    if (!event.clientX) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const position = {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };

    position.x = Math.min(Math.max(position.x, 0.2), 0.8);
    position.y = Math.min(Math.max(position.y, 0.18), 0.75);

    return position;
  }

  setAspectRatio(aspectRatio) {
    switch (aspectRatio) {
      case ASPECT_RATIOS.ASPECT_4x3:
        this.lightParams = {
          large: 0.12,
          small: 0.08,
          x: -6.5,
          y: -5,
        };
        break;
      case ASPECT_RATIOS.ASPECT_16x9:
        this.lightParams = {
          large: 0.35,
          small: 0.22,
          x: -26,
          y: -18,
        };

        break;
      case ASPECT_RATIOS.ASPECT_21x10:
        this.lightParams = {
          large: 0.4,
          small: 0.3,
          x: -40,
          y: -20,
        };
        break;
    }
  }

  initCursorDrag() {
    const rect = this.controller?.getBoundingClientRect();
    if (rect?.width > 0) {
      var options = {
        onDrag: this.onCursorDrag.bind(this),
        onDragEnd: saveUserData,
        limit: this.controller,
        setCursor: true,
      };

      this.drag = new Draggable(this.cursor, options);
      if (appState.flashlightTarget) {
        this.drag.set(appState.flashlightTarget.x, appState.flashlightTarget.y);
      } else {
        this.drag.set((rect.width - 38) / 2, (rect.height - 42) / 2);
        appState.flashlightTarget = this.drag.get();
      }
    } else {
      setTimeout(() => {
        this.initCursorDrag();
      }, 20);
    }
  }

  setLightSize(event) {
    appState.flashlightIsLarge = event.target.checked;
    this.toggleLights();
    toggleSwitch(event);
    saveUserData();
    logSnowflix('FLASHLIGHT_SIZE', appState.flashlightIsLarge);
  }

  restoreState() {
    if (appState.flashlightPosition) {
      this.target.position.set(appState.flashlightPosition.x, appState.flashlightPosition.y);
    }
    if (!appState.flashlightIsLarge) {
      this.switch.checked = false;
    }
  }

  initUI() {
    this.controller = document.getElementById('snowflix-flashlight-controller');
    this.cursor = document.getElementById('snowflix-flashlight-cursor');
    this.switch = document.getElementById('snowflix-flashlight-switch');

    this.switch.addEventListener('change', this.setLightSize.bind(this));
    this.initCursorDrag();

    window.addEventListener('resize', this.initCursorDrag.bind(this));
  }

  /// #if DEBUG
  initDebugUI() {
    const folder = this.debugGui.addFolder('Flashlight');
    folder.addLight('Spot Light', this.spotLight);

    folder
      .add(appState, 'flashlightIsLarge')
      .name('IsLarge')
      .onChange(() => this.toggle(true));

    folder.add(this.lightParams, 'x', -50, 50, 0.1).name('X');
    folder.add(this.lightParams, 'y', -30, 30, 0.1).name('Y');
  }
  /// #endif
}

export { Flashlight };
