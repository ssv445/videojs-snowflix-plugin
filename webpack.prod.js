const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
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
    clean: true,
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
        extractComments: false, // Don't extract comments to separate file
      }),
    ],
  },
});
