# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Video.js plugin that ports the Snowflix accessibility plugin from Kaltura to Video.js. It provides visual effect filters (Billboard, TV, Flashlight, Desaturation, Toon, RGB) to enhance video viewing accessibility using WebGL/Three.js rendering.

## Build System

### Development Commands

The build system uses Webpack with three configurations:
- `webpack.common.js` - Shared configuration for both builds
- `webpack.dev.js` - Development server with hot reload on port 9000
- `webpack.prod.js` - Production builds (outputs both UMD and ESM modules)

### Build Output

The production build creates two bundles in `dist/`:
- `videojs-snowflix.min.js` - UMD build for browsers and CommonJS (package.json `main` field)
- `videojs-snowflix.esm.js` - ESM build for modern bundlers (package.json `module` field)

All assets (images, fonts, 3D models, audio, shaders) are inlined as base64 in both bundles.

## Architecture

### Core Plugin Structure

**Entry Point**: `src/plugin.js` - Main plugin class `SnowflixPlugin` that extends Video.js Plugin base class

The plugin follows Video.js plugin registration patterns:
- Registered via `videojs.registerPlugin('snowflix', SnowflixPlugin)`
- Initialized with `player.snowflix(options)`
- Video.js is externalized in webpack and accessed from `window.videojs`

### Key Components

**Rendering Pipeline**:
- Uses Three.js with dual camera system:
  - `OrthographicCamera` - For flat filters (Desat, Toon, RGB, Flashlight)
  - `PerspectiveCamera` - For 3D scenes (Billboard, TV)
- WebGL renderer overlays the native video element
- Video texture created from `<video>` element using `THREE.VideoTexture`

**Shader System** (`src/shaders/`):
- Custom fragment shaders injected into `MeshStandardMaterial.onBeforeCompile`
- Uniforms exposed for filter controls
- Shader files use `.glsl` extension and loaded via raw-loader

**Filters** (`src/filters/`):
- Each filter is a separate class: `Desat`, `Flashlight`, `TV`, `Billboard`, `Toon`, `Rgb`
- Filters toggle scenes and modify shader uniforms
- Filters can save/restore state to localStorage

**State Management** (`src/utils/state.js`):
- Global `appState` object tracks current scene, mute state, minimized state
- User preferences persisted to localStorage via `saveUserData()`/`getUserData()`

**UI System**:
- HTML template in `src/snowflix.html`
- CSS in `src/snowflix.css`
- Draggable UI panel that can be minimized
- Control bar button integration with Video.js player controls
- Localization support via `src/localization.json`

### Adapter Pattern (Partial)

The `src/adapters/` directory contains an adapter abstraction layer (likely from the Kaltura port) but is not fully implemented for Video.js:
- `AdapterFactory.js` - Factory pattern for player adapters (currently throws error)
- `PlayerAdapter.js`, `EventAdapter.js`, `StorageAdapter.js` - Abstract interfaces
- These are legacy from Kaltura port and not actively used in Video.js implementation

## Important Technical Details

### CORS Requirements

Videos MUST have CORS enabled. The plugin automatically sets `crossOrigin="anonymous"` on video elements, but the video source server must allow cross-origin requests.

### Asset Loading

All assets are base64-encoded and bundled:
- Images (`.png`, `.svg`, `.jpg`, `.jpeg`, `.gif`) - webpack `asset/inline`
- Audio (`.mp3`, `.wav`) - webpack `asset/inline`
- 3D Models (`.glb`, `.gltf`) - webpack `asset/inline`
- Fonts (`.woff`, `.woff2`) - webpack `asset/inline`
- Shaders (`.glsl`, `.vs`, `.fs`, `.vert`, `.frag`) - raw-loader

### Initialization Flow

1. Plugin constructor initializes members and events
2. On first `playing` event, `initRenderer()` is called
3. Renderer setup creates Three.js scene, cameras, and canvas overlay
4. `loadFilters()` lazy-loads filter instances on first resize
5. User state restored from localStorage via `setupUserData()`

### Debug Mode

Debug builds include dat.GUI controls (conditional compilation with `/// #if DEBUG`). These are stripped in production builds.

## Configuration Options

Plugin accepts options object:

```javascript
player.snowflix({
  float: 'top-right',  // UI position: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  lang: 'en',          // Language code for localization
  targetId: 'custom',  // Custom container element ID for UI
  isMuted: false,      // Initial mute state
  debug: false         // Enable debug logging to console (default: false)
});
```

### Debug Logging

The plugin includes a runtime debug flag that controls console logging:

- **Production (default):** `debug: false` - No console logs (silent operation)
- **Development:** `debug: true` - Detailed logging for troubleshooting

Debug logs include:
- Plugin initialization
- Filter activations and state changes
- Speech synthesis events
- localStorage operations
- WebGL rendering events

**Implementation:**
- Logger utility: `src/utils/logger.js` - exports `setDebugMode()`, `logDebug()`, `logWarn()`, `logError()`
- Debug mode is set in plugin constructor based on `options.debug`
- All console.log statements wrapped with logger functions
- Errors are always logged (with or without debug), but prefixed only when debug is enabled

## File Naming Conventions

- Plugin code: `src/plugin.js` (not `src/index.js`)
- Filters: `src/filters/{name}.js` with capitalized class exports
- Shaders: `src/shaders/*.glsl` with fragment/vertex variants
- Utils: `src/utils/{category}.js` exporting multiple functions

## Common Gotchas

- Video.js must be loaded before the plugin (it's externalized in webpack)
- The plugin doesn't render until first `playing` event (performance optimization)
- Canvas size calculation requires video metadata to be loaded
- Filters are lazy-loaded on first resize to avoid loading unnecessary assets
- State restoration happens asynchronously via polling `setupUserData()`
