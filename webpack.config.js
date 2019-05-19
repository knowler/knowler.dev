const webpack = require('webpack')
const config = require('sapper/config/webpack.js')
const pkg = require('./package.json')

const mode = process.env.NODE_ENV
const dev = mode === 'development'

const common = {
  mode,
  resolve: {
    extensions: [ '.mjs', '.js', '.json', '.svelte', '.html' ],
    mainFields: [ 'svelte', 'module', 'browser', 'main' ],
  },
}

module.exports = {
  client: {
    ...common,
    entry: config.client.entry(),
    output: config.client.output(),
    module: {
      rules: [
        {
          test: /\.(svelte|html)$/,
          use: {
            loader: 'svelte-loader',
            options: {
              dev,
              hydratable: true,
              hotReload: false,
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode),
      })
    ].filter(Boolean),
    devtool: dev && 'inline-source-map',
  },
  server: {
    ...common,
    entry: config.server.entry(),
    output: config.server.output(),
    target: 'node',
    externals: Object.keys(pkg.dependencies).concat('encoding'),
    module: {
      rules: [
        {
          test: /\.(svelte|html)$/,
          use: {
            loader: 'svelte-loader',
            options: {
              dev,
              css: false,
              generate: 'ssr',
            },
          },
        },
      ],
    },
    performance: { hints: false },
  },
  serviceworker: {
    mode,
    entry: config.serviceworker.entry(),
    output: config.serviceworker.output(),
  },
}
