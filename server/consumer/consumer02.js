#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'X_DASAN_ADDONS_COMMAND';

        ch.assertQueue(q, { durable: true });
        ch.prefetch(1);
        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
        ch.consume(q, function (msg) {
            //var secs = msg.content.toString().split('.').length - 1;

            console.log(' [x] Received request ');

            const item = JSON.parse(msg.content);

            console.log(item);
            console.log('pid: ' + item.pid);

            setTimeout(function () {
                console.log(' [x] Done');
                ch.ack(msg);
            }, 0 * 1000);

            conn.createChannel(function (err, ch) {
                var q = 'X_DASAN_ADDONS_COMMAND_' + item.app;
                var msg = {
                    command: {
                        id: 123,
                        app: 'cli',
                        deviceId: '00d0cb-GPON-DSNW651c10c8',
                        args: {
                            command: 'ls -l',
                        }
                    },
                    date: '2017-08-04T07:29:27.474Z',
                    status: 'sending'
                };

                ch.assertQueue(q, { durable: true });

                ch.sendToQueue(q,
                    new Buffer(JSON.stringify(msg)) //,
                    //{ persistent: true }
                );

                console.log(' [x] Responsed "%s"', msg);
            });
        }, { noAck: false });
    });
});