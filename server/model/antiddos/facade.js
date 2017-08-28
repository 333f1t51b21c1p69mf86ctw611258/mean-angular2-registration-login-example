const Facade = require('../../lib/facade');
const antiddosSchema = require('./schema');

class AntiddosFacade extends Facade {}

module.exports = new AntiddosFacade(antiddosSchema);
