const git = require('./git');
const packageJson = require('../package.json');

const { config, version } = packageJson;

/**
 * 获取 html 代码片段
 * @param {*} options
 */
 function getHtmlChunk(options = { isDev: false, basepath: config.cdn }) {
  let { isDev = false, basepath = config.cdn } = options;
  if (isDev) {
    basepath = `${config.devHost}:${config.devPort}/`;
  }
  if (!/\/$/.test(basepath)) {
    basepath += '/';
  }
  // head chunk
  const linkCodes = `<link rel="stylesheet" href="${basepath}react-combo@${version}.css">`
  const metadata = JSON.stringify({
    version,
    webpackPublicPath: basepath,
  });
  const metadataCodes = `  <script> window['$__combo_config'] = ${metadata}; </script>`;

  // body chunk
  const scriptCodes = `<script src="${basepath}react-combo@${version}.js"></script>`;

  return {
    headChunk: linkCodes + '\n' + metadataCodes,
    bodyChunk: scriptCodes
  }
}

/**
 * 获取 bundle 信息
 * @returns {{css: string[], js: string[], cdn}}
 */
function getBundleInfos() {
  return {
    cdn: config.cdn,
    css: [`react-combo@${version}.css`],
    js: [`react-combo@${version}.js`],
  }
}

/**
 * 计算依赖的差异
 * @param {*} mPackageJson
 * @returns
 */
function countPeerDeps(mPackageJson) {
  // 过滤本项目以 @type 开头的依赖库
  const libDeps = Object.keys(packageJson.dependencies).filter(item => !/^@types\//.test(item));
  const mDeps = Object.keys(mPackageJson.dependencies).reduce((pre, cur) => {
    // 使用方的依赖处理，@types开头也加入统计
    const key = cur.replace(/^@types\//, '');
    if (!pre.includes(key)) { // 去重
      pre.push(key);
    }
    return pre;
  }, []);
  return mDeps.filter(md => libDeps.includes(md)).concat(['systemjs', packageJson.name]);
}

module.exports = {
  getHtmlChunk,
  countPeerDeps,
  getBundleInfos,
  git,
}
