const chalk = require('chalk');
const shell = require('shelljs');
const dotenv = require('dotenv').config();

const DIST = process.env.DIST;
const REPO = process.env.REPO;
const CURRENT_BRANCH = `git symbolic-ref --short -q HEAD`;

module.exports = function () {
    if (!shell.which('git')) {
        console.log(`${chalk.red('[error]')} this script requires git`);
        shell.exit(1);
    }

    // empty dist
    console.log(`${chalk.green('[exec]')} clean dist`);
    shell.rm('-rf', DIST);

    // before install
    shell.cd(REPO);
    if (shell.exec(CURRENT_BRANCH).stdout.trim() !== 'jekyll') {
        console.log(`${chalk.red('[error]')} Wrong branch`);
        shell.exit(1);
    }
    shell.exec('git pull');
    console.log(`${chalk.green('[exec]')} install all dependencies`);
    if (shell.exec('bundle install').code !== 0) {
        console.log(`${chalk.red('[error]')} bundle install error`);
    }
    console.log(`${chalk.green('[exec]')} build`);
    if (shell.exec('jekyll build').code !== 0) {
        console.log(`${chalk.red('[error]')}  jekyll build error`);
    }

    // transfer file
    console.log(`${chalk.green('[exec]')} build ==> dist`);
    shell.cp('-r', `${REPO}/_site/`, `${DIST}/`);
}
