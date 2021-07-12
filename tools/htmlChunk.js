
const { config, version } = require('../package.json');

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

module.exports = {
  getHtmlChunk
}