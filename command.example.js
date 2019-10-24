const chalk = require('chalk');
const shell = require('shelljs');
const dotenv = require('dotenv').config();
const log = require('fancy-log');

const DIST = process.env.DIST;
const REPO = process.env.REPO;
const THEME = `${REPO}/themes/${process.env.THEME}`;

const CURRENT_BRANCH = `git symbolic-ref --short -q HEAD`;

module.exports = function () {
    if (!shell.which('git')) {
        log(`${chalk.red('[error]')} this script requires git`);
        shell.exit(1);
    }

    // before install
    shell.cd(REPO);
    if (shell.exec(CURRENT_BRANCH).stdout.trim() !== 'master') {
        log(`${chalk.red('[error]')} Wrong branch`);
        shell.exit(1);
    }

    log(`${chalk.green('[exec]')} pull the code`);
    shell.exec('git pull');
    shell.exec('git submodule update');

    log(`${chalk.green('[exec]')} install all dependencies`);
    // theme build
    shell.cd(THEME);
    log(`${chalk.green('[exec]')} theme build`);
    if (shell.exec('yarn').code !== 0) {
        log(`${chalk.red('[error]')} theme install error`);
    }
    if (shell.exec('yarn build').code !== 0) {
        log(`${chalk.red('[error]')} theme build error`);
    }
    // project build
    shell.cd(REPO);
    log(`${chalk.green('[exec]')} project build`);
    if (shell.exec('yarn').code !== 0) {
        log(`${chalk.red('[error]')} project install error`);
    }
    if (shell.exec('yarn build').code !== 0) {
        log(`${chalk.red('[error]')} project build error`);
    }

    // empty dist
    log(`${chalk.green('[exec]')} clean dist`);
    shell.rm('-rf', `${DIST}/*`);

    // transfer file
    log(`${chalk.green('[exec]')} build ==> dist`);
    shell.cp('-r', `${REPO}/public/*`, `${DIST}/`);
}