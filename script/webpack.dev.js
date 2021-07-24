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

// Object.assign(webpackConfig, {
  
// });

// const app = express();

// app.use(express.static(path.resolve(__dirname, '../dist'), {
//   setHeaders(res) {
//     res.set('Access-Control-Allow-Origin', "*");
//   }
// }));
// webpack(webpackConfig, (err, stats) => {
//   if (err) throw err
//   process.stdout.write(`${stats.toString({
//       colors: true,
//       modules: false,
//       children: false,
//       chunks: false,
//       chunkModules: false
//   })}\n\n`)
//   if (stats.hasErrors()) {
//       console.error('  Build failed with errors.\n');
//       process.exit(1);
//   }
//   console.log('  构建完成!\n');
// })
// app.listen(config.devPort, () => {
//   console.log(`本地服务 -> http://localhost:${config.devPort}\n`)
// })