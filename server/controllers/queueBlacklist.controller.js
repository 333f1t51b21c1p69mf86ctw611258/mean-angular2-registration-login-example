var appRoot = require('app-root-path');
var config = require('config.json');
var express = require('express');
var router = express.Router();
var queueBlacklistService = require('services/queueBlacklist.service');

var amqp = require('amqplib/callback_api');

// const dest = 'amqp://localhost';
const RABBIT_DEST = 'amqp://test:test@10.72.0.163:5672';

router.get("/testRabbitmq", testRabbitmq);
router.post("/add", add);
router.post("/uploadBlacklistFile", uploadBlacklistFile);

module.exports = router;

function testRabbitmq(req, res) {
    res.send({
        name: "test test test"
    });
}

function uploadBlacklistFile(req, res) {
    console.log("TEST");
}

function add(req, res) {
    const json_queueBlacklist = {
        id: new Date().getTime(),
        app: 'Blacklist',
        deviceId: req.body.deviceId,
        status: 'Add',
        // date: '2017-08-04T07:29:27.474Z',
        request: {
            operation: req.body.operation,
            file: req.body.file,
            md5: 'B708DF8FF043D06927AC1A91BA3825A5'
        }
    };

    amqp.connect(RABBIT_DEST, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var queueName = 'VHUB_INPUT';

            ch.assertQueue(queueName, { durable: true });

            ch.sendToQueue(queueName,
                new Buffer(JSON.stringify(json_queueBlacklist)) //,
                //{ persistent: true }
            );

            console.log(" [x] Sent '%s'", JSON.stringify(json_queueBlacklist));
        });

        setTimeout(function () {
            conn.close();

            // process.exit(0);
        }, 500);
    });

    queueBlacklistService.create(json_queueBlacklist).then(function () {
        res.send(json_queueBlacklist);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}
