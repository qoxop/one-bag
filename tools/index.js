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
  const libDeps = Object.keys(packageJson.dependencies).filter(item => !/^@types\//.test(item));
  const mDeps = Object.keys(mPackageJson.dependencies).reduce((pre, cur) => {
    const key = cur.replace(/^@types\//, '');
    if (!pre.includes(key)) {
      pre.push(key);
    }
    return pre;
  }, []);
  return mDeps.filter(md => libDeps.includes(md)).concat(['systemjs', '@qoxop/react-combo']);
}

module.exports = {
  getHtmlChunk,
  countPeerDeps
}