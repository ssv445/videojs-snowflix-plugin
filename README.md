# Video.js Snowflix Plugin

Accessibility plugin for Video.js providing visual effect filters for enhanced viewing.

## Installation

### From npm (Recommended)

```bash
npm install videojs-snowflix
```

### From GitHub

```bash
npm install git+https://github.com/ssv445/videojs-snowflix-plugin.git
```

### From Local Package

```bash
# Option 1: Install from local path
npm install /path/to/videojs-snowflix

# Option 2: Use npm link for development
cd /path/to/videojs-snowflix
npm link
cd /path/to/your-project
npm link videojs-snowflix
```

### Manual Installation

Build and copy distribution files:

```bash
cd videojs-snowflix
npm run build
cp -r dist/* /your-project/public/js/
```

Then include:

```html
<link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet">
<script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
<script src="/js/videojs-snowflix.min.js"></script>
```

## Usage

```html
<video id="my-player" class="video-js" controls crossorigin="anonymous">
  <source src="video.mp4" type="video/mp4">
</video>

<script>
  const player = videojs('my-player');
  player.snowflix({
    float: 'top-right',  // UI position: top-right, top-left, bottom-right, bottom-left
    lang: 'en',          // Language: en (English)
    targetId: null,      // Optional: custom container element ID
    isMuted: false       // Initial audio mute state
  });
</script>
```

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

## Building from Source

```bash
# Install dependencies
npm install

# Development server (localhost:9000)
npm run dev

# Production build
npm run build
```

Output files:
- Development: `dist/videojs-snowflix.js`
- Production: `dist/videojs-snowflix.min.js`
- Assets: Images, 3D models (.glb), audio files are bundled into `dist/`

**Note**: All assets (SVGs, 3D models, audio, fonts) are bundled by webpack. When installing via npm or npm link, all assets are included automatically.

## Requirements

- Video.js 8.0+
- WebGL-capable browser
- CORS-enabled video sources

**Important**: Videos must support CORS. Add `crossorigin="anonymous"` to your video element.

## License

MIT License

This project is a port of the Snowflix Kaltura plugin to Video.js.

- **Original work:** Snowflix team (https://www.snowflixtv.com/)
- **Video.js port:** Shyam Verma

See [LICENSE](LICENSE) file for full details.

## Credits

- Original Snowflix Kaltura plugin by Snowflix team and kandabi
- Ported to Video.js by Shyam Verma
- Built with [Video.js](https://videojs.com/) and [Three.js](https://threejs.org/)

## Links

- [Snowflix Website](https://www.snowflixtv.com/)
- [npm Package](https://www.npmjs.com/package/videojs-snowflix)
- [GitHub Repository](https://github.com/ssv445/videojs-snowflix-plugin)
- [Video.js Docs](https://videojs.com/)
