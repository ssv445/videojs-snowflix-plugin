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
      //*** Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      //*** Audio
      {
        test: /\.(mp3|wav)$/i,
        type: 'asset/resource',
      },
      //*** 3D Models
      {
        test: /\.(glb|gltf)$/i,
        type: 'asset/resource',
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
