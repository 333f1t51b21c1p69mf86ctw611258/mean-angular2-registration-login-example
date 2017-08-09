#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'task_queue';

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
                var q = 'RESPONSE_' + item.pid;
                var msg = {
                    status: 'done'
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