var config = require('config.json');
var express = require('express');
var router = express.Router();

router.get("/testRabbitmq", testRabbitmq);

module.exports = router;

function testRabbitmq(req, res) {
    res.send({
        name: "test test test"
    });
}