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

        // Keep CSS files at root level
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name][extname]';
          }
          // All other assets should be inlined, but if any slip through,
          // put them in assets/ folder (though this shouldn't happen with our config)
          return `assets/[name][extname]`;
        }
      }
    },

    // Inline all assets as base64 data URLs (no separate asset files)
    // Set to a very high value to ensure everything is inlined
    assetsInlineLimit: 100000000, // 100MB - effectively inline everything

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

    // Clear dist before build (default behavior)
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
