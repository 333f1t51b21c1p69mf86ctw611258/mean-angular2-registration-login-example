#!/usr/bin/env node

require('rootpath')();

const express = require('express');
const cors = require('cors');
const expressJwt = require('express-jwt');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bluebird = require('bluebird');
const amqp = require('amqplib/callback_api');

// const RABBITMQ = 'amqp://localhost';
const RABBITMQ = 'amqp://test:test@10.72.0.163:5672';
const QUEUE_NAME = 'CMD_OUTPUT_Blacklist';

//
const queueBlacklistService = require('./services/queueBlacklist.service');

//
// const child_process = require('child_process');

const jsonConfig = require('config.json');
const config = require('./config');
const routes = require('./routes');

const app = express();

mongoose.Promise = bluebird; // global.Promise;
mongoose.connect(jsonConfig.connectionString, {
    keepAlive: true,
    reconnectTries: 86,
    useMongoClient: true
});

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

const paths = ['/api/users/authenticate',
    '/api/users/register',
    '/api/devices/runcommand',
    '/api/devices/getResultsById',
    '/api/queueBlacklists/testRabbitmq',
    '/api/queueBlacklists/add',
    '/api/queueBlacklists/uploadBlacklistFile',
    '/api/queueBlacklists/getAddResult',
    '/rest/profile'
];
var reqFilter = function (req) {
    let result = true;

    if (result === false) {
        if (paths.indexOf(req.originalUrl) > -1) {
            result = true;
        } else {
            if (req.originalUrl.startsWith('/api/devices/downloadBlacklist?filename=')) {
                result = true;
            }
        }
    }

    return result;
}

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: jsonConfig.secret,
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}).unless(reqFilter));
// }).unless({
//     path: ['/api/users/authenticate',
//         '/api/users/register',
//         '/api/devices/runcommand',
//         '/api/devices/getResultsById',
//         '/api/devices/downloadBlacklist',
//         '/api/queueBlacklists/testRabbitmq',
//         '/api/queueBlacklists/add',
//         '/api/queueBlacklists/uploadBlacklistFile'
//     ]
// }));

// routes
app.use('/api', routes);
app.use('/api/users', require('./controllers/users.controller'));
app.use('/api/devices', require('./controllers/devices.controller'));
app.use('/api/queueBlacklists', require('./controllers/queueBlacklist.controller'));
// app.use('/api/profiles', require('./controllers/profile.controller'));

// start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

// function spawnAscOutput() {
//     const msg = '86';
//     var workerProcess = child_process.spawn('node', ['server_2.js', msg]);

//     workerProcess.stdout.on('data', function (data) {
//         console.log('stdout: ' + data);
//     });

//     workerProcess.stderr.on('data', function (data) {
//         console.log('stderr: ' + data);
//     });

//     workerProcess.on('close', function (code) {
//         console.log('child process exited with code ' + code);
//     });
// }
// spawnAscOutput();

amqp.connect(RABBITMQ, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(QUEUE_NAME, { durable: true });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s.", QUEUE_NAME);
        ch.consume(QUEUE_NAME, function (msg) {
            // var secs = msg.content.toString().split('.').length - 1;

            const result = JSON.parse(msg.content);

            console.log(" [x] Received:");
            console.log(result);

            queueBlacklistService.create(result)
                .then(function () {
                    console.log(" [x] SUCCESSFUL: Insert to DB");
                })
                .catch(function (err) {
                    console.log(" [x] FAILED: Insert to DB");
                });

            setTimeout(function () {
                // console.log(" [x] Done");
                ch.ack(msg);
            }, 1 * 100);
        }, { noAck: false });
    });
});
