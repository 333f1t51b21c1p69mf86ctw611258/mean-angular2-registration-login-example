#!/usr/bin/env node
var deviceService = require('../services/device.service');

var amqp = require('amqplib/callback_api');

// const dest = 'amqp://localhost';
const dest = 'amqp://test:test@10.72.0.163:5672';

// var requestLoop = setInterval(function () {
//     // request({
//     //     url: "http://www.google.com",
//     //     method: "GET",
//     //     timeout: 10000,
//     //     followRedirect: true,
//     //     maxRedirects: 10
//     // }, function (error, response, body) {
//     //     if (!error && response.statusCode == 200) {
//     //         console.log('sucess!');
//     //     } else {
//     //         console.log('error' + response.statusCode);
//     //     }
//     // });

//     amqp.connect(dest, function (err, conn) {

//         conn.createChannel(function (err, ch) {
//             var q = 'X_DASAN_ADDONS_COMMAND';
//             var msg = {
//                 pid: process.pid,
//                 id: 123,
//                 app: 'CLI',
//                 deviceId: '18d071-H646FW-DSNW6a290900',
//                 args: {
//                     command: 'ls -l',
//                 }
//             };

//             ch.assertQueue(q, { durable: true });

//             ch.sendToQueue(q,
//                 new Buffer(JSON.stringify(msg)) //,
//                 //{ persistent: true }
//             );

//             console.log(" [x] Sent '%s'", msg);
//         });

//         setTimeout(function () {
//             conn.close();
//             // process.exit(0);
//         }, 500);
//     });
// }, 1000);

amqp.connect(dest, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'X_DASAN_ADDONS_COMMAND_CLI';

        ch.assertQueue(q, { durable: true });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s.", q);
        ch.consume(q, function (msg) {
            // var secs = msg.content.toString().split('.').length - 1;

            const result = JSON.parse(msg.content);

            console.log(" [x] Received:");
            console.log(result);

            deviceService.create(result)
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

console.log('test');

// If you ever want to stop it...  clearInterval(requestLoop)