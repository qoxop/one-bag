const webpack = require('webpack');

webpack(require('./webpack.config'), (err, stats) => {
  if (err) throw err;
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