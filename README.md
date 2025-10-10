# Video.js Snowflix Plugin

Accessibility plugin for Video.js providing visual effect filters for enhanced viewing.

## Installation

```bash
npm install videojs-snowflix
```

The package includes both UMD and ESM builds:
- **UMD**: `dist/videojs-snowflix.min.js` (for browsers and CommonJS)
- **ESM**: `dist/videojs-snowflix.esm.js` (for modern bundlers)

Modern bundlers will automatically use the ESM version.

## Usage

### In HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Video.js CSS -->
  <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet">
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
      float: 'top-right',  // Optional: UI position
      lang: 'en'           // Optional: language
    });
  </script>
</body>
</html>
```

### With a Bundler (Webpack, Vite, etc.)

```javascript
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix';

const player = videojs('my-player');
player.snowflix({
  float: 'top-right',
  lang: 'en'
});
```

### In React/Vue/Angular

```javascript
import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-snowflix';

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
| `float` | `string` | - | UI panel position |
| `lang` | `string` | `'en'` | Interface language |
| `targetId` | `string` | - | Custom container element ID |
| `isMuted` | `boolean` | `false` | Initial mute state |

## Features

- **6 Viewing Modes**: Billboard, TV, Flashlight, Desaturation, Toon, RGB
- **Draggable UI Panel**: Position anywhere on screen
- **Control Bar Button**: Toggle visibility from player controls
- **Persistent Settings**: Saves preferences to localStorage
- **Responsive**: Auto-adjusts to player size

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
- `dist/videojs-snowflix.min.js` (~1.6MB) - UMD bundle with all assets embedded
- `dist/videojs-snowflix.esm.js` (~1.6MB) - ESM bundle with all assets embedded
- All assets (images, 3D models, audio, fonts) are inlined as base64

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
