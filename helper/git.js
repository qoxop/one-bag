const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const git = simpleGit();

async function hasDirChange({
  lastCommit,
  calleeDirname,
  ignores = []
}) {
  const cwd = process.cwd();
  const files  = (await fs.promises.readdir(calleeDirname))
    .filter(filename => ignores.every(ig => !ig.test(filename)))
    .map(filename => path.relative(cwd, `${calleeDirname}/${filename}`));
  const head = await git.revparse(['HEAD']);
  const diffInfo = await git.diff(['--name-only', head, lastCommit].concat(files));
  if (!diffInfo || !diffInfo.replace(/\s/g, '')) {
    return false;
  }
  return true;
}

module.exports = {
  hasDirChange
}
