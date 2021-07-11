const { getOptions } = require('loader-utils');
const path = require('path');

let flag = false;

function parseDeps(options = {}) {
  const packageJson = options.packageJson || require(path.resolve(process.cwd(), './package.json'));
  const dependenceConfig = packageJson.dependenceConfig || {};
  const dependenciesName = Object.keys(packageJson.dependencies).filter(n => !/^@types\//.test(n));
  const { syncs = []} = options;
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
  if (flag === false) {
    const { templateStr = `/*! Module-Map-Replace */` } = options;
    const { asyncDeps, syncDeps } = parseDeps(options);
    const syncCode = syncDeps.map(name => `'${name}': require("${name}")`).join(' ,');
    const asyncCode = asyncDeps.map(name => `'${name}': () => import("${name}")`).join(' ,');
    source = source.replace(templateStr, [syncCode, asyncCode].filter(item => !!item).join(' ,'));
    flag = true;
  }
  return source;
};

module.exports.parseDeps  = parseDeps;
module.exports.loaderPath = __filename;