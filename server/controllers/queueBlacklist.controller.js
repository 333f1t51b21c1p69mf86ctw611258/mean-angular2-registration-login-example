var appRoot = require('app-root-path');
var config = require('config.json');
var express = require('express');
var router = express.Router();
var queueBlacklistService = require('services/queueBlacklist.service');

var amqp = require('amqplib/callback_api');

//
const md5File = require('md5-file');

//
var multer = require('multer');
var path = require('path');
var fs = require('fs');

var DIR = './uploads/';

var upload = multer({ dest: DIR });
//var upload = multer({ dest: './uploads' });

var upload = multer({
    dest: DIR,
    rename: function (fieldname, filename) {
        return filename + Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
    }
});

// const dest = 'amqp://localhost';
const RABBIT_DEST = 'amqp://test:test@10.72.0.163:5672';

router.get("/testRabbitmq", testRabbitmq);
router.post("/add", add);
router.post("/uploadBlacklistFile", upload.any(), uploadBlacklistFile);
router.get("/getAddResult/:id", getAddResult);

module.exports = router;

function testRabbitmq(req, res) {
    res.send({
        name: "test test test"
    });
}

function uploadBlacklistFile(req, res) {
    let response = [];
    let childFolder = 'blacklist';

    req.files.forEach((file) => {
        let fileName = file.originalname;
        let fileExt = file.originalname.split('.');
        fileExt = fileExt[fileExt.length - 1];
        fileName = file.originalname.split('.');
        fileName.pop();
        fileName = fileName.join('.');

        const md5 = md5File.sync(file.path);

        if (!fs.existsSync(__dirname + `/uploads/${childFolder}`)) {
            fs.mkdirSync(__dirname + `/uploads/${childFolder}`);
        }
        let newPath = __dirname + `/uploads/${childFolder}/${fileName}_${md5}.${fileExt}`;

        fs.rename(file.path, newPath, function (err) { });

        response.push(`{
            "fieldname": "${file.fieldname}",
            "originalname": "${file.originalname}",
            "encoding": "${file.encoding}",
            "mimetype": "${file.mimetype}",
            "destination": "${file.destination}",
            "filename": "${fileName}_${md5}.${fileExt}",
            "path": "${childFolder}/${fileName}.${fileExt}",
            "size": ${file.size},
            "md5": "${md5}"
        }`);
    });

    res.end('[' + response.toString() + ']');
}

function add(req, res) {
    const deviceId = req.body.deviceId;
    const filename = req.body.filename;
    const md5 = req.body.md5;

    //const url = encodeURIComponent(config.apiUrl + '/api/devices/downloadBlacklist?filename=' + filename);
    const url = config.apiUrl + '/api/devices/downloadBlacklist?filename=' + filename;

    const json_queueBlacklist = {
        id: new Date().getTime(),
        app: 'Blacklist',
        deviceId: deviceId,
        type: 'UpdateConfig',
        // date: '2017-08-04T07:29:27.474Z',
        request: {
            url: url,
            md5: md5,
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

function getAddResult(req, res) {
    queueBlacklistService.getListById(req.params.id)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
