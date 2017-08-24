var Q = require('q');
var QueueBlackList = require('../models/queueBlacklist');

var service = {};

service.create = create;
service.getListById = getListById;

module.exports = service;

function create(model) {
    var deferred = Q.defer();

    var queueBlacklist = new QueueBlackList(model);

    queueBlacklist.save(function (err) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });

    return deferred.promise;
}

function getListById(id) {
    var deferred = Q.defer();

    QueueBlackList.find({ id: id }, function (err, queueBlacklists) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(queueBlacklists);
    });

    return deferred.promise;
}