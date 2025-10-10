const path = require('path');

module.exports = {
  entry: './src/plugin.js',
  module: {
    rules: [
      //*** Babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      //*** HTML
      {
        test: /\.html$/i,
        exclude: /node_modules/,
        use: ['raw-loader'],
      },
      //*** Fonts, outputs it inline instead of a seperate file.
      {
        test: /\.(woff|woff2)$/i,
        type: 'asset/inline',
      },
      //*** Images - inline as base64 for npm distribution
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/inline',
      },
      //*** Audio - inline as base64 for npm distribution
      {
        test: /\.(mp3|wav)$/i,
        type: 'asset/inline',
      },
      //*** 3D Models - inline as base64 for npm distribution
      {
        test: /\.(glb|gltf)$/i,
        type: 'asset/inline',
      },
      //*** Css
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      //*** Shaders
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader'],
      },
    ],
  },
};
