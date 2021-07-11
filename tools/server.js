const path = require('path')
const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

Object.assign(webpackConfig, {
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/,
  }
});

const app = express();

app.use(express.static(path.resolve(__dirname, '../dist'), {
  setHeaders(res) {
    res.set('Access-Control-Allow-Origin', "*");
  }
}));
webpack(webpackConfig, (err, stats) => {
  if (err) throw err
  process.stdout.write(`${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
  })}\n\n`)
  if (stats.hasErrors()) {
      console.error('  Build failed with errors.\n');
      process.exit(1)
  }
  console.log('  构建完成!\n');
})
app.listen(3000, () => {
  console.log(`本地服务 -> http://localhost:3000\n`)
})
