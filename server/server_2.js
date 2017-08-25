#!/usr/bin/env node
var queueBlacklistService = require('./services/queueBlacklist.service');

var amqp = require('amqplib/callback_api');

var _config = require('./config.json');

//
var _mongoose = require('mongoose');

_mongoose.Promise = global.Promise;
_mongoose.connect(_config.connectionString, {
    keepAlive: true,
    reconnectTries: 86,
    useMongoClient: true
});

// const dest = 'amqp://localhost';
const RABBITMQ = 'amqp://test:test@10.72.0.163:5672';
const QUEUE_NAME = 'CMD_OUTPUT_Blacklist';

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
