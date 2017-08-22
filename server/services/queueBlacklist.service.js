var Q = require('q');
var QueueBlackList = require('../models/queueBlacklist');

var service = {};

service.create = create;

module.exports = service;

function create(model) {
    var deferred = Q.defer();

    createQueueBlacklist();

    function createQueueBlacklist() {
        var queueBlacklist = new QueueBlackList(model);

        queueBlacklist.save(function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });
    }

    return deferred.promise;
}
