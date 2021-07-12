const simpleGit = require('simple-git');
const git = simpleGit();

git.revparse(['HEAD']).then(console.log)

function hasDiff(lastCommit, calleeDirname) {
  
}

git.diff(['--summary', '9e1678c373', 'a7f71aa8b', 'tools/*']).then(console.log)