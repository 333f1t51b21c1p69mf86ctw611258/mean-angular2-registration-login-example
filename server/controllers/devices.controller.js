var appRoot = require('app-root-path');
var config = require('config.json');
var express = require('express');
var router = express.Router();
var deviceService = require('services/device.service');

// var url = require('url');

var amqp = require('amqplib/callback_api');

// const dest = 'amqp://localhost';
const dest = 'amqp://test:test@10.72.0.163:5672';

router.get("/testRabbitmq", testRabbitmq);
router.get("/getResultsById", getResultsById);
router.get("/runcommand", runcommand);

router.get("/downloadBlacklist", downloadBlacklist);

module.exports = router;

function downloadBlacklist(req, res) {
    var file = appRoot + '/controllers/uploads/blacklist/' + req.query.filename;
    res.download(file); // Set disposition and send it.
}

function testRabbitmq(req, res) {
    res.send({
        name: "test test test"
    });
}

function getResultsById(req, res) {
    deviceService.getAllById(req.query.id)
        .then(function (devices) {
            res.send(devices);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function runcommand(req, res) {
    // var url_parts = url.parse(req.url, true);
    // var query = url_parts.query;

    console.log(req.query);

    var msg = {
        pid: process.pid,
        id: new Date().getTime(),
        app: req.query.app,
        deviceId: req.query.deviceId,
        args: {
            command: req.query.command,
        }
    };

    amqp.connect(dest, function (err, conn) {

        conn.createChannel(function (err, ch) {
            var q = 'X_DASAN_ADDONS_COMMAND';

            ch.assertQueue(q, { durable: true });

            ch.sendToQueue(q,
                new Buffer(JSON.stringify(msg)) //,
                //{ persistent: true }
            );

            console.log(" [x] Sent '%s'", JSON.stringify(msg));
        });

        setTimeout(function () {
            conn.close();
            // process.exit(0);
        }, 500);
    });

    res.send(msg);
    // res.sendStatus(200);
}

