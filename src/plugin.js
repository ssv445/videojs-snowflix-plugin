import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { injectShaderCode } from './shaders';
import { CONSTANTS, SCENE, TOON_MODES, UI_CONTAINERS, UI_POSITIONS } from './constants';
import { Desat, Rgb, Toon, Billboard, TV, Flashlight } from './filters';
import { appState, setAppState, logSnowflix, getUrlParams, setMediaId, setClientId } from './utils';
import { getUserData, saveUserData, saveBrowserData, findAspectRatio, replaceImageSources } from './utils';
import { setDebugMode, logDebug, logWarn, logError } from './utils';

import localization from './localization.json';
import snowflixHtml from './snowflix.html?raw';
import './snowflix.css';

// Get videojs from global scope (it's externalized in webpack)
const videojs = window.videojs;

// Simple DOM utils to replace KalturaPlayer.core.Utils
const Utils = {
  Dom: {
    addClassName: (el, className) => el?.classList.add(className),
    removeClassName: (el, className) => el?.classList.remove(className),
    hasClassName: (el, className) => el?.classList.contains(className),
    createElement: (tag) => document.createElement(tag),
    appendChild: (parent, child) => parent?.appendChild(child),
    removeChild: (parent, child) => parent?.removeChild(child),
    insertBefore: (parent, newNode, referenceNode) => parent?.insertBefore(newNode, referenceNode),
  },
};

const Plugin = videojs.getPlugin('plugin');

class SnowflixPlugin extends Plugin {
  calculateCanvas;
  previousScene;
  orthographic;
  snowflixRoot;
  perspective;
  renderer;
  uniforms;
  filters;
  texture;
  frameId;
  loaders;
  ambient;
  plane;
  clock;
  scene;

  isPlaying;
  isPowered;

  constructor(player, options = {}) {
    super(player, options);
    this.defaultConfig = options;

    // Set debug mode based on options
    if (options.debug === true) {
      setDebugMode(true);
      logDebug('Snowflix plugin initialized with debug mode enabled');
    }

    this.initMembers();
    this.initEvents();
  }

  initEvents() {
    if (!this.isSupportedBrowser()) {
      logError('Unsupported browser.');
      return;
    }

    this.setCrossOrigin();

    // Initialize renderer on first play
    let rendererInitialized = false;
    const onFirstPlay = () => {
      if (!rendererInitialized) {
        rendererInitialized = true;
        this.initRenderer();
        this.player.off('playing', onFirstPlay);
      }
    };

    this.player.on('loadedmetadata', () => {
      this.setCrossOrigin();
    });

    this.player.on('playing', onFirstPlay);
    this.player.on('play', () => this.onPlay());
    this.player.on('playing', () => this.onPlaying());
    this.player.on('playerresize', () => this.updateCanvasSize());
    this.player.on('ended', () => this.onEnd());
    this.player.on('pause', () => this.onPause());
    this.player.on('volumechange', () => {
      logSnowflix('VOLUME_CHANGE', this.player.volume());
      this.syncAudioState();
    });
    this.player.on('fullscreenchange', () => {
      if (this.player.isFullscreen()) {
        logSnowflix('ENTER_FULLSCREEN');
      } else {
        logSnowflix('EXIT_FULLSCREEN');
      }
    });
    this.player.on('durationchange', () => logSnowflix('DURATION_CHANGE'));
    this.player.on('ratechange', () => logSnowflix('RATE_CHANGE'));
    this.player.on('seeked', () => logSnowflix('SEEKED'));
    this.player.on('error', () => logSnowflix('ERROR'));
  }

  initRenderer() {
    this.initUI();
    this.addControlBarButton();
    this.initState();

    const videoElement = this.player.el().querySelector('video');
    Utils.Dom.addClassName(videoElement, CONSTANTS.VIDEO_CLASS);

    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.gltfLoader = new GLTFLoader();

    //*** Use OrthographicCamera to stretch the plane over the camera.
    //*** Use PerspectiveCamera to display 3d scenes with perspective ( Billboard and TV filters ).
    this.orthographic = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0, 100);
    this.perspective = new THREE.PerspectiveCamera();
    this.perspective.far = 30;

    this.renderer = new THREE.WebGLRenderer({
      devicePixelRatio: window.devicePixelRatio,
      physicallyCorrectLights: true,
      clearColor: 0xffffff,
      antialias: true,
      alpha: false,
    });

    const canvas = this.renderer.domElement;
    Utils.Dom.addClassName(canvas, CONSTANTS.CANVAS_CLASS);
    Utils.Dom.insertBefore(this.player.el(), canvas, videoElement.nextSibling);

    this.texture = new THREE.VideoTexture(videoElement);
    this.texture.minFilter = this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    //*** Various shader uniforms are exposed in order to toggle and control filter effects.
    this.uniforms = {
      iResolution: { value: new THREE.Vector3() },
    };

    //*** Inject fragment shader code to MeshStandardMaterial to implement Toon and Desat filters.
    const material = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(1, 1, 1),
      emissiveMap: this.texture,
      emissiveIntensity: 0,
      map: this.texture,
    });

    material.onBeforeCompile = (shader) => injectShaderCode(shader, this.uniforms);

    const geometry = new THREE.PlaneGeometry(1, 1);
    this.plane = new THREE.Mesh(geometry, material);

    this.ambient = new THREE.AmbientLight(0xffffff, 1);

    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    this.scene.add(this.perspective);
    this.scene.add(this.ambient);

    this.updateCanvasSize();
  }

  loadFilters() {
    if (!this.filtersLoaded) {
      this.filtersLoaded = true;
      this.filters.rgb = new Rgb(this.uniforms, this.plane);
      this.filters.desat = new Desat(this.uniforms);
      this.filters.toon = new Toon(this.uniforms, this.plane, this.aspectRatio);
      this.filters.flashlight = new Flashlight(this.scene, this.ambient, this.aspectRatio);
      this.filters.tv = new TV(this.scene, this.plane, this.ambient, this.loaders, this.perspective);
      this.filters.billboard = new Billboard(
        this.uniforms,
        this.scene,
        this.plane,
        this.ambient,
        this.loaders,
        this.perspective
      );

      this.scene.add(this.plane);
    }
  }

  initState() {
    getUserData()
      .then((data) => {
        this.setupUserData(data.message);
      })
      .catch((error) => {
        logDebug('error', error);
        this.setupUserData(appState);
      });

    saveBrowserData();
    setMediaId(this.player);
    setClientId(this.urlParams.clientId);
  }

  /**
   * Calculate initial UI position from config option
   * @param {string} floatPosition - Position string ('top-right', 'top-left', 'bottom-left', 'bottom-center')
   * @param {HTMLElement} element - The UI element to position
   * @returns {Object} Position object with top and left in pixels
   */
  calculateInitialPosition(floatPosition, element) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = element.offsetWidth || 370; // fallback to max-width
    const elementHeight = element.offsetHeight || 180; // fallback to min-height

    // Default position (bottom-right with margins)
    let top = viewportHeight - elementHeight - (viewportHeight * 0.025);
    let left = viewportWidth - elementWidth - (viewportWidth * 0.05);

    switch (floatPosition) {
      case 'top-right':
        top = viewportHeight * 0.03;
        left = viewportWidth - elementWidth - (viewportWidth * 0.05);
        break;
      case 'top-left':
        top = viewportHeight * 0.03;
        left = viewportWidth * 0.05;
        break;
      case 'bottom-left':
        top = viewportHeight - elementHeight - (viewportHeight * 0.025);
        left = viewportWidth * 0.05;
        break;
      case 'bottom-center':
        top = viewportHeight - elementHeight - (viewportHeight * 0.025);
        left = (viewportWidth - elementWidth) / 2;
        break;
      case 'bottom-right':
      default:
        // Already set as default above
        break;
    }

    return { top: Math.round(top), left: Math.round(left) };
  }

  /**
   * Apply position to UI element with viewport boundary constraints
   * @param {number} top - Top position in pixels
   * @param {number} left - Left position in pixels
   */
  applyUIPosition(top, left) {
    if (!this.snowflixUI) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementWidth = this.snowflixUI.offsetWidth;
    const elementHeight = this.snowflixUI.offsetHeight;

    // Constrain to viewport boundaries
    const constrainedTop = Math.max(0, Math.min(viewportHeight - elementHeight, top));
    const constrainedLeft = Math.max(0, Math.min(viewportWidth - elementWidth, left));

    this.snowflixUI.style.top = `${constrainedTop}px`;
    this.snowflixUI.style.left = `${constrainedLeft}px`;

    // Update appState
    appState.uiPosition = { top: constrainedTop, left: constrainedLeft };
  }

  initUI() {
    this.snowflixRoot = Utils.Dom.createElement('div');
    this.snowflixRoot.innerHTML = snowflixHtml;
    Utils.Dom.addClassName(this.snowflixRoot, CONSTANTS.SNOWFLIX_ROOT);

    // Replace all image src attributes with base64 data URLs
    replaceImageSources(this.snowflixRoot);

    let targetElement;
    if (this.defaultConfig.targetId) {
      targetElement = document.getElementById(this.defaultConfig.targetId);
    }
    if (!targetElement) {
      targetElement = document.body;
    }

    Utils.Dom.appendChild(targetElement, this.snowflixRoot);
    this.snowflixUI = this.snowflixRoot.querySelector('.snowflix-ui');

    const listen = (button, containerSelector, sceneType) => {
      const container = document.getElementById(containerSelector);
      button.addEventListener('click', this.clickFilter.bind(this, button, container, sceneType));
    };

    this.inactiveContainer = document.getElementById('snowflix-inactive-filter');
    this.flashlightBtn = document.getElementById('snowflix-flashlight-btn');
    this.billboardBtn = document.getElementById('snowflix-billboard-btn');
    this.minimizeBtn = document.getElementById('snowflix-minimize-btn');
    this.desatBtn = document.getElementById('snowflix-desat-btn');
    this.toonBtn = document.getElementById('snowflix-toon-btn');
    this.muteBtn = document.getElementById('snowflix-mute-btn');
    this.rgbBtn = document.getElementById('snowflix-rgb-btn');
    this.tvBtn = document.getElementById('snowflix-tv-btn');

    listen(this.flashlightBtn, UI_CONTAINERS.Flashlight, SCENE.Flashlight);
    listen(this.billboardBtn, UI_CONTAINERS.Billboard, SCENE.Billboard);
    listen(this.desatBtn, UI_CONTAINERS.Desat, SCENE.Desat);
    listen(this.toonBtn, UI_CONTAINERS.Toon, SCENE.Toon);
    listen(this.rgbBtn, UI_CONTAINERS.Rgb, SCENE.Rgb);
    listen(this.tvBtn, UI_CONTAINERS.TV, SCENE.TV);

    this.minimizeBtn.addEventListener('click', this.clickMinimize.bind(this));
    this.muteBtn.addEventListener('click', this.clickMute.bind(this));

    this.backgroundOff = document.getElementById('snowflix-background-off');
    this.backgroundOn = document.getElementById('snowflix-background-on');
    document.querySelector('.snowflix-power-container').addEventListener('click', this.clickPower.bind(this));

    // Apply i18n translations based on URL params or config
    this.urlParams = getUrlParams();
    const lang = this.defaultConfig.lang || this.urlParams.lang || 'en';
    if (localization[lang]) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.innerText.trim();
        const translation = localization[lang][key];
        if (translation) {
          el.innerText = translation;
        }
      });
    }

    Utils.Dom.addClassName(this.snowflixUI, CONSTANTS.DISABLED_CLASS);
    logDebug('defaultConfig', this.defaultConfig);

    // Set initial UI position
    // Priority: 1. Saved position from appState, 2. Config float option, 3. Default (bottom-right)
    if (appState.uiPosition && appState.uiPosition.top !== null && appState.uiPosition.left !== null) {
      // Restore saved position
      logDebug('Restoring saved UI position:', appState.uiPosition);
      this.applyUIPosition(appState.uiPosition.top, appState.uiPosition.left);
    } else {
      // Calculate from config or use default
      const floatPosition = this.defaultConfig?.float || 'bottom-right';
      logDebug('Setting initial UI position from config:', floatPosition);
      const initialPosition = this.calculateInitialPosition(floatPosition, this.snowflixUI);
      this.applyUIPosition(initialPosition.top, initialPosition.left);
    }

    // Add window resize handler to maintain position within viewport boundaries
    this.initResizeHandler();
  }

  initResizeHandler() {
    // Handle window resize to maintain position within viewport boundaries
    const handleResize = () => {
      if (appState.uiPosition) {
        // Reapply current position with new viewport boundaries
        this.applyUIPosition(appState.uiPosition.top, appState.uiPosition.left);
      }
    };

    window.addEventListener('resize', handleResize);

    // Store handler for cleanup if needed
    this.resizeHandler = handleResize;
  }


  addControlBarButton() {
    // Create a custom Video.js Button component
    const Button = videojs.getComponent('Button');
    const plugin = this;

    class SnowflixButton extends Button {
      constructor(player, options) {
        super(player, options);
        this.controlText('Toggle Snowflix UI');
        this.addClass('vjs-snowflix-button');
        this.el().innerHTML = `
          <span class="vjs-icon-placeholder" aria-hidden="true">
            <svg viewBox="0 0 107 114" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M44.6472 0.967993L102.704 35.0182C107.257 37.6886 107.303 44.2551 102.787 46.9888L44.7308 82.1374C40.0872 84.9487 34.1545 81.6052 34.1545 76.1769V6.97822C34.1545 1.59331 40.0023 -1.75628 44.6472 0.967993ZM43.2889 113.163C19.3811 113.163 0 93.7824 0 69.8746C0 56.3845 6.17059 44.3357 15.8432 36.3966C18.4417 34.2639 22.2114 34.9833 24.2698 37.6411C26.7483 40.8413 25.7158 45.4858 22.7807 48.2732C17.0661 53.7004 13.503 61.3714 13.503 69.8746C13.503 86.3249 26.8386 99.6605 43.2889 99.6605C56.13 99.6605 67.0732 91.5347 71.257 80.1445C72.6919 76.238 76.7478 73.3965 80.7314 74.6011C83.8246 75.5364 85.8186 78.6164 84.9357 81.7251C79.7821 99.8719 63.0877 113.163 43.2889 113.163ZM44.419 10.7944C45.381 9.12809 47.5117 8.55717 49.178 9.51921L96.6452 36.9244C96.9245 37.0789 97.1844 37.2729 97.4157 37.5038C97.721 37.8078 97.9621 38.1615 98.1335 38.544C98.34 39.002 98.4393 39.486 98.4398 39.9647C98.4412 40.4513 98.3405 40.9435 98.1292 41.4088C97.9594 41.7845 97.7223 42.1322 97.4231 42.4319C97.1898 42.6662 96.9273 42.8627 96.6449 43.0189L49.178 70.4239C47.5117 71.386 45.381 70.8151 44.419 69.1488C43.457 67.4825 44.0279 65.3518 45.6942 64.3897L87.9877 39.9716L45.6942 15.5534C44.0279 14.5914 43.457 12.4607 44.419 10.7944Z"/>
            </svg>
          </span>
          <span class="vjs-control-text" aria-live="polite">${this.localize('Toggle Snowflix UI')}</span>
        `;
      }

      buildCSSClass() {
        return `vjs-snowflix-button ${super.buildCSSClass()}`;
      }

      handleClick() {
        // Toggle minimize/unminimize
        plugin.clickMinimize();
      }

      updateIcon() {
        const isMinimized = appState.isMinimized;
        // Update tooltip text
        this.controlText(isMinimized ? 'Show Snowflix UI' : 'Hide Snowflix UI');
        // Toggle CSS class for styling
        if (isMinimized) {
          this.removeClass('snowflix-ui-visible');
          this.addClass('snowflix-ui-hidden');
        } else {
          this.removeClass('snowflix-ui-hidden');
          this.addClass('snowflix-ui-visible');
        }
      }
    }

    // Register the component with Video.js
    videojs.registerComponent('SnowflixButton', SnowflixButton);

    // Add the button to the control bar
    const snowflixButton = this.player.controlBar.addChild('SnowflixButton', {
      plugin: this,
    });

    // Position it before the fullscreen button
    const fullscreenToggle = this.player.controlBar.getChild('fullscreenToggle');
    if (fullscreenToggle) {
      this.player.controlBar.el().insertBefore(
        snowflixButton.el(),
        fullscreenToggle.el()
      );
    }

    // Store reference and set initial icon
    this.controlBarButton = snowflixButton;
    snowflixButton.updateIcon();
  }

  clickFilter(button, container, filter) {
    this.toggleFilters(filter);
    const isActive = Utils.Dom.hasClassName(button, CONSTANTS.ACTIVE_CLASS);
    const buttons = document.getElementsByClassName(CONSTANTS.FILTER_BUTTONS);
    const containers = document.getElementsByClassName(CONSTANTS.FILTER_CONTAINERS);
    Utils.Dom.removeClassName(this.inactiveContainer, CONSTANTS.ACTIVE_CLASS);

    for (let i = 0; i < buttons.length; i++) {
      Utils.Dom.removeClassName(buttons[i], CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.removeClassName(containers[i], CONSTANTS.ACTIVE_CLASS);
    }

    if (!isActive) {
      Utils.Dom.addClassName(button, CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.addClassName(container, CONSTANTS.ACTIVE_CLASS);
    } else {
      Utils.Dom.addClassName(this.inactiveContainer, CONSTANTS.ACTIVE_CLASS);
    }
  }

  toggleFilters(filter) {
    this.previousScene = appState.currentScene;
    const sceneMode = parseInt(filter);
    this.isPowered = true;
    appState.currentScene = sceneMode === appState.currentScene ? SCENE.Default : sceneMode;
    switch (appState.currentScene) {
      case SCENE.Default:
        this.isPowered = false;
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.tv.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.disable();
        break;
      case SCENE.Rgb:
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.toon.toggle(false);
        this.filters.tv.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.enable();
        break;
      case SCENE.Desat:
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.rgb.disable();
        this.filters.tv.toggle(false);
        this.filters.desat.enable();
        break;
      case SCENE.Toon:
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.disable();
        this.filters.tv.toggle(false);
        this.filters.toon.enable();
        break;
      case SCENE.Billboard:
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.disable();
        this.filters.tv.toggle(false);
        this.filters.billboard.toggle(true);
        break;
      case SCENE.Flashlight:
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.disable();
        this.filters.tv.toggle(false);
        this.filters.flashlight.toggle(true);
        break;
      case SCENE.TV:
        this.filters.toon.setToonMode(TOON_MODES.Default);
        this.filters.flashlight.toggle(false);
        this.filters.billboard.toggle(false);
        this.filters.desat.disable();
        this.filters.rgb.disable();
        this.filters.tv.toggle(true);
        break;
    }

    saveUserData();
    if (this.isPowered) {
      Utils.Dom.removeClassName(this.backgroundOff, CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.addClassName(this.backgroundOn, CONSTANTS.ACTIVE_CLASS);
    } else {
      Utils.Dom.removeClassName(this.backgroundOn, CONSTANTS.ACTIVE_CLASS);
      Utils.Dom.addClassName(this.backgroundOff, CONSTANTS.ACTIVE_CLASS);
    }
  }

  clickPower() {
    const sceneSelected = this.isPowered ? appState.currentScene : this.previousScene;
    if (!appState.isMuted) {
      appState.isMuted = true;
      setTimeout(() => {
        appState.isMuted = false;
      }, 150);
    }

    switch (sceneSelected) {
      case SCENE.Rgb:
        this.rgbBtn.click();
        break;
      case SCENE.Desat:
        this.desatBtn.click();
        break;
      case SCENE.Toon:
        this.toonBtn.click();
        break;
      case SCENE.Billboard:
        this.billboardBtn.click();
        break;
      case SCENE.TV:
        this.tvBtn.click();
        break;
      case SCENE.Flashlight:
        this.flashlightBtn.click();
        break;
    }
  }

  clickMute() {
    appState.isMuted = Utils.Dom.hasClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
    saveUserData();
    if (!appState.isMuted) {
      Utils.Dom.addClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
    } else {
      Utils.Dom.removeClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
    }
  }

  syncAudioState() {
    // Sync Snowflix UI audio button with Video.js muted state
    if (!this.muteBtn) return;

    const videoIsMuted = this.player.muted();
    const snowflixShowsUnmuted = Utils.Dom.hasClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);

    // If video is muted, Snowflix button should NOT have active class (showing muted icon)
    // If video is unmuted, Snowflix button SHOULD have active class (showing unmuted icon)
    if (videoIsMuted && snowflixShowsUnmuted) {
      Utils.Dom.removeClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
      appState.isMuted = true;
    } else if (!videoIsMuted && !snowflixShowsUnmuted) {
      Utils.Dom.addClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
      appState.isMuted = false;
    }
  }

  clickMinimize(minimize) {
    appState.isMinimized = minimize === undefined ? !appState.isMinimized : minimize;
    saveUserData();
    const removeClass = appState.isMinimized ? CONSTANTS.ACTIVE_CLASS : CONSTANTS.DISABLED_CLASS;
    Utils.Dom.removeClassName(this.snowflixUI, removeClass);

    setTimeout(() => {
      const addClass = appState.isMinimized ? CONSTANTS.DISABLED_CLASS : CONSTANTS.ACTIVE_CLASS;
      Utils.Dom.addClassName(this.snowflixUI, addClass);

      // Update control bar button icon
      if (this.controlBarButton) {
        this.controlBarButton.updateIcon();
      }
    }, 200);
  }

  render() {
    const videoElement = this.player.el().querySelector('video');
    if (this.texture && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
      this.texture.needsUpdate = false;
    }

    const billboardActive = this.filters.billboard?.isActive;
    const tvActive = this.filters.tv?.isActive;
    this.frameId = requestAnimationFrame(this.render.bind(this));
    if (this.renderer) {
      if (billboardActive || tvActive) {
        this.renderer.render(this.scene, this.perspective);
      } else {
        this.renderer.render(this.scene, this.orthographic);
      }
    }
    if (this.isPlaying && billboardActive) {
      this.filters.billboard.render(this.clock.getDelta());
    } else if (tvActive) {
      this.filters.tv.render();
    }
  }

  onPlay() {
    logSnowflix('PLAY');
    if (!this.frameId) {
      this.render();
    }
  }

  onPlaying() {
    this.isPlaying = true;
    this.updateCanvasSize();
  }

  onPause() {
    logSnowflix('PAUSE');
    this.isPlaying = false;
  }

  onEnd() {
    logSnowflix('ENDED');
    this.isPlaying = false;
  }

  updateCanvasSize() {
    if (this.renderer) {
      const dimensions = this.getCanvasDimensions();
      if (dimensions.width) {
        logSnowflix('RESIZE', dimensions);
        this.setRendererSize(dimensions);
        this.loadFilters();
      } else {
        this.updateCanvasSizeByInterval();
      }
    }
  }

  updateCanvasSizeByInterval() {
    let calculateCanvasCounter = 0;
    let dimensions;
    this.clearCalculateInterval();
    this.calculateCanvas = setInterval(() => {
      dimensions = this.getCanvasDimensions();
      if (dimensions.width) {
        this.clearCalculateInterval();
        this.setRendererSize(dimensions);
        this.loadFilters();
      } else if (++calculateCanvasCounter >= CONSTANTS.RESIZE.LIMIT) {
        logError('the video size is unavailable. cannot set the canvas size.');
      }
    }, CONSTANTS.RESIZE.INTERVAL);
  }

  getCanvasDimensions() {
    const view = this.player.el();
    const video = this.player.el().querySelector('video');
    const pWidth = parseInt((video.videoWidth / video.videoHeight) * view.offsetHeight);
    let dimensions;
    let videoRatio;
    if (view.offsetWidth < pWidth) {
      videoRatio = video.videoHeight / video.videoWidth;
      dimensions = {
        width: view.offsetWidth,
        height: videoRatio * view.offsetWidth,
      };
    } else {
      videoRatio = video.videoWidth / video.videoHeight;
      dimensions = {
        width: videoRatio * view.offsetHeight,
        height: view.offsetHeight,
      };
    }

    dimensions.aspectRatio = dimensions.width / dimensions.height;
    return dimensions;
  }

  clearCalculateInterval() {
    if (this.calculateCanvas) {
      clearInterval(this.calculateCanvas);
      this.calculateCanvas = null;
    }
  }

  setCrossOrigin() {
    const video = this.player.el().querySelector('video');
    if (video && !video.crossOrigin) {
      video.crossOrigin = 'anonymous';
    }
  }

  setRendererSize(dimensions) {
    const videoRatio = findAspectRatio(dimensions.aspectRatio);
    this.aspectRatio = videoRatio.aspectRatio;

    this.orthographic.bottom = -videoRatio.height;
    this.orthographic.right = videoRatio.width;
    this.orthographic.left = -videoRatio.width;
    this.orthographic.top = videoRatio.height;

    this.perspective.aspect = dimensions.aspectRatio;
    this.plane.scale.y = videoRatio.height * 2;
    this.plane.scale.x = videoRatio.width * 2;

    this.uniforms.iResolution.value.set(dimensions.width, dimensions.height, 1);
    this.renderer.setSize(dimensions.width, dimensions.height, false);

    this.orthographic.updateProjectionMatrix();
    this.perspective.updateProjectionMatrix();
  }

  setupUserData(newState) {
    // If no saved state, use default appState
    if (!newState) {
      newState = appState;
    }

    if (this.filters.toon && this.filters.tv.tvModel && this.filters.billboard.billboard) {
      this.previousScene = newState.currentScene;
      const desatIndex = newState.desatIndex;
      const isMuted = this.defaultConfig?.isMuted ? this.defaultConfig?.isMuted : newState.isMuted;
      setAppState(newState);

      //*** Root html node is ready.
      Utils.Dom.addClassName(this.snowflixRoot, CONSTANTS.ACTIVE_CLASS);

      //*** Restore minimized state.
      const removeClass = appState.isMinimized ? CONSTANTS.ACTIVE_CLASS : CONSTANTS.DISABLED_CLASS;
      Utils.Dom.removeClassName(this.snowflixUI, removeClass);

      //*** Restore muted state.
      if (isMuted) {
        Utils.Dom.removeClassName(this.muteBtn, CONSTANTS.ACTIVE_CLASS);
      }

      //*** Temporary mute until the app is activated.
      appState.isMuted = true;
      setTimeout(() => {
        const addClass = appState.isMinimized ? CONSTANTS.DISABLED_CLASS : CONSTANTS.ACTIVE_CLASS;
        Utils.Dom.addClassName(this.snowflixUI, addClass);
        appState.isMuted = isMuted;
      }, 200);

      this.filters.flashlight.restoreState();
      this.filters.billboard.restoreState();
      this.filters.toon.restoreState();
      this.filters.rgb.restoreState();
      this.filters.tv.restoreState();
      switch (this.previousScene) {
        case SCENE.Rgb:
          this.rgbBtn.click();
          break;
        case SCENE.Desat:
          this.desatBtn.click();
          this.filters.desat.restoreState(desatIndex);
          break;
        case SCENE.Toon:
          this.toonBtn.click();
          break;
        case SCENE.Billboard:
          this.billboardBtn.click();
          break;
        case SCENE.TV:
          this.tvBtn.click();
          break;
        case SCENE.Flashlight:
          this.flashlightBtn.click();
          break;
      }
    } else {
      setTimeout(() => {
        this.setupUserData(newState);
      }, 100);
    }
  }

  initMembers() {
    this.filtersLoaded = false;
    this.previousScene = null;
    this.orthographic = null;
    this.snowflixRoot = null;
    this.perspective = null;
    this.snowflixUI = null;
    this.isPowered = false;
    this.renderer = null;
    this.uniforms = null;
    this.texture = null;
    this.frameId = null;
    this.ambient = null;
    this.scene = null;
    this.plane = null;
    this.loaders = { gltfLoader: null, textureLoader: null };
    this.filters = {
      flashlight: null,
      billboard: null,
      desat: null,
      toon: null,
      rgb: null,
      tv: null,
    };
  }

  static isValid(player) {
    return true;
  }

  isSupportedBrowser() {
    return true;
  }

  clean() {
    if (this.snowflixRoot) {
      this.snowflixRoot.remove();
    }
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    // Remove all event listeners
    this.player.off();

    const videoElement = this.player.el().querySelector('video');
    Utils.Dom.removeClassName(videoElement, CONSTANTS.VIDEO_CLASS);

    if (this.renderer) {
      Utils.Dom.removeChild(this.player.el(), this.renderer.domElement);
    }

    const video = this.player.el().querySelector('video');
    if (video) {
      video.crossOrigin = null;
    }

    this.clearCalculateInterval();
  }

  destroy() {
    this.clean();
  }

  reset() {
    this.clean();
    this.initMembers();
    this.initEvents();
  }
}

// Register the plugin with Video.js
// Following the official Video.js plugin guidelines
videojs.registerPlugin('snowflix', SnowflixPlugin);

export default SnowflixPlugin;
