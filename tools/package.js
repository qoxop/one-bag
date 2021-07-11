const packageJson = require('../package.json');

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
  countPeerDeps
}