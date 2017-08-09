var amqp = require('amqplib/callback_api');

// RabbitMQ
amqp.connect('amqp://admin:admin@localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'request';
        var data = {
            id: 123,
            app: 'cli',
            deviceId: '00d0cb-GPON-DSNW651c10c8',
            args: {
                command: 'ls -l',
            }
        };

        ch.assertQueue(q, { durable: false });

        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, new Buffer(JSON.stringify(data)));

        console.log(" [x] Request %s", data);
    });

    conn.createChannel(function (err, ch) {
        var q = 'response';

        ch.assertQueue(q, { durable: false });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

        ch.consume(q, function (msg) {

            console.log(" [x] Received response");
            console.log(JSON.parse(msg.content));

        }, { noAck: true });
    });

    setTimeout(
        function () {
            conn.close();
            // process.exit(0);
        }, 50000);
});