const path = require('path');
const { merge } = require('webpack-merge');
const { config } = require('./package.json');
const webpackConfig = require('./webpack.config');


module.exports = merge(webpackConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    port: config.devPort,
    host: '0.0.0.0',
    writeToDisk: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
  },
  optimization: { ...webpackConfig.optimization, minimize: false }
})
