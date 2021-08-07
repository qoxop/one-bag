const webpack = require('webpack');

const compile = new Promise(((resolve, reject) => {
  webpack(require('./webpack.config'), (err, stats) => {
    if (!err) {
      process.stdout.write(`${stats.toString({ colors: true, modules: false, children: false, chunks: false, chunkModules: false })}\n\n`);
      if (!stats.hasErrors()) {
        resolve()
      }
    }
    reject(err);
  })
}));

compile.then(() => {
  console.log('\n\n构建成功～～～\n\n');
}).catch((err) => {
  console.error(err)
  console.log('\n\n构建失败～～～\n\n');
});

module.exports = compile;