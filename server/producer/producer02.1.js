#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

const dest = 'amqp://test:test@10.72.0.163:5672';

var requestLoop = setInterval(function () {
    // request({
    //     url: "http://www.google.com",
    //     method: "GET",
    //     timeout: 10000,
    //     followRedirect: true,
    //     maxRedirects: 10
    // }, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         console.log('sucess!');
    //     } else {
    //         console.log('error' + response.statusCode);
    //     }
    // });

    amqp.connect(dest, function (err, conn) {

        conn.createChannel(function (err, ch) {
            var q = 'X_DASAN_ADDONS_COMMAND';
            var msg = {
                pid: process.pid,
                id: 123,
                app: 'cli',
                deviceId: '00d0cb-GPON-DSNW651c10c8',
                args: {
                    command: 'ls -l',
                }
            };

            ch.assertQueue(q, { durable: true });

            ch.sendToQueue(q,
                new Buffer(JSON.stringify(msg)) //,
                //{ persistent: true }
            );

            console.log(" [x] Sent '%s'", msg);
        });

        setTimeout(function () {
            conn.close();
            // process.exit(0);
        }, 500);
    });
}, 2000);

amqp.connect(dest, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'X_DASAN_ADDONS_COMMAND_cli';

        ch.assertQueue(q, { durable: true });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s.", q);
        ch.consume(q, function (msg) {
            // var secs = msg.content.toString().split('.').length - 1;

            const item = JSON.parse(msg.content);

            console.log(" [x] Received %s", item.status);
            
            setTimeout(function () {
                // console.log(" [x] Done");
                ch.ack(msg);
            }, 1 * 1000);
        }, { noAck: false });
    });
});

console.log('test');

// If you ever want to stop it...  clearInterval(requestLoop)