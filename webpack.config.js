//"start": "webpack --progress --colors --display-error-details && node ./bin/app.bundle.js"

const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

const config = {
  target: 'node',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
};

module.exports = config;

