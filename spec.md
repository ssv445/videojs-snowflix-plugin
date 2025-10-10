# Video.js Snowflix Plugin - Package Bundling & Distribution Spec

## Overview
Specification for packaging and distributing the videojs-snowflix plugin as an npm package with proper bundling for third-party consumption, including a Next.js demo setup.

## Package Distribution Strategy

### Build Formats
- **ESM (ES Modules)**: `dist/videojs-snowflix.esm.js` - For modern bundlers
- **UMD (Universal Module Definition)**: `dist/videojs-snowflix.min.js` - For CommonJS and browser script tags
- **CSS**: `dist/videojs-snowflix.css` - Separate stylesheet (following Video.js conventions)

### Asset Handling
- **Images**:
  - Small images (≤10KB) - Inlined as base64
  - Large images (>10KB) - Emitted as separate files in `dist/`
- **Fonts, Audio, 3D Models, Shaders**: Inline as base64
- **CSS**: Extract to separate file (no style-loader injection)

### External Dependencies
- **Video.js**: Externalized as peer dependency (consumers must install separately)
- **Three.js, Tween.js, Draggable**: Bundled with the plugin

## Package.json Configuration

### Main Fields
```json
{
  "main": "dist/videojs-snowflix.min.js",
  "module": "dist/videojs-snowflix.esm.js",
  "style": "dist/videojs-snowflix.css",
  "exports": {
    ".": {
      "import": "./dist/videojs-snowflix.esm.js",
      "require": "./dist/videojs-snowflix.min.js"
    },
    "./dist/*.css": "./dist/*.css"
  },
  "files": [
    "dist",
    "LICENSE",
    "README.md"
  ],
  "peerDependencies": {
    "video.js": "^8.0.0"
  }
}
```

## Plugin API Pattern

### Registration Pattern (Named Export with Manual Register)
Following Video.js advanced plugin pattern with manual registration:

```javascript
import videojs from 'video.js';
import { SnowflixPlugin } from 'videojs-snowflix';
import 'videojs-snowflix/dist/videojs-snowflix.css';

videojs.registerPlugin('snowflix', SnowflixPlugin);
player.snowflix(options);
```

**Note**: The plugin already extends `videojs.getPlugin('plugin')` base class (Advanced Plugin pattern).

## Build Tool Configuration

### Current Setup
- **Bundler**: Webpack 5 (already configured, working well)
- **Migration**: Open to Vite for simplicity if migration effort is minimal
- **Decision**: Review existing Webpack config and enhance for library bundling

### Required Webpack Adjustments

#### 1. CSS Extraction
Replace `style-loader` with `MiniCssExtractPlugin`:
```javascript
// webpack.common.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'videojs-snowflix.css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      }
    ]
  }
};
```

#### 2. Asset Inline Threshold
Update asset handling for selective inlining:
```javascript
// Only inline small images
{
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 10 * 1024 // 10KB threshold
    }
  }
}
```

#### 3. Keep Existing Externalization
Video.js is already properly externalized in `webpack.prod.js` - no changes needed.

## Next.js Demo Setup

### Structure
```
videojs-snowflix/
├── src/
├── dist/
├── examples/
│   └── nextjs-demo/        # Minimal Next.js example
│       ├── package.json
│       ├── next.config.js
│       ├── app/
│       │   ├── layout.js
│       │   └── page.js
│       └── components/
│           └── VideoPlayer.js
```

### Demo Configuration

#### Next.js Version
- **Target**: Next.js 15 with App Router

#### Rendering Strategy
- **Client-side only**: Video.js component wrapped in dynamic import with `ssr: false`
- Reason: Video.js doesn't support SSR

#### Package Dependency
```json
{
  "dependencies": {
    "videojs-snowflix": "^1.1.1",
    "video.js": "^8.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### Demo Implementation

#### Example Component
```javascript
// components/VideoPlayer.js
'use client';
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix/dist/videojs-snowflix.css';

export default function VideoPlayer() {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;

      playerRef.current = videojs(videoElement, {
        controls: true,
        fluid: true,
        sources: [{
          src: 'https://example.com/video.mp4',
          type: 'video/mp4'
        }]
      });

      // Initialize Snowflix plugin
      playerRef.current.snowflix({
        // Plugin options
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js" />
    </div>
  );
}
```

#### Page with Dynamic Import
```javascript
// app/page.js
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), {
  ssr: false
});

export default function Home() {
  return (
    <main>
      <h1>Videojs Snowflix Plugin - Next.js Demo</h1>
      <VideoPlayer />
    </main>
  );
}
```

### Demo Scope
- **Minimal example only**: Single page with one video player
- Shows basic plugin initialization
- Demonstrates proper CSS and JS imports
- No TypeScript, advanced features, or multiple scenarios

## Implementation Checklist

### Phase 1: Webpack Configuration Updates
- [ ] Install `mini-css-extract-plugin`
- [ ] Update `webpack.common.js` to extract CSS instead of injecting
- [ ] Update image asset rules with 10KB threshold
- [ ] Test build output to verify CSS extraction
- [ ] Verify externalized Video.js still works

### Phase 2: Package.json Updates
- [ ] Add `style` field pointing to CSS file
- [ ] Update `exports` field for CSS import path
- [ ] Add `README.md` to `files` array
- [ ] Verify peer dependencies are correct

### Phase 3: Next.js Demo Creation
- [ ] Create `examples/nextjs-demo` directory
- [ ] Initialize Next.js 15 app with App Router
- [ ] Install dependencies (videojs-snowflix from npm)
- [ ] Create VideoPlayer component with dynamic import
- [ ] Create demo page
- [ ] Test integration and document usage

### Phase 4: Documentation & Publishing
- [ ] Update README with installation instructions
- [ ] Add usage examples for different bundlers
- [ ] Document CSS import requirements
- [ ] Test package in local environment before publishing
- [ ] Publish to npm

## Review Existing Public Video.js Plugins
- Reference official Video.js plugin conventions from https://videojs.org/guides/plugins
- Follow package structure similar to Video.js core package
- Use `style` field in package.json (Video.js convention)
- Ensure advanced plugin pattern is properly implemented (already done)

## Expected Output Structure

```
dist/
├── videojs-snowflix.min.js       # UMD build
├── videojs-snowflix.esm.js       # ESM build
├── videojs-snowflix.css          # Extracted styles
└── *.{png,jpg}                   # Large images (>10KB)
```

## Success Criteria
1. Plugin can be installed via npm and works in modern bundlers (Webpack, Vite, Rollup)
2. CSS is properly separated and must be manually imported by consumers
3. Video.js is not bundled (peer dependency)
4. Assets are appropriately inlined or externalized based on size
5. Next.js demo successfully demonstrates basic plugin integration
6. Package follows Video.js ecosystem conventions
