import * as THREE from 'three';

export const CONSTANTS = {
  TOON_EXPOSURE: 0.3,
  TOON_BRIGHTNESS: 0,
  TOON_CONTRAST: 0.5,
  TOON_CONTOUR_COLOR: new THREE.Color(0, 0.15, 0),

  VIDEO_CLASS: 'snowflix-video',
  CANVAS_CLASS: 'snowflix-canvas',
  SNOWFLIX_ROOT: 'snowflix-root',
  ACTIVE_CLASS: 'snowflix-active',
  DISABLED_CLASS: 'snowflix-disabled',
  SEMI_ACTIVE_CLASS: 'snowflix-semi-active',
  BARELY_ACTIVE_CLASS: 'snowflix-barely-active',
  FILTER_BUTTONS: 'snowflix-filter-btn',
  FILTER_CONTAINERS: 'snowflix-filter-container',

  RIGHT_LIGHT: 'Right_Light',
  LEFT_LIGHT: 'Left_Light',
  PRISM_EDGE_NAME: 'Cylinder011',
  TV_SCREEN_NAME: 'Screen',

  SLIDER_LEFT: 'snowflix-left',
  SLIDER_CENTER: 'snowflix-center',
  SLIDER_RIGHT: 'snowflix-right',
  SLIDER_CENTER_LEFT: 'snowflix-center-left',
  SLIDER_CENTER_RIGHT: 'snowflix-center-right',

  RESIZE: {
    INTERVAL: 100,
    LIMIT: 600,
  },
};

export const SCENE = {
  Default: 0,
  Flashlight: 1,
  Billboard: 2,
  Desat: 3,
  Toon: 4,
  Rgb: 5,
  TV: 6,
};

export const UI_POSITIONS = {
  BottomCenter: 'bottom-center',
  BottomRight: 'bottom-right',
  BottomLeft: 'bottom-left',
  TopRight: 'top-right',
  TopLeft: 'top-left',
};

export const UI_CONTAINERS = {
  Flashlight: 'snowflix-flashlight-container',
  Billboard: 'snowflix-billboard-container',
  Desat: 'snowflix-desat-container',
  Toon: 'snowflix-toon-container',
  Rgb: 'snowflix-rgb-container',
  TV: 'snowflix-tv-container',
};

export const DIRECTIONS = {
  Forwards: 0,
  Backwards: 1,
  PingPong: 2,
};

export const PRISM_COUNTS = [8, 12, 15];

export const SPEED_MODES = [
  {
    animationDirection: DIRECTIONS.Forwards,
    animationInterval: 15000,
    animationDuration: 3,
    animationDelay: 300,
  },
  {
    animationDirection: DIRECTIONS.Forwards,
    animationInterval: 10000,
    animationDuration: 2,
    animationDelay: 130,
  },
  {
    animationDirection: DIRECTIONS.PingPong,
    animationInterval: 6000,
    animationDuration: 1,
    animationDelay: 80,
  },
];

export const DESAT_LEVELS = [0, 0.25, 0.6, 1];

export const TOON_MODES = {
  Default: 0,
  Color: 1,
  Contours: 2,
  Inverse: 3,
};

export const RGB_MODES = {
  Default: { hex: 0xffffff, hue: -1 },
  Red: { hex: 0xff0000, hue: -1 },
  Blue: { hex: 0xff00ff, hue: 230 },
  Green: { hex: 0x00ff00, hue: -1 },
  RedBlue: { hex: 0xff00ff, hue: -1 },
  RedGreen: { hex: 0xffff00, hue: -1 },
  GreenBlue: { hex: 0x00ffff, hue: -1 },
};

export const ASPECT_RATIOS = {
  ASPECT_21x10: 2,
  ASPECT_16x9: 1,
  ASPECT_4x3: 0,
};
