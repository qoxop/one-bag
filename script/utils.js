const fs = require('fs');
const path = require('path');

/**
 * 获取并生成构建文件路径
 * @param {*} dest 
 * @param {*} relativePath 
 * @returns 
 */
const mkDestPath = (dest, relativePath) => {
  const destpath = path.resolve(dest, relativePath);
  const dirpath = path.dirname(destpath);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
  }
  return destpath;
}

/**
 * 获取文件名
 * @param {*} absPath 
 * @returns 
 */
const getFileName = (absPath = '') => absPath.replace(path.dirname(absPath) + '/', '');

/**
 *  模块路径
 * @param {*} name 
 * @returns 
 */
const getModulePath = (name = '') => path.resolve(__dirname, `../node_modules/${name}`);

/**
 * 获取模块版本号
 * @param {*} name 
 * @returns 
 */
const getVersion = (name = '') => {
  const pkgJson = getModulePath(`${name}/package.json`);
  const { version } = require(pkgJson);
  return version;
}

module.exports = {
  mkDestPath,
  getFileName,
  getModulePath,
  getVersion
}