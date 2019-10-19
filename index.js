const http = require('http');
const dotenv = require('dotenv').config();
const crypto = require('crypto');
const chalk = require('chalk');
const command = require('./command');

const SECRET = process.env.SECRET;
const URL = process.env.URL;

http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('{}');
    if (request.headers['x-github-event'] && request.headers['x-github-event'] === 'push') {
        console.log(`${chalk.green('[github-event]')} push`);

        request.on('data', function (chunk) {
            const SIGNATURE = request.headers['x-hub-signature'];
            if (SIGNATURE == sign(SECRET, chunk.toString()) &&
                URL == request.url) {
                console.log(`${chalk.green('[verify]')} successful`);
                Promise.resolve().then(() => command());
            } else {
                console.log(`${chalk.red('[verify]')} failed`);
            }
        });
    }
}).listen(6606, '127.0.0.1');

function sign(secret, data) {
    return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
}