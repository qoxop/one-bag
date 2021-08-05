const { default: relativePathResolve } = require('relative-path-resolve/lib/tsResovle');
const { src, dest, parallel, series, watch } = require('gulp');
const { getHtmlChunk } = require('./tools');
const { spawn } = require('child_process');
const ts = require('gulp-typescript');
const through2 = require('through2');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');


(() => {
  if (!fs.existsSync(path.resolve(__dirname, './website'))) {
    fs.mkdirSync(path.resolve(__dirname, './website'));
  }
})()

const tsProject = ts.createProject('tsconfig.json', {
  declaration: false,
  module: 'System',
  isolatedModules: true,
});

/**
 * 构建基座库
 */
const buildLibrary = series(
  () => new Promise((resolve, reject) => {
    webpack(require('./webpack.config'), (err, stats) => {
      if (err) {
        return reject();
      }
      process.stdout.write(`${stats.toString({ colors: true, modules: false, children: false, chunks: false, chunkModules: false })}\n\n`)
      stats.hasErrors() ? reject() : resolve();
    })
  }),
  () => src(['dist/**/*']).pipe(dest('.website/'))
)

/**
 * 编译站点的 ts 文件
 * @returns {*}
 */
const buildWebsiteTs = () => {
  return src(["website/**/*.ts", "website/**/*.tsx", "!website/**/*.g.ts"])
    .pipe(through2.obj(function (file, _, cb) {
        const code = relativePathResolve({
          filePath: file.path,
          basePath: path.resolve(__dirname, './website')
        });
        file.contents = Buffer.from(code);
        cb(null, file);
    }))
    .pipe(tsProject())
    .pipe(dest('.website/'));
}

const copyAssets = () => {
  return src(["website/assets/**/*"]).pipe(dest('.website/assets'))
}

/**
 * 编译站点的 html 文件
 * @param cb
 */
const buildWebsiteHtml = (cb) => {
  fs.readFile(path.resolve(__dirname, './website/index.html'), {encoding: 'utf8'},(err, data) => {
    if (err) throw err;
    const { headChunk, bodyChunk } = getHtmlChunk({publicPath: './'});
    const newData = data.replace('<!-- headChunk -->', headChunk).replace('<!-- bodyChunk -->', bodyChunk);
    fs.writeFile(path.resolve(__dirname, '.website/index.html'), newData, (err) => {
      if (err) throw err;
      cb();
    })
  });
}

const dev = () => {
  const cp = spawn('npx', ['webpack', 'server', '--config', './webpack.dev.js']);
  cp.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  cp.stderr.on('data', (data) => {
    console.error(`stderr: ${data.toString()}`);
  });
  watch(['website/**/*'], { ignoreInitial: false }, parallel(buildWebsiteTs, buildWebsiteHtml, copyAssets))
}

module.exports = {
  default: parallel(buildWebsiteTs, buildLibrary, buildWebsiteHtml),
  dev
}
