var appRoot = require('app-root-path');
var config = require('config.json');
var express = require('express');
var router = express.Router();
var queueBlacklistService = require('services/queueBlacklist.service');
const profileFacade = require('../model/profile/facade');
var mongoose = require('mongoose');
var async = require('async');

const fileService = require('services/file.service');

var amqp = require('amqplib/callback_api');

var fs = require('fs');

// const dest = 'amqp://localhost';
const RABBIT_DEST = 'amqp://test:test@10.72.0.163:5672';

router.post("/add", add);
router.post("/uploadBlacklistFile", fileService.multipart.any(), uploadBlacklistFile);
router.get("/getAddResult/:id", getAddResult);

module.exports = router;

function uploadBlacklistFile(req, res) {
    let childFolder = 'blacklist';

    const jsonUpload = fileService.saveFirstUploadedFile(req, res, childFolder);

    res.end(JSON.stringify(jsonUpload));
}

function add(req, res) {
    const deviceId = req.body.deviceId;
    const redirectContent = req.body.redirectContent;
    const selectedProfileIds = req.body.selectedProfileIds;

    let arrSelectedProfileIds = selectedProfileIds.split(',');

    let blackIps = [];

    // 1st para in async.each() is the array of items
    async.each(arrSelectedProfileIds,
        // 2nd param is the function that each item is passed to
        function (item, callback) {
            console.log(item);
            profileFacade.findById(item)
                .then((doc) => {
                    if (!doc) {
                        console.log("Load Failed");
                    }

                    doc.blackIps.forEach(function (element) {
                        blackIps.push(element);
                    }, this);

                    callback();
                })
                .catch(err => console.log(err));

            // // Call an asynchronous function, often a save() to DB
            // item.someAsyncCall(function () {
            //     // Async call is done, alert via callback
            //     callback();
            // });
        },
        // 3rd param is the function to call when everything's done
        function (err) {
            // All tasks are done now
            // doSomethingOnceAllAreDone();
            console.log(blackIps);

            const queueItemId = new Date().getTime();
            const filename = queueItemId + ".txt";

            let fileContent = '';
            blackIps.forEach(function(element) {
                fileContent += element.blackIp + '\r\n';
            }, this);

            const filePath = fileService.DIR_UPLOAD_ABSOLUTE + '/blacklist/' + filename;
            fs.writeFileSync(filePath, fileContent, 'utf8');

            //const url = encodeURIComponent(config.apiUrl + '/api/devices/downloadBlacklist?filename=' + filename);
            const url = config.apiUrl + '/api/devices/downloadBlacklist?filename=' + filename;

            const json_queueBlacklist = {
                id: queueItemId,
                app: 'Blacklist',
                deviceId: deviceId,
                redirectContent: redirectContent,
                type: 'UpdateConfig',
                // date: '2017-08-04T07:29:27.474Z',
                request: {
                    url: url,
                    md5: '239847sodkfjs23434kdsjfsdf2332',
                    username: 'abc',
                    password: '123456',
                    fileSize: 12345
                }
            };

            amqp.connect(RABBIT_DEST, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    var queueName = 'CMD_INPUT';

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
    );
}

function getAddResult(req, res) {
    queueBlacklistService.getListById(req.params.id)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
