var _q = require('q');
var _mongoose = require('mongoose');
var Schema = _mongoose.Schema;

var schema_queueBlacklist = new Schema({
    id: { type: String, required: false },
    app: { type: String, required: false },
    deviceId: { type: String, required: false },
    status: { type: String, required: false },
    date: { type: Date },
    request: {
        operation: String,
        file: String,
        md5: String
    },
    result: {
        errorCode: Number,
        errorMessage: String,
        resultFile: String
    }
});
schema_queueBlacklist.pre('save', function (next) {
    var currentDate = new Date();

    this.date = currentDate;

    next();
});

module.exports = _mongoose.model('QueueBlacklist', schema_queueBlacklist);

