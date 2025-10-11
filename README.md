# Video.js Snowflix Plugin

Accessibility plugin for Video.js providing visual effect filters for enhanced viewing.

## Installation

```bash
npm install videojs-snowflix video.js
```

The package includes:
- **UMD build**: `dist/videojs-snowflix.min.js` (for browsers and CommonJS)
- **ESM build**: `dist/videojs-snowflix.esm.js` (for modern bundlers like Webpack, Vite, Rollup)
- **CSS file**: `dist/videojs-snowflix.css` (required for proper styling)
- **Image assets**: Extracted large images (>10KB) for better performance

Modern bundlers will automatically use the ESM version via the `module` field in package.json.

## Usage

### In HTML (Browser)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Video.js CSS -->
  <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet">

  <!-- Snowflix Plugin CSS -->
  <link href="node_modules/videojs-snowflix/dist/videojs-snowflix.css" rel="stylesheet">
</head>
<body>
  <video id="my-player" class="video-js" controls crossorigin="anonymous">
    <source src="video.mp4" type="video/mp4">
  </video>

  <!-- Video.js -->
  <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>

  <!-- Snowflix Plugin -->
  <script src="node_modules/videojs-snowflix/dist/videojs-snowflix.min.js"></script>

  <script>
    const player = videojs('my-player');
    player.snowflix({
      float: 'top-right',  // Optional: UI position ('top-right', 'top-left', 'bottom-right', 'bottom-left')
      lang: 'en'           // Optional: language code
    });
  </script>
</body>
</html>
```

### With a Bundler (Webpack, Vite, Rollup)

```javascript
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix';
import 'videojs-snowflix/dist/videojs-snowflix.css'; // Important: Import CSS

const player = videojs('my-player', {
  controls: true,
  responsive: true,
  fluid: true,
  sources: [{
    src: 'https://example.com/video.mp4',
    type: 'video/mp4'
  }]
});

// Initialize Snowflix plugin
player.snowflix({
  float: 'top-right',
  lang: 'en'
});
```

### Next.js (App Router)

For Next.js, you need to use dynamic imports to prevent SSR issues:

**components/VideoPlayer.tsx**
```typescript
'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix/dist/videojs-snowflix.css';

// Dynamic import for Snowflix
if (typeof window !== 'undefined') {
  import('videojs-snowflix');
}

export default function VideoPlayer({ options, snowflixOptions }) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options);

      player.ready(() => {
        if (typeof (player as any).snowflix === 'function') {
          (player as any).snowflix(snowflixOptions);
        }
      });
    }
  }, [options, snowflixOptions]);

  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
      }
    };
  }, []);

  return <div data-vjs-player><div ref={videoRef} /></div>;
}
```

**app/page.tsx**
```typescript
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false
});

export default function Home() {
  return (
    <VideoPlayer
      options={{
        sources: [{ src: 'video.mp4', type: 'video/mp4' }]
      }}
      snowflixOptions={{
        float: 'top-right',
        lang: 'en'
      }}
    />
  );
}
```

**See the complete Next.js demo in [`examples/nextjs-demo`](./examples/nextjs-demo)**

### React/Vue (Traditional)

```javascript
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix';
import 'videojs-snowflix/dist/videojs-snowflix.css';

function VideoPlayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true
    });

    player.snowflix({
      float: 'top-right',
      lang: 'en'
    });

    return () => {
      player.dispose();
    };
  }, []);

  return (
    <video ref={videoRef} className="video-js" crossOrigin="anonymous">
      <source src="video.mp4" type="video/mp4" />
    </video>
  );
}

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `float` | `string` | - | UI panel position (`'top-right'`, `'top-left'`, `'bottom-right'`, `'bottom-left'`) |
| `lang` | `string` | `'en'` | Interface language |
| `targetId` | `string` | - | Custom container element ID |
| `isMuted` | `boolean` | `false` | Initial mute state |
| `debug` | `boolean` | `false` | Enable debug logging to console |

### Debug Mode

Enable debug mode to see detailed console logs for troubleshooting:

```javascript
player.snowflix({
  debug: true,  // Enable debug logging
  float: 'top-right'
});
```

When `debug: true`, the plugin will log:
- Plugin initialization
- Filter activations
- User interactions
- Speech synthesis events
- Storage operations
- WebGL rendering events

**Note:** Keep `debug: false` in production to avoid console pollution.

## Features

- **6 Viewing Modes**: Billboard, TV, Flashlight, Desaturation, Toon, RGB
- **Draggable UI Panel**: Position anywhere on screen
- **Control Bar Button**: Toggle visibility from player controls
- **Persistent Settings**: Saves preferences to localStorage
- **Responsive**: Auto-adjusts to player size

## Demo

A complete Next.js 15 demo application is available in the [`examples/nextjs-demo`](./examples/nextjs-demo) directory.

**To run the demo:**

```bash
cd examples/nextjs-demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the plugin in action with a sample video.

The demo includes:
- Full Next.js 15 App Router integration
- Dynamic imports for SSR compatibility
- TypeScript support
- Tailwind CSS styling
- Sample video with all 6 accessibility filters

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/ssv445/videojs-snowflix-plugin.git
cd videojs-snowflix-plugin

# Install dependencies
npm install

# Development server (localhost:9000)
npm run dev

# Production build
npm run build
```

Output files are generated in the `dist/` folder:
- `dist/videojs-snowflix.min.js` (~1.3MB) - UMD bundle
- `dist/videojs-snowflix.esm.js` (~1.3MB) - ESM bundle
- `dist/videojs-snowflix.css` (55KB) - Extracted CSS styles
- `dist/*.svg`, `dist/*.jpeg`, `dist/*.gif` - Large image assets (>10KB)
- Small assets (fonts, audio, 3D models, shaders, small images <10KB) are inlined as base64

## Requirements

- Video.js 8.0+
- WebGL-capable browser
- CORS-enabled video sources

**Important**:
- Videos must support CORS. Add `crossorigin="anonymous"` to your video element.
- Load Video.js **before** the Snowflix plugin

## Troubleshooting

### "Plugin trying to register before video.js is ready"

Make sure Video.js is loaded before the Snowflix plugin:

```html
<!-- ✅ Correct order -->
<script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
<script src="node_modules/videojs-snowflix/dist/videojs-snowflix.min.js"></script>

<!-- ❌ Wrong order -->
<script src="node_modules/videojs-snowflix/dist/videojs-snowflix.min.js"></script>
<script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
```

With bundlers, ensure Video.js is imported first:

```javascript
// ✅ Correct
import videojs from 'video.js';
import 'videojs-snowflix';

// ❌ Wrong
import 'videojs-snowflix';
import videojs from 'video.js';
```

## License

This project is a port of the Snowflix Kaltura plugin to Video.js.

- **Original work:** Copyright © Snowflix team (https://www.snowflixtv.com/)
- **Video.js port:** Shyam Verma

See [LICENSE](LICENSE) file for details.

## Credits

- Original Snowflix Kaltura plugin by Snowflix team and kandabi
- Ported to Video.js by Shyam Verma
- Built with [Video.js](https://videojs.com/) and [Three.js](https://threejs.org/)

## Links

- [Snowflix Website](https://www.snowflixtv.com/)
- [npm Package](https://www.npmjs.com/package/videojs-snowflix)
- [GitHub Repository](https://github.com/ssv445/videojs-snowflix-plugin)
- [Video.js Docs](https://videojs.com/)
