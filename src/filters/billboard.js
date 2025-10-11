import * as THREE from 'three';

import { appState, toggleSwitch, toggleSmallSlider, saveUserData, logSnowflix, billboardAudio } from '../utils';
import { CONSTANTS, DIRECTIONS, PRISM_COUNTS, SPEED_MODES } from '../constants';
import { injectShaderCode } from '../shaders';

// Vite inlines these as base64 data URLs in the bundle
import nightBackground from '../../public/images/night-billboard.jpeg';
import dayBackground from '../../public/images/day-billboard.jpeg';
import billboardFile from '../../public/billboard/billboard.glb';
import prismFile from '../../public/billboard/prism.glb';

// Simple DOM utils
const Utils = {
  Dom: {
    addClassName: (el, className) => el?.classList.add(className),
  },
};

class Billboard {
  freezeTexture;
  currentFace;
  prismCount;
  prismArray;
  animation;
  billboard;
  spotLights;
  uniforms;
  material;
  mixers;
  camera;
  plane;
  prism;
  scene;

  animationDirection;
  animationDuration;
  animationInterval;
  animationDelay;
  animationIndex;
  isSpinning;
  interval;
  isActive;
  reset;

  constructor(uniforms, scene, plane, projectAmbient, loaders, camera) {
    this.isSpinning = false;
    this.isReverse = true;
    this.isActive = false;
    this.reset = false;

    this.projectAmbient = projectAmbient;
    this.prismCount = PRISM_COUNTS[1];
    this.material = plane.material;
    this.uniforms = uniforms;
    this.camera = camera;
    this.plane = plane;
    this.scene = scene;

    this.offsetX = 3;
    this.currentFace = 1;
    this.animationIndex = 0;
    this.billboardWidth = 10;
    this.emissiveIntensity = 1;

    const defaultSpeed = SPEED_MODES[1];

    this.animationDirection = defaultSpeed.animationDirection;
    this.animationInterval = defaultSpeed.animationInterval;
    this.animationDuration = defaultSpeed.animationDuration;
    this.animationDelay = defaultSpeed.animationDelay;

    this.freezeTexture = new THREE.Texture();
    this.freezeTexture.flipY = false;

    this.prismArray = [];
    this.mixers = [];

    this.loadFiles(loaders);
  }

  render(time) {
    if (this.mixers) {
      this.mixers.forEach((mixer) => mixer.update(time));
    }
  }

  toggle(isActive) {
    this.isActive = isActive;
    if (this.isActive) {
      this.camera.position.set(3.4884, 0.1, 10);
      this.camera.rotation.set(0, -0.08, 0);
      this.material.map.flipY = false;
      this.billboard.visible = true;
      this.plane.visible = false;
      this.setAnimation();
      this.togglePrisms(true);
      billboardAudio();
      logSnowflix('BILLBOARD');
    } else {
      this.material.map.flipY = true;
      this.billboard.visible = false;
      this.scene.background = null;
      this.plane.visible = true;
      clearInterval(this.interval);
      this.togglePrisms(false);
    }

    this.material.map.needsUpdate = true;
    this.toggleLights();
  }

  toggleLights() {
    if (this.isActive) {
      this.ambient.visible = true;
      this.projectAmbient.visible = false;
      this.spotLight.visible = true;
      if (appState.billboardIsDayLight) {
        this.scene.background = this.dayBackground;
        this.spotLight.color.setHex(0xffe5d3);
        this.ambient.color.setHex(0xffe6e6);
        this.spotLight.intensity = 1;
        this.ambient.intensity = 0.5;
        this.nightLight_1.visible = false;
        this.nightLight_2.visible = false;
        this.emissiveIntensity = 1;
      } else {
        this.scene.background = this.nightBackground;
        this.spotLight.color.setHex(0x7d93ff);
        this.ambient.color.setHex(0x8d8dff);
        this.spotLight.intensity = 0.4;
        this.ambient.intensity = 0;
        this.nightLight_1.visible = true;
        this.nightLight_2.visible = true;
        this.emissiveIntensity = 0;
      }
      this.setEmissive();
    } else {
      this.ambient.visible = false;
      this.projectAmbient.visible = true;
      this.spotLight.visible = false;
      this.nightLight_1.visible = false;
      this.nightLight_2.visible = false;
    }
  }

  async loadFiles(loaders) {
    const prismData = await loaders.gltfLoader.loadAsync(prismFile);
    const billboardData = await loaders.gltfLoader.loadAsync(billboardFile);
    this.dayBackground = await loaders.textureLoader.loadAsync(dayBackground);
    this.nightBackground = await loaders.textureLoader.loadAsync(nightBackground);

    this.setupBillboard(billboardData);
    this.setupLights();
    this.initUI();
    this.toggle(false);

    this.animation = prismData.animations[0];
    this.prism = prismData.scene.children[0];
    this.setupPrism();
    this.initScene();
  }

  setupPrism() {
    //*** Original model has static colors, changes the material to an edited MeshStandardMaterial.
    //*** Does not overwrite blue border material of top and bottom part of the model.
    this.prism.traverse((mesh) => {
      if (mesh instanceof THREE.Mesh) {
        if (mesh.name !== CONSTANTS.PRISM_EDGE_NAME) {
          mesh.material = this.material;
        } else {
          mesh.material = new THREE.Color(0xbbb);
        }
      }
    });
  }

  setupBillboard(model) {
    this.billboard = model.scene;
    this.billboard.position.set(5, 0, 0);
    this.scene.add(this.billboard);
  }

  setupLights() {
    this.ambient = new THREE.AmbientLight();

    const spotLightTarget_1 = new THREE.Object3D();
    const spotLightTarget_2 = new THREE.Object3D();
    spotLightTarget_1.position.set(1.55, 1, 0);
    spotLightTarget_2.position.set(7.25, 1, 0);

    this.spotLight = new THREE.SpotLight(0xffffff, 1.5, 0, 1, 0);
    this.spotLight.position.set(100, 50, 160);

    this.nightLight_1 = new THREE.SpotLight(0xfae0b6, 1.5, 0, 1, 0.85);
    this.nightLight_2 = new THREE.SpotLight(0xfae0b6, 1.5, 0, 1, 0.85);

    this.nightLight_1.position.set(1.5, 3.2, 2.4);
    this.nightLight_2.position.set(7.5, 3.3, 2.2);

    this.nightLight_1.target = spotLightTarget_1;
    this.nightLight_2.target = spotLightTarget_2;

    this.scene.add(spotLightTarget_1);
    this.scene.add(spotLightTarget_2);

    this.scene.add(this.spotLight);
    this.scene.add(this.ambient);

    this.scene.add(this.nightLight_1);
    this.scene.add(this.nightLight_2);

    this.toggleLights();
  }

  initScene() {
    this.prismArray = [];
    this.mixers = [];

    const prismScale = this.billboardWidth / this.prismCount;
    const positions = this.getPositions(this.prismCount);
    for (let i = 0; i < this.prismCount; i++) {
      const prism = this.prism.clone();
      const offset = i / this.offsetX;

      const side_1 = prism.children[1];
      const side_2 = prism.children[2];
      const side_3 = prism.children[3];

      side_1.geometry = side_1.geometry.clone();
      side_2.geometry = side_2.geometry.clone();
      side_3.geometry = side_3.geometry.clone();

      side_1.geometry.setAttribute('uv', this.mapTexture(side_1.geometry, offset, 1));
      side_2.geometry.setAttribute('uv', this.mapTexture(side_2.geometry, offset, 2));
      side_3.geometry.setAttribute('uv', this.mapTexture(side_3.geometry, offset, 3));

      prism.position.set(i * prismScale + positions.xPos, 0, positions.zPos);
      prism.scale.set(prismScale, 1, prismScale);
      prism.visible = false;

      const mixer = new THREE.AnimationMixer(prism);
      this.mixers.push(mixer);

      this.scene.add(prism);
      this.prismArray.push(prism);
    }

    this.reset = false;
  }

  setAnimation() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.playAnimation();
    }, this.animationInterval);
  }

  mapTexture(geometry, offset, side) {
    const attribute = geometry.getAttribute('uv');
    const uvs = attribute.array;
    offset -= (side / 3) % 1;
    for (let i = 0; i < uvs.length; i += 2) {
      uvs[i] = ((uvs[i] + offset) * 3) / this.prismCount;
      uvs[i + 1] = Math.min(uvs[i + 1] * 2.5, 1);
    }

    return attribute;
  }

  playAnimation() {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;
    const mixers = [...this.mixers];

    this.freezeSide(this.currentFace);
    this.spinSides(mixers);
    const stop = mixers.length * this.animationDelay + this.animationDuration * 1000;
    setTimeout(() => {
      this.unfreezeSide(this.currentFace);
      mixers.forEach((mixer) => mixer.clipAction(this.animation).stop());
      this.isSpinning = false;
    }, stop);
  }

  spinSides(_mixers) {
    let mixers;
    switch (this.animationDirection) {
      case DIRECTIONS.Forwards:
        mixers = _mixers;
        break;
      case DIRECTIONS.Backwards:
        mixers = _mixers.reverse();
        break;
      case DIRECTIONS.PingPong:
        mixers = ++this.animationIndex % 2 === 0 ? _mixers.reverse() : _mixers;
        break;
    }

    mixers.forEach((mixer, i) => {
      setTimeout(() => {
        const clip = mixer.clipAction(this.animation);
        clip.setDuration(this.animationDuration);
        clip.clampWhenFinished = true;
        clip.loop = THREE.LoopOnce;
        clip.play();
      }, i * this.animationDelay);
    });
  }

  freezeSide(sideIndex) {
    this.freezeTexture.image = this.material.map.image;
    //*** .clone() does not support onBeforeCompile shader injection, so must inject to the cloned material.
    const freezeMaterial = this.material.clone({ recursive: true });
    freezeMaterial.onBeforeCompile = (shader) => injectShaderCode(shader, this.uniforms);
    setTimeout(() => {
      this.prismArray.forEach((prism) => {
        const side = prism.children[sideIndex];
        side.material = freezeMaterial;

        side.material.map = this.freezeTexture;
        side.material.map.needsUpdate = true;
      });
    }, this.animationDelay * 2);
  }

  unfreezeSide(sideIndex) {
    this.prismArray.forEach((prism) => {
      prism.children[sideIndex].material = this.material;
    });
  }

  getPositions(prismCount) {
    switch (prismCount) {
      case 8:
        return { zPos: -0.05, xPos: 0.1 };
      case 12:
        return { zPos: 0.05, xPos: -0.1 };
      case 15:
        return { zPos: 0.05, xPos: -0.2 };
      default: {
        const xPos = prismCount > 15 ? prismCount - 15 : 0;
        return { zPos: 0.05, xPos: -0.2 + xPos * -0.01 };
      }
    }
  }

  clean() {
    if (this.reset) {
      return;
    }

    this.reset = true;
    this.prismArray.forEach((prism) => this.scene.remove(prism));

    this.initScene();
    this.togglePrisms(true);
  }

  togglePrisms(isVisible) {
    this.prismArray.forEach((prism) => (prism.visible = isVisible));
  }

  setLightMode(event) {
    appState.billboardIsDayLight = event.target.checked;
    if (this.isActive) this.toggleLights();
    toggleSwitch(event);
    saveUserData();
    logSnowflix('BILLBOARD_LIGHTS', appState.billboardIsDayLight);
  }

  setSpeedMode(event) {
    const speedMode = SPEED_MODES[event.target.value];
    appState.billboardSpeedMode = parseInt(event.target.value);

    this.animationDirection = speedMode.animationDirection;
    this.animationInterval = speedMode.animationInterval;
    this.animationDuration = speedMode.animationDuration;
    this.animationDelay = speedMode.animationDelay;

    this.playAnimation();
    this.setAnimation();
    toggleSmallSlider(event);
    saveUserData();
    logSnowflix('BILLBOARD_SPEED_MODE', speedMode);
  }

  setPrismCount(event) {
    this.prismCount = PRISM_COUNTS[event.target.value];
    appState.billboardPrismCount = parseInt(event.target.value);
    if (this.isActive) this.clean();
    toggleSmallSlider(event);
    saveUserData();
    logSnowflix('BILLBOARD_PRISM_COUNT', this.prismCount);
  }

  setEmissive() {
    this.billboard.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        if (child.name !== CONSTANTS.RIGHT_LIGHT && child.name !== CONSTANTS.LEFT_LIGHT) {
          material.emissiveIntensity = this.emissiveIntensity;
        } else {
          material.emissive = appState.billboardIsDayLight ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1);
        }
      }
    });
  }

  initUI() {
    this.switch = document.getElementById('snowflix-billboard-switch');
    this.speedSlider = document.getElementById('snowflix-speed-slider');
    this.piecesSlider = document.getElementById('snowflix-pieces-slider');

    this.switch.addEventListener('change', this.setLightMode.bind(this));
    this.speedSlider.addEventListener('change', this.setSpeedMode.bind(this));
    this.piecesSlider.addEventListener('change', this.setPrismCount.bind(this));
  }

  restoreState() {
    if (!appState.billboardIsDayLight) {
      this.switch.checked = false;
    }

    this.speedSlider.value = appState.billboardSpeedMode;
    switch (parseInt(appState.billboardSpeedMode)) {
      case 0:
        Utils.Dom.addClassName(this.speedSlider, CONSTANTS.SLIDER_LEFT);
        break;
      case 1:
        Utils.Dom.addClassName(this.speedSlider, CONSTANTS.SLIDER_CENTER);
        break;
      case 2:
        Utils.Dom.addClassName(this.speedSlider, CONSTANTS.SLIDER_RIGHT);
        break;
    }

    this.piecesSlider.value = appState.billboardPrismCount;
    switch (parseInt(appState.billboardPrismCount)) {
      case 0:
        Utils.Dom.addClassName(this.piecesSlider, CONSTANTS.SLIDER_LEFT);
        break;
      case 1:
        Utils.Dom.addClassName(this.piecesSlider, CONSTANTS.SLIDER_CENTER);
        break;
      case 2:
        Utils.Dom.addClassName(this.piecesSlider, CONSTANTS.SLIDER_RIGHT);
        break;
    }
  }
}

export { Billboard };
