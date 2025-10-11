import { defineConfig } from 'vite';
import { resolve } from 'path';
import glsl from 'vite-plugin-glsl';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    glsl({
      include: [
        '**/*.glsl',
        '**/*.vs',
        '**/*.fs',
        '**/*.vert',
        '**/*.frag'
      ],
      compress: false,
      warnDuplicatedImports: true,
      defaultExtension: 'glsl',
      exclude: undefined,
      root: '/'
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/plugin.js'),
      name: 'VideojsSnowflix',
      formats: ['es'],
      fileName: () => 'videojs-snowflix.js'
    },

    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [
        'video.js',
        'three',
        '@tweenjs/tween.js',
        'draggable',
        // Externalize all Three.js submodules
        /^three\//
      ],

      output: {
        // Global variables to use in UMD build for externalized deps
        globals: {
          'video.js': 'videojs',
          'three': 'THREE',
          '@tweenjs/tween.js': 'TWEEN',
          'draggable': 'Draggable'
        },

        // Keep assets in predictable locations
        assetFileNames: (assetInfo) => {
          // CSS files at root level
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name][extname]';
          }

          // Organize all other assets by type in assets/ subdirectory
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name][extname]`;
          }
          if (/\.(mp3|wav|ogg)$/i.test(assetInfo.name)) {
            return `assets/audio/[name][extname]`;
          }
          if (/\.(glb|gltf)$/i.test(assetInfo.name)) {
            return `assets/models/[name][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name][extname]`;
          }

          return `assets/[name][extname]`;
        }
      }
    },

    // Adjust chunk size warning limit for video plugin
    chunkSizeWarningLimit: 1000,

    // Optimize dependencies
    minify: 'terser',
    terserOptions: {
      format: {
        comments: /^\**!|@preserve|@license|@cc_on/i
      }
    },

    // Source maps for debugging
    sourcemap: true,

    // Don't clear dist before build (for incremental builds)
    emptyOutDir: true
  },

  // Asset handling
  assetsInclude: ['**/*.glb', '**/*.gltf'],

  // Public base path - important for asset loading
  base: './',

  // Optimize deps
  optimizeDeps: {
    include: ['three', '@tweenjs/tween.js', 'draggable']
  },

  // Dev server config
  server: {
    port: 9000,
    open: true
  }
});
