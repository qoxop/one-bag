const { getOptions } = require('loader-utils');
const path = require('path');

let flag = false;

let index = 1;
function newName() {
  index++;
  return `_dym__${index}`
}

function parseDeps(options = {}) {
  const packageJson = options.packageJson || require(path.resolve(process.cwd(), './package.json'));
  const { syncs = [], ignores = []} = options;
  const dependenceConfig = packageJson.dependenceConfig || {};
  const dependenciesName = Object.keys(packageJson.dependencies).filter(n => !/^@types\//.test(n)).filter(n => !ignores.includes(n));
  let syncDeps = [];
  let asyncDeps = [];
  dependenciesName.forEach(name => {
    const isSync = (dependenceConfig[name] && dependenceConfig[name].sync) ||
                   (syncs === '*') ||
                   (syncs instanceof Array && syncs.includes(name));
    if (isSync) {
      syncDeps.push(name);
    } else {
      asyncDeps.push(name);
    }
  });
  return { syncDeps, asyncDeps }
}

module.exports = function loader(source) {
  const options = getOptions(this) || {};
  const insertHeader = [];
  if (flag === false) {
    const { templateStr = `/*! Module-Map-Replace */` } = options;
    const { asyncDeps, syncDeps } = parseDeps(options);

    // 插入同步模块
    const syncCode = syncDeps.map(name => {
      const mName = newName();
      insertHeader.push(`import * as ${mName} from '${name}';`);
      return `'${name}': ${mName}`;
    }).join(' ,');

    // 插入异步模块
    const asyncCode = asyncDeps.map(name => `'${name}': () => import("${name}")`).join(' ,');

    // 更新源码
    source = insertHeader.join('\n') + '\n' + source;
    source = source.replace(templateStr, [syncCode, asyncCode].filter(item => !!item).join(' ,'));
    flag = true;
  }
  return source;
};

module.exports.parseDeps  = parseDeps;
module.exports.loaderPath = __filename;