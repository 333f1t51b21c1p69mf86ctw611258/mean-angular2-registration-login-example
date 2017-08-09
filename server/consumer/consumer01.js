#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://admin:admin@localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'request';

        ch.assertQueue(q, { durable: false });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

        ch.consume(q, function (msg) {

            console.log(" [x] Received request ");
            console.log(JSON.parse(msg.content));

            conn.createChannel(function (err, ch) {
                var q = 'response';
                var data = {
                    status: "done"
                };

                ch.assertQueue(q, { durable: false });

                // Note: on Node 6 Buffer.from(msg) should be used
                ch.sendToQueue(q, new Buffer(JSON.stringify(data)));

                console.log(" [x] Response %s", data);
            });

        }, { noAck: true });
    });
});
