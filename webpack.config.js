const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

module.exports = (env, argv) => ({
  mode: argv && argv.mode ? argv.mode : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {
    'index': './index',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      'index.html',
      'app-icon.png',
      'app-splash.png',
      'favicon.png',
      'manifest.json',
      'sw.js',
    ]),
  ],
})
