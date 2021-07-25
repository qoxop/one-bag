const path = require('path');
const webpackConfig = require('./webpack.config');
const { config } = require('../package.json');
const { merge } = require('webpack-merge');

module.exports = merge(webpackConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, '../dist'),
    port: config.devPort,
    host: '0.0.0.0',
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
  },
  optimization: { ...webpackConfig.optimization, minimize: false }
})
