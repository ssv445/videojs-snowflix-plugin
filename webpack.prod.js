const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// UMD Build (for browsers and CommonJS)
const umdConfig = merge(common, {
  mode: 'production',
  output: {
    filename: 'videojs-snowflix.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'VideojsSnowflix',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
    clean: false, // Don't clean - ESM config will clean first
  },
  externals: {
    'video.js': {
      commonjs: 'video.js',
      commonjs2: 'video.js',
      amd: 'video.js',
      root: 'videojs',
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /^\**!|@preserve|@license|@cc_on/i,
          },
        },
        extractComments: false,
      }),
    ],
  },
});

// ESM Build (for modern bundlers)
const esmConfig = merge(common, {
  mode: 'production',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'videojs-snowflix.esm.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
    clean: true, // Clean dist folder before building
  },
  externals: {
    'video.js': 'video.js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /^\**!|@preserve|@license|@cc_on/i,
          },
        },
        extractComments: false,
      }),
    ],
  },
});

// Build ESM first, then UMD (so UMD clean doesn't remove ESM)
module.exports = [esmConfig, umdConfig];
