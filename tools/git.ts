import simpleGit, {SimpleGit} from 'simple-git';
const git: SimpleGit = simpleGit();

git.revparse(['HEAD']).then(console.log)

git.diff(['9e1678c373a347ecc108560f334107ef2538f028', 'a7f71aa8b4dd8775da090ad2f71709be419bbb1d', 'tools'])
