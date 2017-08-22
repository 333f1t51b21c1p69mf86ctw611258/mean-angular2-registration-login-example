var appRoot = require('app-root-path');
var config = require(appRoot + '/config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('devices');

var service = {};

service.getAllById = getAllById;
service.create = create;

module.exports = service;

function getAllById(id) {
    var deferred = Q.defer();

    db.devices.find({ id: id }).toArray(function (err, devices) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(devices);
    });

    return deferred.promise;
}

function create(device) {
    var deferred = Q.defer();

    createDevice();

    function createDevice() {
        db.devices.insert(
            device,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
