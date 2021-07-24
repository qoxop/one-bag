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
    .filter(item => !ignores.includes(item))
    .map(item => path.relative(cwd, `${calleeDirname}/${item}`));
  console.log(files);
  const head = await git.revparse(['HEAD']);
  const diffInfo = await git.diff(['--name-only', head, lastCommit].concat(files));
  console.log(diffInfo)
  if (!diffInfo || !diffInfo.replace(/\s/g, '')) {
    return false;
  }
  return true;
}
const time = Date.now();
hasDirChange({
  lastCommit: 'f70de79f690a84e45a545b97980e5dd82ea888c2',
  calleeDirname: __dirname,
  ignores: [],
}).then(() => console.log(Date.now() - time))
// git.diff(['--name-only', '9e1678c373a347ecc108560f334107ef2538f028', '46a19a7de42b8f52d2f3996ebd75155b7ea1f7c0',  'tools', 'src']).then(console.log)