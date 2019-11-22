const dotenv = require('dotenv').config();
const crypto = require('crypto');
const chalk = require('chalk');
const command = require('./command');
const log = require('fancy-log');
const express = require('express');
const app = express();

const SECRET = process.env.SECRET;

app.use(express.json())

app.post('/webhook', function (request, response) {
    response.json({
        status: 0,
    });
    if (request.header('x-github-event') && request.header('x-github-event') === 'push') {
        log(`${chalk.green('[github-event]')} push`);
        const SIGNATURE = request.header('x-hub-signature');
        if (SIGNATURE == sign(SECRET, JSON.stringify(request.body))) {
            log(`${chalk.green('[verify]')} successful`);
            Promise.resolve().then(() => command());
        } else {
            log(`${chalk.red('[verify]')} failed`);
        }
    }
});

app.listen(6606, function () {
    console.log('github-webhook listening on port 6606!');
});

function sign(secret, data) {
    return 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');
}