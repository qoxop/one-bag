const fs = require('fs');
const path = require('path');
const del = require('delete');
const rollup = require('rollup');
const rResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { series, parallel } = require('gulp')
const { dependencies, version } = require('../package.json');
const {  mkDestPath, getFileName,  getVersion } = require('./utils');
const beautify = require('beautify');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript2');

const dest = path.resolve(__dirname, '../libs');

const deps = Object.keys(dependencies);

/**
 * 查找 umd 文件
 * @param {*} packageName 
 * @returns 
 */
function findUmd(packageName) {
  const umdPath = path.resolve(__dirname, '../node_modules/' , `./${packageName}/`, './umd');
  const distPath = path.resolve(__dirname, '../node_modules/' , `./${packageName}/`, './dist');
  if (fs.existsSync(umdPath) || fs.existsSync(distPath)) {
    const files = fs.existsSync(umdPath) ? fs.readdirSync(umdPath) : fs.readdirSync(distPath);
    let targets = files.filter(item => (item.indexOf(`${packageName}.`) === 0 || item.indexOf('redux-toolkit.') === 0))
                       .filter(item => /\.min\.js/.test(item));
    if (targets.length) {
      const filecount = targets.reduce((pre, cur) => {
        let count = 0;
        if (/\.umd\./.test(cur)) {
          count += 2;
        }
        if (/\.production\./.test(cur)) {
          count +=1;
        }
        return pre.concat({ file: cur, count })
      }, []).sort((a, b) => b.count - a.count)[0];
      return path.resolve(
        fs.existsSync(umdPath) ? umdPath : distPath,
        `./${filecount.file}`
      );
    }
    return false;
  }
  return false;
}

const importMap = {};

/**
 * 拷贝 Umd 文件
 * @param {*} cb 
 */
async function CopyUmd(cb) {
  const ps = deps.map(dep => (new Promise((resolve, reject) => {
    const umdFile = findUmd(dep);
    if (umdFile) {
      const destFile = `./${getFileName(umdFile)}@${getVersion(dep)}.js`;
      fs.copyFile(
        umdFile,
        mkDestPath(dest, destFile),
        (err) => {
          if (!err) {
            importMap[dep] = destFile.replace('./', '');
            resolve();
          } else {
            reject();
          }
        }
      )
    } else {
      resolve()
    }
  })));
  Promise.all(ps).then(cb);
}

/**
 * 编译 Qs 模板为 systemjs 模块
 * @param {*} cb 
 */
async function CompileQs(cb) {
  const bundle = await rollup.rollup({
    input: require.resolve('qs'),
    plugins: [
      commonjs(),
      rResolve({
        preferBuiltins: false,
      }),
      terser(),
    ]
  });
  await bundle.write({
    file: mkDestPath(dest, `./qs@${getVersion('qs')}.js`),
    format: 'system',
    exports: 'named'
  });
  importMap['qs'] = `qs@${getVersion('qs')}.js`;
  cb();
}

/**
 * 生成 importMap.json
 * @param {*} cb 
 */
function generatorImportMap(cb) {
  const jsonCode = beautify(JSON.stringify(importMap), {format: 'json'})
  fs.writeFile(mkDestPath(dest, 'importMap.json'), jsonCode, (err) => {
    cb();
  });
}

async function compileMain(cb) {
  const bundle = await rollup.rollup({
    input: path.resolve(__dirname, '../src/index.tsx'),
    plugins: [
      rollupTypescript({
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        check: false
      }),
      rResolve(),
      terser()
    ],
    external: (id) => deps.some(dep => id.indexOf(dep) === 0),
  });
  await bundle.write({
    file: mkDestPath(dest, `react-foundation@${version}.js`),
    format: 'system',
    exports: 'named'
  });
  const bundle2 = await rollup.rollup({
    input: path.resolve(__dirname, '../src/index.tsx'),
    plugins: [
      rollupTypescript({
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
        },
        check: false
      }),
      rResolve(),
      terser()
    ],
    external: (id) => deps.some(dep => id.indexOf(dep) === 0),
  });
  await bundle2.write({
    file: mkDestPath(path.resolve(__dirname, '../dist'), `./index.js`),
    format: 'esm',
    exports: 'named'
  })
  cb();
}
function clear(cb) {
  del([dest, path.resolve(__dirname, '../dist')], {force: true}, (err) => {
    if (!err) {
      cb();
    } else {
      throw err;
    }
  });
}

module.exports.default = series(
  clear,
  parallel(
    CompileQs,
    CopyUmd,
    compileMain
  ),
  generatorImportMap
);
