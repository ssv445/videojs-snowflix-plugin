import * as THREE from 'three';
import Draggable from 'draggable';
import TWEEN from '@tweenjs/tween.js';

import { CONSTANTS } from '../constants';
// Vite handles this import as URL to the asset in dist/assets/models/
import tvFile from '../../public/tv/tv.glb?url';
import { appState, toggleSwitch, tvAudio, saveUserData, logSnowflix } from '../utils';

class TV {
  lookAtPosition;
  pointLight;
  debugGui;
  material;
  tvModel;
  scene;
  plane;

  isActive;

  constructor(scene, plane, ambient, loaders, camera, debugGui) {
    this.material = plane.material;
    this.projectAmbient = ambient;
    this.debugGui = debugGui;
    this.camera = camera;
    this.plane = plane;
    this.scene = scene;

    this.initialPosition = new THREE.Vector3(0, 0.2, 1.5);
    this.lookAtPosition = new THREE.Vector3(0.0, 0.15, 0);
    this.goToPosition = new THREE.Vector3(0, 0, 1.5);
    this.slowAnimation = 2400;
    this.fastAnimation = 600;
    this.roughness = 1;

    this.isActive = false;

    this.loadFiles(loaders);
  }

  render() {
    if (this.lookAtPosition) {
      this.updateLookAt();
      TWEEN.update();
    }
  }

  updateLookAt() {
    this.camera.lookAt(this.lookAtPosition);
  }

  toggle(isActive) {
    this.isActive = isActive;
    if (this.isActive) {
      // this.camera.position.set(0.2395, 0.2395, 1.5);

      this.camera.position.copy(this.initialPosition);
      this.camera.rotation.set(0, 0, 0);
      this.material.map.flipY = false;
      this.tvModel.visible = true;
      this.plane.visible = false;
      tvAudio();
      logSnowflix('TV');
    } else {
      this.material.map.flipY = true;
      this.tvModel.visible = false;
      this.plane.visible = true;
    }

    this.toggleLights();
  }

  toggleLights() {
    if (this.isActive) {
      if (appState.tvIsDaylight) {
        this.material.emissiveIntensity = 0;
        this.pointLight.position.set(-1.2, 24.8, 1.7);
        this.pointLight.intensity = 5;
        this.tvAmbient.intensity = 0.9;
      } else {
        this.material.emissiveIntensity = 0.804;
        this.pointLight.position.set(-1.2, 7.5, -0.9);
        this.pointLight.intensity = 0.86;
        this.tvAmbient.intensity = 0.4;
      }
      this.projectAmbient.visible = false;
      this.pointLight.visible = true;
      this.tvAmbient.visible = true;
    } else {
      this.material.emissiveIntensity = 0;
      this.tvAmbient.intensity = 1;
      this.projectAmbient.visible = true;
      this.pointLight.visible = false;
      this.tvAmbient.visible = false;
    }
  }

  loadFiles(loaders) {
    loaders.gltfLoader.load(
      tvFile,
      (model) => {
        this.setupModel(model);
        this.initUI();
        /// #if DEBUG
        this.initDebugUI();
        /// #endif
      },
      null,
      (error) => {
        console.error(error);
      }
    );
  }

  setupModel(model) {
    this.tvModel = model.scene;
    this.tvModel.traverse((mesh) => {
      if (mesh instanceof THREE.Mesh && mesh.name === CONSTANTS.TV_SCREEN_NAME) {
        mesh.material = this.material;
      }
    });

    this.tvAmbient = new THREE.AmbientLight(0xffffff);
    this.pointLight = new THREE.PointLight(0xfbf2c3);

    this.pointLight.visible = false;
    this.tvAmbient.visible = false;

    this.scene.add(this.pointLight);
    this.scene.add(this.tvAmbient);
    this.scene.add(this.tvModel);

    this.toggle(false);
  }

  playAnimation() {
    let easing = TWEEN.Easing.Cubic.InOut;
    let duration = this.fastAnimation;
    if (this.tween?._isPlaying) {
      easing = TWEEN.Easing.Quadratic.Out;
      duration = this.slowAnimation;
      this.tween.stop();
    }
    this.tween = new TWEEN.Tween(this.camera.position)
      .to(this.goToPosition, duration)
      .easing(easing)
      .onUpdate(() => this.updateLookAt())
      .start();
  }

  setLightMode(event) {
    appState.tvIsDaylight = event.target.checked;
    if (this.isActive) this.toggleLights();
    toggleSwitch(event);
    saveUserData();
    logSnowflix('TV_LIGHTS', appState.tvIsDaylight);
  }

  onCursorDrag(element, x, y, event) {
    const position = this.getCursorPosition(event);
    const posX = (0.5 - position.x) * -2.45;
    const posY = (position.y - 0.6) * -0.95;

    this.goToPosition.set(posX, posY);
    this.initialPosition.copy(this.goToPosition);
    appState.tvGoToPosition = { x: posX, y: posY };
    appState.tvCursorPosition = { x, y };
    this.playAnimation();
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

    position.x = Math.min(Math.max(position.x, 0), 1);
    position.y = Math.min(Math.max(position.y, -0.05), 0.9);

    return position;
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
      if (appState.tvCursorPosition) {
        this.drag.set(appState.tvCursorPosition.x, appState.tvCursorPosition.y);
      } else {
        this.drag.set((rect.width - 32) / 2, (rect.height - 40) / 2);
        appState.tvCursorPosition = this.drag.get();
      }
    } else {
      setTimeout(() => {
        this.initCursorDrag();
      }, 20);
    }
  }

  restoreState() {
    if (appState.tvGoToPosition) {
      this.initialPosition.set(appState.tvGoToPosition.x, appState.tvGoToPosition.y);
    }
    if (!appState.tvIsDaylight) {
      this.switch.checked = false;
    }
  }

  initUI() {
    this.controller = document.getElementById('snowflix-tv-controller');
    this.cursor = document.getElementById('snowflix-tv-cursor');
    this.switch = document.getElementById('snowflix-tv-switch');

    this.switch.addEventListener('change', this.setLightMode.bind(this));
    this.initCursorDrag();

    window.addEventListener('resize', this.initCursorDrag.bind(this));
  }

  /// #if DEBUG
  initDebugUI() {
    const folder = this.debugGui.addFolder('TV');

    const lookAtFolder = folder.addFolder('Camera Target');
    lookAtFolder.add(this.lookAtPosition, 'x', -15, 20, 0.000001).name('Position X');
    lookAtFolder.add(this.lookAtPosition, 'y', -15, 20, 0.000001).name('Position Y');
    lookAtFolder.add(this.lookAtPosition, 'z', -15, 20, 0.000001).name('Position Z');

    const lightFolder = folder.addFolder('Lights');

    lightFolder
      .add(appState, 'tvIsDaylight')
      .name('IsDaylight')
      .onChange(() => this.toggleLights());

    lightFolder.add(this.material, 'emissiveIntensity', 0, 1, 0.001);
    lightFolder.addLight('Ambient Light', this.tvAmbient);
    lightFolder.addLight('Point Light', this.pointLight);

    const tvFolder = folder.addFolder('TV Model');
    tvFolder.add(this.tvModel.position, 'x', -15, 15, 0.000001).name('Model X');
    tvFolder.add(this.tvModel.position, 'y', -15, 15, 0.000001).name('Model Y');
    tvFolder.add(this.tvModel.position, 'z', -15, 15, 0.000001).name('Model Z');
    tvFolder.add(this.tvModel.rotation, 'x', -15, 15, 0.000001).name('Rotation X');
    tvFolder.add(this.tvModel.rotation, 'y', -15, 15, 0.000001).name('Rotation Y');
    tvFolder.add(this.tvModel.rotation, 'z', -15, 15, 0.000001).name('Rotation Z');
  }
  /// #endif
}

export { TV };
