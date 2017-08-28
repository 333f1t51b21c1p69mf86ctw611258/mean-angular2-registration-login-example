const Controller = require('../../lib/controller');
const antiddosFacade = require('./facade');

class AntiddosController extends Controller {}

module.exports = new AntiddosController(antiddosFacade);
