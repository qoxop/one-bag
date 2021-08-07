const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');
const { version } = require('../package.json');

if (!process.env.QINIU_AK || !process.env.QINIU_SK) {
  console.error('请自行配置 cdn 相关凭证～');
  process.exit(1);
}

const destPath = path.resolve(process.cwd(), './dist')

const config = new qiniu.conf.Config({
  zone: qiniu.zone.Zone_z0,
});
const mac = new qiniu.auth.digest.Mac(process.env.QINIU_AK, process.env.QINIU_SK);
const putPolicy = new qiniu.rs.PutPolicy({ scope: 'share' });
const uploadToken = putPolicy.uploadToken(mac);
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

/**
 * 读取文件列表
 * @param {*} dir 
 * @returns 
 */
const readFiles = (dir) => {
  const absfiles = [];
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const p = path.resolve(dir, file);
    const fStat = fs.statSync(p);
    if (fStat.isDirectory()) {
      absfiles.push(...readFiles(p));
    } else if (fStat.isFile()) {
      absfiles.push(p)
    }
  });
  return absfiles;
}

/**
 * 单文件上传
 * @param {*} filepath 
 * @returns 
 */
function uploadFile(filepath = '') {
  return new Promise((resolve, reject) => {
    const fileKey = filepath.replace(destPath, `one-bag/v_${version}`);
    formUploader.putFile(uploadToken, fileKey, filepath, putExtra, function(respErr, respBody, respInfo) {
      if (respErr) {
        return reject(respErr);
      }
      if (respInfo.statusCode == 200) {
        console.log(respBody);
        resolve(respBody);
      } else {
        console.info(respInfo.statusCode);
        console.info(respBody);
      }
    });
  });
}

if (fs.existsSync(destPath)) {
  const uploadTasks = readFiles(destPath).map(uploadFile);
  Promise.all(uploadTasks).then(() => {
    console.log('\n\n 同步成功 \n\n');
  }).catch(() => {
    console.error('\n\n 同步失败 \n\n');
    process.exit(1);
  });
} else {
  console.log('\n\n 目录不存在～～～ \n\n');
  process.exit(1);
}