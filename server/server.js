﻿#!/usr/bin/env node

require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var _config = require('config.json');
var _mongoose = require('mongoose');

//
const child_process = require('child_process');

_mongoose.Promise = global.Promise;
_mongoose.connect(_config.connectionString, {
    keepAlive: true,
    reconnectTries: 86,
    useMongoClient: true
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var reqFilter = function (req) {
    let result = true;

    return result;
}

// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: _config.secret,
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
app.use('/api/users', require('./controllers/users.controller'));
app.use('/api/devices', require('./controllers/devices.controller'));
app.use('/api/queueBlacklists', require('./controllers/queueBlacklist.controller'));

// start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});

function spawnAscOutput() {
    const msg = '86';
    var workerProcess = child_process.spawn('node', ['server_2.js', msg]);

    workerProcess.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    workerProcess.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}
// spawnAscOutput();