const http = require('http');
const shell = require('shelljs');
const dotenv = require('dotenv').config();
const crypto = require('crypto');

const DIST = process.env.DIST;
const REPO = process.env.REPO;
const SECRET = process.env.SECRET;
const URL = process.env.URL;

const CURRENT_BRANCH = `git symbolic-ref --short -q HEAD`;

http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end();
    if (request.headers['x-github-event'] && request.headers['x-github-event'] === 'push') {
        console.log('[github-event] push');

        request.on('data', function (chunk) {
            const SIGNATURE = request.headers['x-hub-signature'];
            if (SIGNATURE == sign(SECRET, chunk.toString()) &&
                URL == request.url) {
                console.log('[verify] successful');
                runCommand();
            } else {
                console.log('[verify] failed');
            }
        });
    }
}).listen(6606, '127.0.0.1');

function sign(secret, data) {
    return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
}

function runCommand() {
    if (!shell.which('git')) {
        shell.echo('[error] this script requires git');
        shell.exit(1);
    }

    // empty dist
    shell.echo('[exec] clean dist');
    shell.rm('-rf', DIST);

    // before install
    shell.cd(REPO);
    if (shell.exec(CURRENT_BRANCH).stdout.trim() !== 'jekyll') {
        shell.echo('[error] Wrong branch');
        shell.exit(1);
    }
    shell.exec('git pull');
    shell.echo('[exec] install all dependencies');
    if (shell.exec('bundle install').code !== 0) {
        shell.echo('[error] bundle install error');
    }
    shell.echo('[exec] build');
    if (shell.exec('jekyll build').code !== 0) {
        shell.echo('[error] jekyll build error');
    }

    // transfer file
    shell.echo('[exec] build ==> dist');
    shell.cp('-r', `${REPO}/_site/`, `${DIST}/`);
}